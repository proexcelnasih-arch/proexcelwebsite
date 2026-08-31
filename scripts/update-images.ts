/**
 * ProExcel — Forcefully Update All Products With Scraped Images
 *
 * Reads scraped_products.json, matches products in Supabase by name/slug,
 * and updates them to active status with direct image mapping.
 *
 * Usage:
 *   npx tsx scripts/update-images.ts
 *   npx tsx scripts/update-images.ts --file=scraped_products.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// ── 1. Load Environment Variables ─────────────────────────────
function loadEnv() {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'app/.env.local'),
    path.resolve(__dirname, '../app/.env.local'),
    path.resolve(__dirname, '../.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'app/.env'),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }
}

loadEnv();

// ── 2. Helper Functions ─────────────────────────────────────────
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents/diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

interface ScrapedItem {
  name: string;
  price: number;
  source_image_url: string;
  category_slug: string;
  source_category_path?: string;
}

// ── 3. Main Update Routine ──────────────────────────────────────
async function updateProductImages() {
  console.log('============================================================');
  console.log('PROEXCEL PRODUCT IMAGE FORCE-UPDATE TOOL');
  console.log('============================================================');

  // 1. Initialize Supabase with Service Role Key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('[FATAL] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('[AUTH] Connected to Supabase with Service Role Key (RLS bypassed).');

  // 2. Resolve Input JSON File
  let inputFile = 'scraped_products.json';
  const fileArg = process.argv.find((arg) => arg.startsWith('--file='));
  if (fileArg) {
    inputFile = fileArg.split('=')[1].trim();
  }

  const candidatePaths = [
    path.isAbsolute(inputFile) ? inputFile : path.resolve(process.cwd(), inputFile),
    path.resolve(process.cwd(), 'scraped_products.json'),
    path.resolve(process.cwd(), 'app/scraped_products.json'),
    path.resolve(__dirname, '../scraped_products.json'),
  ];

  let resolvedFilePath = candidatePaths.find((p) => fs.existsSync(p));

  if (!resolvedFilePath) {
    console.error(`[FATAL] Could not find "${inputFile}". Looked in:`, candidatePaths);
    process.exit(1);
  }

  console.log(`[FILE] Reading products from: ${resolvedFilePath}`);
  const rawData = fs.readFileSync(resolvedFilePath, 'utf-8');
  const items: ScrapedItem[] = JSON.parse(rawData);

  if (!Array.isArray(items) || items.length === 0) {
    console.log('[WARN] JSON file contains 0 items. Exiting.');
    return;
  }

  console.log(`[FILE] Loaded ${items.length} items to process.`);

  // 3. Fetch All Existing Products from Database
  console.log('\nFetching all existing products from Supabase...');
  const { data: dbProducts, error: fetchError } = await supabase
    .from('products')
    .select('id, name, slug, sku, is_active, needs_manual_image')
    .range(0, 5000);

  if (fetchError) {
    console.error('[FATAL] Failed to fetch products from Supabase:', fetchError.message);
    process.exit(1);
  }

  const productList = dbProducts || [];
  console.log(`Found ${productList.length} products currently in database.`);

  // Build high-performance lookup maps
  const exactNameMap = new Map<string, (typeof productList)[0]>();
  const normalizedNameMap = new Map<string, (typeof productList)[0]>();
  const slugMap = new Map<string, (typeof productList)[0]>();
  const baseSlugMap = new Map<string, (typeof productList)[0]>();

  for (const prod of productList) {
    exactNameMap.set(prod.name.toLowerCase().trim(), prod);
    normalizedNameMap.set(normalize(prod.name), prod);
    slugMap.set(prod.slug.toLowerCase().trim(), prod);

    const baseSlug = prod.slug.replace(/-\d+$/, '').toLowerCase().trim();
    if (!baseSlugMap.has(baseSlug)) {
      baseSlugMap.set(baseSlug, prod);
    }
  }

  // 4. Asynchronously Update All Products Without Stopping
  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  console.log('\n--- Processing Products ---');

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rawName = item.name?.trim();
    const imageUrl = item.source_image_url?.trim();

    if (!rawName) {
      skippedCount++;
      continue;
    }

    // Match product in DB: Exact Name -> Normalized Name -> Slug -> Base Slug
    const matchedProduct =
      exactNameMap.get(rawName.toLowerCase()) ||
      normalizedNameMap.get(normalize(rawName)) ||
      slugMap.get(slugify(rawName)) ||
      baseSlugMap.get(slugify(rawName));

    if (!matchedProduct) {
      // Product not present in DB
      skippedCount++;
      continue;
    }

    try {
      // 1. Update Product: is_active = true, needs_manual_image = false, pending_image_source = null
      const { error: prodUpdateError } = await supabase
        .from('products')
        .update({
          is_active: true,
          needs_manual_image: false,
          pending_image_source: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', matchedProduct.id);

      if (prodUpdateError) {
        throw new Error(`Product update error: ${prodUpdateError.message}`);
      }

      // 2. Map Image into product_images
      if (imageUrl) {
        const { data: existingImg } = await supabase
          .from('product_images')
          .select('id')
          .eq('product_id', matchedProduct.id)
          .maybeSingle();

        if (existingImg) {
          const { error: imgUpdateError } = await supabase
            .from('product_images')
            .update({
              url: imageUrl,
              alt_text: rawName,
              is_primary: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingImg.id);

          if (imgUpdateError) {
            throw new Error(`Image update error: ${imgUpdateError.message}`);
          }
        } else {
          const { error: imgInsertError } = await supabase
            .from('product_images')
            .insert({
              product_id: matchedProduct.id,
              url: imageUrl,
              alt_text: rawName,
              is_primary: true,
              display_order: 0,
            });

          if (imgInsertError) {
            throw new Error(`Image insert error: ${imgInsertError.message}`);
          }
        }
      }

      updatedCount++;
      console.log(`✓ [${i + 1}/${items.length}] Updated: "${matchedProduct.name}" → is_active: true | Image: ${imageUrl || '(none)'}`);
    } catch (err: any) {
      errorCount++;
      console.error(`✗ [${i + 1}/${items.length}] Failed updating "${rawName}":`, err.message || err);
      // Keep going asynchronously without halting execution
    }
  }

  // 5. Final Summary
  console.log('\n============================================================');
  console.log('FORCE UPDATE COMPLETE');
  console.log('============================================================');
  console.log(`Total items in JSON:           ${items.length}`);
  console.log(`Products successfully updated: ${updatedCount}`);
  console.log(`Items skipped (not in DB):     ${skippedCount}`);
  console.log(`Errors encountered:            ${errorCount}`);
  console.log('============================================================\n');
}

// Execute routine
updateProductImages().catch((err) => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
