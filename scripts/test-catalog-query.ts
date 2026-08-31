import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), 'app/.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log('Using URL:', supabaseUrl);

const supabaseAnon = createClient(supabaseUrl!, anonKey || serviceKey!);

async function testQuery() {
  console.log('\n--- 1. Testing Anon Client Query (What storefront sees) ---');
  const { data, count, error } = await supabaseAnon
    .from('products')
    .select('id, name, sku, price, is_active, product_images(id, url, is_primary, display_order)', { count: 'exact' })
    .eq('is_active', true)
    .limit(20);

  if (error) {
    console.error('Anon query error:', error);
  } else {
    console.log(`Anon query returned ${data?.length} products (total count: ${count}).`);
    for (const p of data?.slice(0, 10) || []) {
      console.log(`Product: "${p.name}" (SKU: ${p.sku})`);
      console.log(`  product_images array:`, p.product_images);
    }
  }

  console.log('\n--- 2. Checking RLS policies on product_images ---');
  const { data: imgData, error: imgErr } = await supabaseAnon
    .from('product_images')
    .select('id, url, product_id')
    .limit(5);

  if (imgErr) {
    console.error('Anon image query error:', imgErr);
  } else {
    console.log(`Anon client fetched ${imgData?.length} rows from product_images:`, imgData);
  }
}

testQuery().catch(console.error);
