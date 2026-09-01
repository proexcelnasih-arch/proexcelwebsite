-- ============================================================
-- 018_fix_products_rls_policies.sql
-- Fix RLS policies on products, product_images, and product_variants
-- ============================================================

-- 1. Enable RLS on tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_type text NOT NULL,
  label text NOT NULL,
  price_delta numeric DEFAULT 0,
  stock_quantity int DEFAULT 10,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing potentially restrictive policies
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_all" ON public.products;
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
DROP POLICY IF EXISTS "products_update_policy" ON public.products;
DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable all for admin and authenticated" ON public.products;

DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_all" ON public.product_images;
DROP POLICY IF EXISTS "product_images_select_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_insert_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_update_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_delete_policy" ON public.product_images;

DROP POLICY IF EXISTS "product_variants_public_read" ON public.product_variants;
DROP POLICY IF EXISTS "Allow public read access to product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow service role full access to product variants" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_select_policy" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_insert_policy" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_update_policy" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_delete_policy" ON public.product_variants;

-- 3. PRODUCTS POLICIES
-- Anyone can view products (active or for storefront catalog)
CREATE POLICY "products_select_policy"
  ON public.products
  FOR SELECT
  USING (true);

-- Authenticated users, admins, and service_role can INSERT products
CREATE POLICY "products_insert_policy"
  ON public.products
  FOR INSERT
  WITH CHECK (true);

-- Authenticated users, admins, and service_role can UPDATE products
CREATE POLICY "products_update_policy"
  ON public.products
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Authenticated users, admins, and service_role can DELETE products
CREATE POLICY "products_delete_policy"
  ON public.products
  FOR DELETE
  USING (true);

-- 4. PRODUCT_IMAGES POLICIES
CREATE POLICY "product_images_select_policy"
  ON public.product_images
  FOR SELECT
  USING (true);

CREATE POLICY "product_images_insert_policy"
  ON public.product_images
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "product_images_update_policy"
  ON public.product_images
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "product_images_delete_policy"
  ON public.product_images
  FOR DELETE
  USING (true);

-- 5. PRODUCT_VARIANTS POLICIES
CREATE POLICY "product_variants_select_policy"
  ON public.product_variants
  FOR SELECT
  USING (true);

CREATE POLICY "product_variants_insert_policy"
  ON public.product_variants
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "product_variants_update_policy"
  ON public.product_variants
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "product_variants_delete_policy"
  ON public.product_variants
  FOR DELETE
  USING (true);
