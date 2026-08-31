import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), override: true });
dotenv.config({ path: path.resolve(process.cwd(), 'app/.env.local'), override: true });

async function setupStorage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('[FATAL] Missing Supabase URL or Service Role Key in environment.');
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('Checking existing storage buckets...');
  const { data: existingBuckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError.message);
  } else {
    console.log('Existing buckets:', existingBuckets.map((b) => ({ id: b.id, name: b.name, public: b.public })));
  }

  const bucketExists = existingBuckets?.some((b) => b.id === 'product-images');

  if (!bucketExists) {
    console.log('Creating public bucket "product-images"...');
    const { data, error } = await supabaseAdmin.storage.createBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB in bytes
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    });

    if (error) {
      console.error('[ERROR] Failed to create bucket:', error.message);
      process.exit(1);
    }
    console.log('Bucket "product-images" created successfully!', data);
  } else {
    console.log('Bucket "product-images" already exists. Updating to public...');
    const { error } = await supabaseAdmin.storage.updateBucket('product-images', {
      public: true,
      fileSizeLimit: 5242880,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
    });
    if (error) {
      console.warn('Warning updating bucket:', error.message);
    } else {
      console.log('Bucket "product-images" updated to public.');
    }
  }

  // Verify bucket list
  const { data: updatedBuckets, error: verifyError } = await supabaseAdmin.storage.listBuckets();
  if (verifyError) {
    console.error('Error verifying buckets:', verifyError.message);
  } else {
    console.log('\n--- VERIFIED STORAGE BUCKETS ---');
    console.log(JSON.stringify(updatedBuckets.map((b) => ({ id: b.id, name: b.name, is_public: b.public })), null, 2));
  }
}

setupStorage().catch((err) => {
  console.error('[FATAL]:', err);
  process.exit(1);
});
