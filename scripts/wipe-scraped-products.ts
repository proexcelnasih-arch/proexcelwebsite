import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

function loadEnv() {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'app/.env.local'),
    path.resolve(__dirname, '../app/.env.local'),
    path.resolve(__dirname, '../.env.local'),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }
}

loadEnv();

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function wipeScraped() {
  console.log('=== 1. VERIFYING COUNTS BEFORE WIPE ===');
  
  const { count: totalBefore } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: scrapedCountInitial } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .like('sku', 'PE-%');

  console.log(`Total Products: ${totalBefore}`);
  console.log(`Scraped Products (PE-%): ${scrapedCountInitial}`);
  console.log(`Seed Products: ${(totalBefore || 0) - (scrapedCountInitial || 0)}`);

  // 2. SAFETY CHECK
  console.log('\n=== 2. SAFETY CHECK: ORDER ITEMS ===');
  const { data: orderItems, error: oiErr } = await supabase
    .from('order_items')
    .select('id, product_id, products!inner(sku)')
    .like('products.sku', 'PE-%');

  if (oiErr) {
    console.error('Error checking order items:', oiErr);
    process.exit(1);
  }

  if (orderItems && orderItems.length > 0) {
    console.error(`ABORT: Found ${orderItems.length} order items referencing scraped products!`);
    process.exit(1);
  }
  console.log('Safety check passed: 0 order items reference scraped products.');

  // 3. WIPE LOOP
  console.log('\n=== 3. WIPE SCRAPED IMAGES & PRODUCTS ===');
  while (true) {
    const { data: scrapedBatch, error: fetchErr } = await supabase
      .from('products')
      .select('id')
      .like('sku', 'PE-%')
      .limit(1000);

    if (fetchErr) {
      console.error('Error fetching scraped products:', fetchErr);
      process.exit(1);
    }

    if (!scrapedBatch || scrapedBatch.length === 0) {
      break;
    }

    const scrapedIds = scrapedBatch.map((p) => p.id);
    const chunkSize = 200;

    for (let i = 0; i < scrapedIds.length; i += chunkSize) {
      const chunk = scrapedIds.slice(i, i + chunkSize);
      await supabase.from('product_images').delete().in('product_id', chunk);
      await supabase.from('products').delete().in('id', chunk);
    }
    console.log(`Deleted batch of ${scrapedIds.length} products & images...`);
  }

  // 5. VERIFY FINAL COUNT
  console.log('\n=== 5. VERIFYING FINAL COUNTS ===');
  const { count: totalAfter } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: scrapedAfter } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .like('sku', 'PE-%');

  console.log(`Final Total Products: ${totalAfter}`);
  console.log(`Final Scraped Products (PE-%): ${scrapedAfter}`);
  console.log(`Seed Products Remaining: ${totalAfter}`);

  if (scrapedAfter === 0 && totalAfter === 26) {
    console.log('\n SUCCESS: Catalog successfully wiped back to original 26 seed products!');
  } else {
    console.log(`\n Note: Final count is ${totalAfter} products (expected 26). Scraped left: ${scrapedAfter}`);
  }
}

wipeScraped().catch(console.error);
