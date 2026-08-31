import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), 'app/.env.local'), override: true });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.error('Missing Supabase URL or key');
  process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
  const { count: totalCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  const { count: scrapedCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .like('sku', 'PE-%');

  const { count: seedCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .not('sku', 'like', 'PE-%');

  console.log('=== PRODUCT COUNTS ===');
  console.log('Total Products:', totalCount);
  console.log('Scraped (PE-%):', scrapedCount);
  console.log('Seed (non PE-%):', seedCount);

  // Check order_items referencing PE-%
  const { data: orderItems, error: errOi } = await supabase
    .from('order_items')
    .select('id, product_id, products!inner(sku)')
    .like('products.sku', 'PE-%');
  console.log('Order items for PE-% products:', orderItems?.length || 0);

  // Check product_images referencing PE-%
  const { count: imgCount } = await supabase
    .from('product_images')
    .select('id, products!inner(sku)', { count: 'exact', head: true })
    .like('products.sku', 'PE-%');
  console.log('Product images for PE-% products:', imgCount);

  // Check stock_movements referencing PE-%
  const { data: sm } = await supabase
    .from('stock_movements')
    .select('id, products!inner(sku)')
    .like('products.sku', 'PE-%');
  console.log('Stock movements for PE-% products:', sm?.length || 0);

  // Check cart_items referencing PE-%
  const { data: ci } = await supabase
    .from('cart_items')
    .select('id, products!inner(sku)')
    .like('products.sku', 'PE-%');
  console.log('Cart items for PE-% products:', ci?.length || 0);

  // Check wishlist_items referencing PE-%
  const { data: wi } = await supabase
    .from('wishlist_items')
    .select('id, products!inner(sku)')
    .like('products.sku', 'PE-%');
  console.log('Wishlist items for PE-% products:', wi?.length || 0);

  // Check reviews referencing PE-%
  const { data: rev } = await supabase
    .from('reviews')
    .select('id, products!inner(sku)')
    .like('products.sku', 'PE-%');
  console.log('Reviews for PE-% products:', rev?.length || 0);

  // Check storage files
  const { data: storageFiles } = await supabase.storage.from('product-images').list();
  console.log('Files in product-images bucket:', storageFiles?.length || 0);
}

check().catch(console.error);
