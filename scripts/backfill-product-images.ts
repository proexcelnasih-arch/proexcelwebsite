/**
 * ProExcel — Backfill Product Images to Supabase Storage
 *
 * Downloads raw mylibrairie images server-side, re-uploads them to the public "product-images" bucket,
 * and updates database rows to point to the new Supabase Storage public URLs.
 * Handles both:
 * 1. product_images with raw external URLs
 * 2. products with pending_image_source
 *
 * Usage:
 *   npx tsx scripts/backfill-product-images.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), 'app/.env.local'), override: true });

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function backfillProductImages() {
  console.log('============================================================');
  console.log('PROEXCEL PRODUCT IMAGES BACKFILL (mylibrairie.ma → Supabase Storage)');
  console.log('============================================================');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('[FATAL] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // 1. Fetch pending products
  console.log('Querying products with pending_image_source...');
  const { data: pendingProducts, error: pendingErr } = await supabase
    .from('products')
    .select('id, name, slug, pending_image_source')
    .not('pending_image_source', 'is', null);

  if (pendingErr) {
    console.error('[ERROR] Failed to query pending products:', pendingErr.message);
  }

  // 2. Fetch raw product_images rows
  console.log('Querying product_images with raw external URLs...');
  const { data: rawImgRows, error: rawImgErr } = await supabase
    .from('product_images')
    .select('id, product_id, url, is_primary, products(id, name, slug)')
    .like('url', 'https://mylibrairie.ma/%');

  if (rawImgErr) {
    console.error('[ERROR] Failed to query product_images:', rawImgErr.message);
  }

  const pendingList = pendingProducts || [];
  const rawImgList = rawImgRows || [];

  console.log(`Found ${pendingList.length} products with pending images.`);
  console.log(`Found ${rawImgList.length} image rows with raw external URLs.\n`);

  if (pendingList.length === 0 && rawImgList.length === 0) {
    console.log('Nothing to backfill. All product images are clean!');
    return;
  }

  let backfilledCount = 0;
  let failedCount = 0;

  // Process pending products
  for (let i = 0; i < pendingList.length; i++) {
    const prod = pendingList[i];
    const rawUrl = prod.pending_image_source;
    if (!rawUrl) continue;

    try {
      const res = await fetch(rawUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const contentType = res.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await res.arrayBuffer());

      let ext = 'jpg';
      if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('webp')) ext = 'webp';

      const filename = `${prod.slug}-${Date.now()}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, buffer, { contentType, upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);

      const storageUrl = publicUrlData.publicUrl;

      // Upsert product_images row
      const { data: existingImg } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', prod.id)
        .maybeSingle();

      if (existingImg) {
        await supabase
          .from('product_images')
          .update({ url: storageUrl, alt_text: prod.name, is_primary: true, updated_at: new Date().toISOString() })
          .eq('id', existingImg.id);
      } else {
        await supabase.from('product_images').insert({
          product_id: prod.id,
          url: storageUrl,
          alt_text: prod.name,
          is_primary: true,
          display_order: 0,
        });
      }

      // Update product
      await supabase
        .from('products')
        .update({
          needs_manual_image: false,
          pending_image_source: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', prod.id);

      backfilledCount++;
      console.log(`✓ [Pending ${i + 1}/${pendingList.length}] Backfilled: "${prod.name}" → ${storageUrl}`);
      await sleep(350);
    } catch (err: any) {
      failedCount++;
      console.warn(`✗ [Pending ${i + 1}/${pendingList.length}] Failed: "${prod.name}" (${err.message}).`);
      await sleep(350);
    }
  }

  // Process raw product_images rows
  for (let i = 0; i < rawImgList.length; i++) {
    const row = rawImgList[i];
    const product = row.products as any;
    const productName = product?.name || `Product #${row.product_id}`;
    const productSlug = product?.slug || `product-${row.product_id}`;
    const rawUrl = row.url;

    try {
      const res = await fetch(rawUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const contentType = res.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await res.arrayBuffer());

      let ext = 'jpg';
      if (contentType.includes('png')) ext = 'png';
      else if (contentType.includes('webp')) ext = 'webp';

      const filename = `${productSlug}-${i + 1}.${ext}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filename, buffer, { contentType, upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path);

      const storageUrl = publicUrlData.publicUrl;

      await supabase
        .from('product_images')
        .update({ url: storageUrl, updated_at: new Date().toISOString() })
        .eq('id', row.id);

      if (row.product_id) {
        await supabase
          .from('products')
          .update({
            needs_manual_image: false,
            pending_image_source: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.product_id);
      }

      backfilledCount++;
      console.log(`✓ [Raw ${i + 1}/${rawImgList.length}] Backfilled: "${productName}" → ${storageUrl}`);
    } catch (err: any) {
      failedCount++;
      console.warn(`✗ [Raw ${i + 1}/${rawImgList.length}] Failed: "${productName}" (${err.message}). Moving to manual queue.`);

      await supabase.from('product_images').delete().eq('id', row.id);
      if (row.product_id) {
        await supabase
          .from('products')
          .update({
            needs_manual_image: true,
            pending_image_source: rawUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', row.product_id);
      }
    }
  }

  console.log('\n============================================================');
  console.log('BACKFILL COMPLETE');
  console.log('============================================================');
  console.log(`${backfilledCount} images backfilled successfully, ${failedCount} failed and moved to manual queue.`);
}

backfillProductImages().catch((err) => {
  console.error('[FATAL]:', err);
  process.exit(1);
});
