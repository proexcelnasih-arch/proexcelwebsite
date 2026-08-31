import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), 'app/.env.local'), override: true });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl!, serviceKey!);

async function runMigration() {
  const sql = fs.readFileSync(path.resolve(process.cwd(), 'app/supabase/migrations/017_product_page_variants_and_video.sql'), 'utf-8');
  console.log('Applying migration 017...');

  // Try calling pg endpoint or rpc if available
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': serviceKey!,
      'Authorization': `Bearer ${serviceKey!}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (res.ok) {
    console.log('Migration executed via rpc/exec_sql successfully!');
  } else {
    console.log(`rpc/exec_sql returned ${res.status} (${res.statusText}) - checking direct tables`);
  }

  // Verify whether product_variants table is queryable
  const { data, error } = await supabase.from('product_variants').select('*').limit(1);
  if (error) {
    console.log('product_variants table check:', error.message);
  } else {
    console.log('product_variants table exists and is accessible! Sample:', data);
  }

  // Verify video_url on products
  const { data: prodData, error: prodErr } = await supabase.from('products').select('id, video_url').limit(1);
  if (prodErr) {
    console.log('products.video_url check:', prodErr.message);
  } else {
    console.log('products.video_url exists and is accessible! Sample:', prodData);
  }
}

runMigration().catch(console.error);
