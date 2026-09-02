import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });

async function setupSiteAssets() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('[FATAL] Missing Supabase URL or Service Role Key in environment.');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('1. Checking storage buckets...');
  const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) {
    console.error('[ERROR] Listing buckets failed:', listError.message);
    process.exit(1);
  }

  const siteAssetsExists = existingBuckets?.some((b) => b.id === 'site-assets');

  if (!siteAssetsExists) {
    console.log('Creating public bucket "site-assets"...');
    const { data, error } = await supabaseAdmin.storage.createBucket('site-assets', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'],
    });

    if (error) {
      console.error('[ERROR] Failed to create "site-assets" bucket:', error.message);
      process.exit(1);
    }
    console.log('Bucket "site-assets" created successfully.');
  } else {
    console.log('Bucket "site-assets" already exists. Ensuring it is public...');
    const { error } = await supabaseAdmin.storage.updateBucket('site-assets', {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/svg+xml'],
    });
    if (error) {
      console.warn('Warning updating bucket:', error.message);
    } else {
      console.log('Bucket "site-assets" verified as public.');
    }
  }

  // 2. Upload public/logo.png to site-assets/brand/logo.png
  const logoLocalPath = path.resolve(process.cwd(), 'public/logo.png');
  if (!fs.existsSync(logoLocalPath)) {
    console.error('[FATAL] Logo file not found at:', logoLocalPath);
    process.exit(1);
  }

  console.log('2. Uploading logo to "site-assets/brand/logo.png"...');
  const logoBuffer = fs.readFileSync(logoLocalPath);
  const { error: uploadError } = await supabaseAdmin.storage
    .from('site-assets')
    .upload('brand/logo.png', logoBuffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    console.error('[ERROR] Uploading logo failed:', uploadError.message);
    process.exit(1);
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from('site-assets')
    .getPublicUrl('brand/logo.png');

  const logoUrl = publicUrlData.publicUrl;
  console.log('Logo uploaded! Public URL:', logoUrl);

  // 3. Update store_settings.logo_url
  console.log('3. Updating store_settings table with logo_url...');
  const { data: updatedSettings, error: updateError } = await supabaseAdmin
    .from('store_settings')
    .upsert({
      id: 1,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (updateError) {
    console.error('[ERROR] Failed to update store_settings:', updateError.message);
    process.exit(1);
  }

  console.log('Successfully updated store_settings!');
  console.log('Current row:', {
    id: updatedSettings.id,
    store_name: updatedSettings.store_name,
    logo_url: updatedSettings.logo_url,
    updated_at: updatedSettings.updated_at,
  });
}

setupSiteAssets().catch((err) => {
  console.error('[FATAL] Exception:', err);
  process.exit(1);
});
