-- ============================================================
-- 021_storage_admin_policies.sql
-- Grant proper storage access for public reading and admin uploads
-- ============================================================

-- 1. Ensure RLS is active on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any to avoid duplication
DROP POLICY IF EXISTS "Public Access to product-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to site-assets" ON storage.objects;
DROP POLICY IF EXISTS "storage_public_read_product_images" ON storage.objects;
DROP POLICY IF EXISTS "storage_public_read_site_assets" ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_insert_product_images" ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_update_product_images" ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_delete_product_images" ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_insert_site_assets" ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_update_site_assets" ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_delete_site_assets" ON storage.objects;
DROP POLICY IF EXISTS "storage_admin_all" ON storage.objects;

-- 3. Public Read Policy for public buckets
CREATE POLICY "storage_public_read_product_images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "storage_public_read_site_assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'site-assets');

-- 4. Admin Full Access on product-images and site-assets
CREATE POLICY "storage_admin_all"
  ON storage.objects FOR ALL
  TO authenticated
  USING (
    bucket_id IN ('product-images', 'site-assets')
    AND public.is_admin()
  )
  WITH CHECK (
    bucket_id IN ('product-images', 'site-assets')
    AND public.is_admin()
  );
