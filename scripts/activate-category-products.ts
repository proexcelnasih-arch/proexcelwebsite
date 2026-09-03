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

async function activateProducts() {
  console.log('============================================================');
  console.log('STEP 8: ACTIVATING PRODUCTS FOR "cahier-carnet-bloc-note"');
  console.log('============================================================');

  const { data: cat } = await supabase
    .from('categories')
    .select('id, name')
    .eq('slug', 'cahier-carnet-bloc-note')
    .single();

  if (!cat) {
    console.error('Category not found');
    process.exit(1);
  }

  const { data: updated, error } = await supabase
    .from('products')
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq('category_id', cat.id)
    .eq('needs_manual_image', false)
    .select('id, name, is_active');

  if (error) {
    console.error('Activation error:', error);
    process.exit(1);
  }

  console.log(`Successfully activated ${updated?.length || 0} products in "${cat.name}".`);
}

activateProducts().catch(console.error);
