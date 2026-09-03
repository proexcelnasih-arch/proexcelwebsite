import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), 'app/.env.local'), override: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!url || !serviceKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function runSanityChecks() {
  console.log('============================================================');
  console.log('STEP 7: SANITY CHECKS FOR "cahier-carnet-bloc-note"');
  console.log('============================================================');

  // 1. Get Category ID
  const { data: cat, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', 'cahier-carnet-bloc-note')
    .single();

  if (catErr || !cat) {
    console.error('Category not found:', catErr);
    process.exit(1);
  }
  console.log(`Checking category: ${cat.name} (id: ${cat.id})`);

  // Total products in category
  const { count: totalProds } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', cat.id);
  console.log(`Total products assigned to category: ${totalProds}`);

  // Query 1: price <= 0 or price > 2000
  const { data: badPrices, error: pErr } = await supabase
    .from('products')
    .select('id, name, price')
    .eq('category_id', cat.id)
    .or('price.lte.0,price.gt.2000');

  console.log('\n[Check 1] Products with price <= 0 or price > 2000:');
  console.log(`Result count: ${badPrices?.length || 0}`);
  if (badPrices && badPrices.length > 0) {
    console.table(badPrices);
  }

  // Query 2: duplicates by name
  const { data: allCatProds } = await supabase
    .from('products')
    .select('id, name')
    .eq('category_id', cat.id);

  const nameCounts = new Map<string, number>();
  for (const p of allCatProds || []) {
    nameCounts.set(p.name, (nameCounts.get(p.name) || 0) + 1);
  }
  const duplicates = [...nameCounts.entries()].filter(([_, count]) => count > 1);

  console.log('\n[Check 2] Products with duplicate names:');
  console.log(`Duplicate name groups: ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.table(duplicates.map(([name, count]) => ({ name, count })));
  }

  // Query 3: products missing product_images
  const { data: prodsWithoutImages } = await supabase
    .from('products')
    .select('id, name, product_images(id, url)')
    .eq('category_id', cat.id);

  const missingImgs = (prodsWithoutImages || []).filter(
    (p) => !p.product_images || (p.product_images as any[]).length === 0
  );

  console.log('\n[Check 3] Products without product_images:');
  console.log(`Result count: ${missingImgs.length}`);
  if (missingImgs.length > 0) {
    console.log(missingImgs.slice(0, 5));
  }

  // Query 4: hotlinked mylibrairie URLs in product_images
  const { count: hotlinkCount, error: hlErr } = await supabase
    .from('product_images')
    .select('id', { count: 'exact', head: true })
    .like('url', 'https://mylibrairie.ma/%');

  console.log('\n[Check 4] Total remaining hotlinks in product_images table:');
  console.log(`Hotlink count: ${hotlinkCount || 0}`);

  const passed =
    (badPrices?.length || 0) === 0 &&
    duplicates.length === 0 &&
    missingImgs.length === 0 &&
    (hotlinkCount || 0) === 0;

  console.log('\n============================================================');
  console.log(`OVERALL SANITY CHECK STATUS: ${passed ? '✓ ALL CHECKS PASSED' : '✗ SOME CHECKS FAILED'}`);
  console.log('============================================================');
}

runSanityChecks().catch(console.error);
