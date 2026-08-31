import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), 'app/.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('[FATAL] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function auditAndActivate() {
  console.log('============================================================');
  console.log('PROEXCEL BATCH QUALITY AUDIT & BULK ACTIVATION');
  console.log('============================================================');

  // 1. Fetch all PE-% products
  const { data: peProducts, error: fetchErr } = await supabase
    .from('products')
    .select('id, name, slug, sku, price, is_active, needs_manual_image')
    .like('sku', 'PE-%')
    .limit(1000);

  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    process.exit(1);
  }

  const list = peProducts || [];
  console.log(`Total PE-% products in database: ${list.length}`);

  // 2. Price sanity check: (price <= 0 or price > 2000)
  const abnormalPrices = list.filter((p) => p.price <= 0 || p.price > 2000);
  console.log(`\n1. Price Sanity Check (price <= 0 or price > 2000): ${abnormalPrices.length} flagged`);
  abnormalPrices.forEach((p) => console.log(`   - "${p.name}": ${p.price} MAD (SKU: ${p.sku})`));

  // 3. Duplicate names check
  const nameCounts = new Map<string, typeof list>();
  for (const p of list) {
    const key = p.name.trim().toLowerCase();
    const arr = nameCounts.get(key) || [];
    arr.push(p);
    nameCounts.set(key, arr);
  }

  const duplicates: { name: string; items: typeof list }[] = [];
  for (const [name, items] of nameCounts.entries()) {
    if (items.length > 1) {
      duplicates.push({ name, items });
    }
  }

  console.log(`\n2. Duplicate Names Check: ${duplicates.length} duplicate groups found`);
  const duplicateIdsToSkip = new Set<string>();
  duplicates.forEach((d) => {
    console.log(`   - "${d.name}" (${d.items.length} occurrences)`);
    // Keep the first one, mark subsequent ones
    d.items.slice(1).forEach((item) => duplicateIdsToSkip.add(item.id));
  });

  // 4. Images check: verify product_images exist for each PE-% product
  const { data: allImages, error: imgErr } = await supabase
    .from('product_images')
    .select('id, product_id, url')
    .limit(5000);

  if (imgErr) {
    console.error('Image fetch error:', imgErr);
    process.exit(1);
  }

  const imgProductIds = new Set((allImages || []).map((img) => img.product_id));
  const missingImages = list.filter((p) => !imgProductIds.has(p.id));
  console.log(`\n3. Missing Product Images Check: ${missingImages.length} products without images`);
  missingImages.forEach((p) => console.log(`   - "${p.name}" (ID: ${p.id})`));

  // 5. External hotlink check (MUST be 0)
  const rawHotlinks = (allImages || []).filter((img) => img.url?.startsWith('https://mylibrairie.ma/'));
  console.log(`\n4. Raw mylibrairie.ma Hotlinks in product_images: ${rawHotlinks.length}`);

  // 6. Bulk Activation of Clean Products
  const cleanToActivate: string[] = [];
  for (const p of list) {
    const isPriceOk = p.price > 0 && p.price <= 2000;
    const isNotDuplicate = !duplicateIdsToSkip.has(p.id);
    const hasImage = imgProductIds.has(p.id);
    const manualFlagOk = !p.needs_manual_image;

    if (isPriceOk && isNotDuplicate && hasImage && manualFlagOk) {
      cleanToActivate.push(p.id);
    }
  }

  console.log(`\n============================================================`);
  console.log(`ACTIVATION CANDIDATES: ${cleanToActivate.length} of ${list.length}`);
  console.log(`============================================================`);

  // Activate in chunks of 100
  const chunkSize = 100;
  let activatedCount = 0;
  for (let i = 0; i < cleanToActivate.length; i += chunkSize) {
    const chunk = cleanToActivate.slice(i, i + chunkSize);
    const { error: actErr, count } = await supabase
      .from('products')
      .update({ is_active: true, updated_at: new Date().toISOString() }, { count: 'exact' })
      .in('id', chunk);

    if (actErr) {
      console.error(`Error activating chunk ${i}:`, actErr);
    } else {
      activatedCount += count || chunk.length;
    }
  }

  console.log(`\nSuccessfully activated ${activatedCount} products in catalog!`);

  // 7. Verify Live Stats
  const { count: totalActive } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: totalInactive } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', false);

  console.log('\n--- FINAL CATALOG OVERVIEW ---');
  console.log(`Active Products (Live):   ${totalActive}`);
  console.log(`Inactive Products (Draft): ${totalInactive}`);
  console.log(`Total Products:           ${(totalActive || 0) + (totalInactive || 0)}`);
}

auditAndActivate().catch(console.error);
