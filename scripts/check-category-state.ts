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

async function main() {
  const { data: cats, error: catErr } = await supabase
    .from('categories')
    .select('id, name, slug, parent_id, is_active, display_order')
    .order('name');

  if (catErr) {
    console.error('Cat err:', catErr);
    return;
  }

  console.log('Categories count:', cats?.length);
  for (const c of cats || []) {
    const { count } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', c.id)
      .eq('is_active', true);
    console.log(`Cat [${c.slug}] name="${c.name}" id=${c.id} parent_id=${c.parent_id}: ${count} active products`);
  }

  const { count: totalActive } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  console.log('\nTotal active products in database:', totalActive);
}

main().catch(console.error);
