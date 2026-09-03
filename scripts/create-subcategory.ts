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
  console.log('--- Checking Parent Category "fournitures-scolaires" ---');
  const { data: parent, error: pErr } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', 'fournitures-scolaires')
    .single();

  if (pErr || !parent) {
    console.error('Parent category not found:', pErr);
    process.exit(1);
  }
  console.log(`Found parent: ${parent.name} (id: ${parent.id})`);

  // Check if subcategory already exists
  const { data: existing } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', 'cahier-carnet-bloc-note')
    .maybeSingle();

  if (existing) {
    console.log('Subcategory already exists:', existing);
    return;
  }

  // Get max display_order for children
  const { data: siblings } = await supabase
    .from('categories')
    .select('display_order')
    .eq('parent_id', parent.id)
    .order('display_order', { ascending: false })
    .limit(1);

  const maxOrder = siblings && siblings.length > 0 && siblings[0].display_order !== null ? siblings[0].display_order : 0;
  const nextOrder = maxOrder + 1;

  console.log(`Inserting subcategory with display_order: ${nextOrder}`);
  const { data: inserted, error: insertErr } = await supabase
    .from('categories')
    .insert({
      name: 'Cahier, Carnet et Bloc-Note',
      slug: 'cahier-carnet-bloc-note',
      parent_id: parent.id,
      is_active: true,
      display_order: nextOrder,
    })
    .select('*')
    .single();

  if (insertErr) {
    console.error('Insert error:', insertErr);
    process.exit(1);
  }

  console.log('Successfully created subcategory:', inserted);
}

main().catch(console.error);
