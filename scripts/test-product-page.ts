import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), 'app/.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl!, serviceKey!);

async function testProductPage() {
  const { data: prods } = await supabase.from('products').select('slug, name').eq('is_active', true).limit(3);
  if (!prods || prods.length === 0) {
    console.log('No active products found to test.');
    return;
  }

  for (const prod of prods) {
    const url = `http://localhost:3000/product/${prod.slug}`;
    console.log(`\nTesting Product URL: ${url} (${prod.name})`);
    try {
      const res = await fetch(url);
      console.log(`Status: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.log(`Contains product title in HTML: ${text.includes(prod.name)}`);
      console.log(`Contains "Ajouter au panier": ${text.includes('Ajouter au panier')}`);
      console.log(`Contains "Commander maintenant": ${text.includes('Commander maintenant')}`);
      console.log(`Contains "Produits similaires": ${text.includes('Produits similaires')}`);
      console.log(`HTML size: ${text.length} bytes`);
    } catch (err: any) {
      console.error(`Failed to fetch ${url}:`, err.message);
    }
  }
}

testProductPage().catch(console.error);
