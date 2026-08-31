import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), 'app/.env.local'), override: true });

async function verify() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  const supabase = createClient(supabaseUrl!, serviceKey!);

  console.log('--- 1. Checking for any remaining raw mylibrairie.ma URLs ---');
  const { count: rawCount, error: rawError } = await supabase
    .from('product_images')
    .select('*', { count: 'exact', head: true })
    .like('url', 'https://mylibrairie.ma/%');

  console.log(`Raw mylibrairie.ma URLs count: ${rawCount} (Expected: 0)`);

  console.log('\n--- 2. Checking Supabase Storage URLs in product_images ---');
  const { data: storageImages, count: storageCount, error: stError } = await supabase
    .from('product_images')
    .select('id, url, is_primary, products(name, sku, needs_manual_image)')
    .order('created_at', { ascending: false })
    .limit(5);

  console.log(`Recent product_images count sampled: ${storageImages?.length}`);
  for (const img of storageImages || []) {
    const prod = img.products as any;
    console.log(`- Product: "${prod?.name}" | SKU: ${prod?.sku} | needs_manual_image: ${prod?.needs_manual_image}`);
    console.log(`  URL: ${img.url}`);
  }

  console.log('\n--- 3. Spot-checking 3 Storage URLs via HTTP GET ---');
  const sampleUrls = (storageImages || []).slice(0, 3).map((img) => img.url);

  for (let i = 0; i < sampleUrls.length; i++) {
    const url = sampleUrls[i];
    try {
      const res = await fetch(url);
      console.log(`Spot-check #${i + 1}: ${url}`);
      console.log(`  Status: ${res.status} ${res.statusText}`);
      console.log(`  Content-Type: ${res.headers.get('content-type')}`);
      console.log(`  Content-Length: ${res.headers.get('content-length')} bytes\n`);
    } catch (err: any) {
      console.error(`Spot-check #${i + 1} failed:`, err.message);
    }
  }
}

verify().catch(console.error);
