-- ============================================================
-- 022_harden_catalog_and_orders_security.sql
-- Security Hardening & Bug Fixes Migration:
-- 1. SEC-01: Remove public full-mutation RLS on products, product_images, product_variants.
--            Recreate strict admin-only mutation policies and public read.
-- 2. SEC-01: Harden profiles table against privilege escalation (forbid user role modification).
-- 3. SEC-01: Drop public direct insert on orders table (enforce creation via transactional RPC).
-- 4. SEC-03: Harden cancel_order_and_restore_stock RPC (auth check, revoke public execute, ignore spoofed admin ID).
-- 5. BUG-01: Fix process_checkout_order coupon calculation (use coupons.type and coupons.value).
-- 6. PERF-01: Add missing performance indexes on orders, stock_movements, and profiles.
-- ============================================================

-- ============================================================
-- 1. SEC-01: PRODUCTS, PRODUCT_IMAGES, PRODUCT_VARIANTS RLS
-- ============================================================

-- Ensure Row Level Security is active
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Ensure product_variants exists (in case migration 017/018 was not run)
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
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 1.1 Products Table: Drop all insecure or duplicate policies
DROP POLICY IF EXISTS "products_public_read" ON public.products;
DROP POLICY IF EXISTS "products_admin_all" ON public.products;
DROP POLICY IF EXISTS "products_select_policy" ON public.products;
DROP POLICY IF EXISTS "products_insert_policy" ON public.products;
DROP POLICY IF EXISTS "products_update_policy" ON public.products;
DROP POLICY IF EXISTS "products_delete_policy" ON public.products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.products;
DROP POLICY IF EXISTS "Enable all for admin and authenticated" ON public.products;
DROP POLICY IF EXISTS "products_admin_insert" ON public.products;
DROP POLICY IF EXISTS "products_admin_update" ON public.products;
DROP POLICY IF EXISTS "products_admin_delete" ON public.products;

-- Recreate: Public can read active products; Admins can read all products
CREATE POLICY "products_select_policy"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

-- Recreate: Admin-only INSERT
CREATE POLICY "products_admin_insert"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Recreate: Admin-only UPDATE
CREATE POLICY "products_admin_update"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Recreate: Admin-only DELETE
CREATE POLICY "products_admin_delete"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- 1.2 Product Images Table: Drop insecure or duplicate policies
DROP POLICY IF EXISTS "product_images_public_read" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_all" ON public.product_images;
DROP POLICY IF EXISTS "product_images_select_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_insert_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_update_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_delete_policy" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_insert" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_update" ON public.product_images;
DROP POLICY IF EXISTS "product_images_admin_delete" ON public.product_images;

-- Public can read images of active products (or all for admin)
CREATE POLICY "product_images_select_policy"
  ON public.product_images
  FOR SELECT
  TO anon, authenticated
  USING (
    public.is_admin() OR
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = product_images.product_id AND is_active = true
    )
  );

-- Admin-only INSERT
CREATE POLICY "product_images_admin_insert"
  ON public.product_images
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admin-only UPDATE
CREATE POLICY "product_images_admin_update"
  ON public.product_images
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin-only DELETE
CREATE POLICY "product_images_admin_delete"
  ON public.product_images
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- 1.3 Product Variants Table: Drop insecure or duplicate policies
DROP POLICY IF EXISTS "product_variants_public_read" ON public.product_variants;
DROP POLICY IF EXISTS "Allow public read access to product variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow service role full access to product variants" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_select_policy" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_insert_policy" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_update_policy" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_delete_policy" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_admin_insert" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_admin_update" ON public.product_variants;
DROP POLICY IF EXISTS "product_variants_admin_delete" ON public.product_variants;

-- Public read for product variants
CREATE POLICY "product_variants_select_policy"
  ON public.product_variants
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin-only INSERT
CREATE POLICY "product_variants_admin_insert"
  ON public.product_variants
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admin-only UPDATE
CREATE POLICY "product_variants_admin_update"
  ON public.product_variants
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admin-only DELETE
CREATE POLICY "product_variants_admin_delete"
  ON public.product_variants
  FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================
-- 2. SEC-01: HARDEN PROFILES (PREVENT PRIVILEGE ESCALATION)
-- ============================================================

-- Ensure is_admin() function is strictly SECURITY DEFINER with fixed search_path
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Drop and replace profiles update policy to forbid self-promotion
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      public.is_admin()
      OR role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    )
  );

-- Database-level trigger guaranteeing role cannot be altered by non-admins
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Modification du rôle non autorisée.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_role();


-- ============================================================
-- 3. SEC-01: HARDEN ORDERS TABLE (REMOVE DIRECT PUBLIC INSERT)
-- ============================================================

-- Checkout in COD e-commerce is executed atomically through process_checkout_order RPC.
-- Direct client INSERT on orders table is removed to prevent unverified order injection.
DROP POLICY IF EXISTS "orders_insert_checkout" ON public.orders;


-- ============================================================
-- 4. SEC-03: HARDEN cancel_order_and_restore_stock RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.cancel_order_and_restore_stock(
  p_order_id uuid,
  p_admin_id uuid default null,
  p_note text default 'Annulation de commande'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_item record;
  v_acting_user uuid;
BEGIN
  -- 1. Authorization check: must be admin or service_role
  IF NOT (public.is_admin() OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Non autorisé : droits administrateur requis pour annuler une commande.';
  END IF;

  -- 2. Audit actor: use verified session auth.uid() rather than trusting caller-supplied p_admin_id
  v_acting_user := COALESCE(auth.uid(), p_admin_id);

  -- 3. Lock order for update
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Commande introuvable.');
  END IF;

  IF v_order.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'message', 'La commande est déjà annulée.');
  END IF;

  -- 4. Restore stock atomically for all items and record stock movement
  FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id
  LOOP
    IF v_item.product_id IS NOT NULL THEN
      UPDATE public.products
      SET stock_quantity = stock_quantity + v_item.quantity,
          updated_at = now()
      WHERE id = v_item.product_id;

      INSERT INTO public.stock_movements (
        product_id,
        change_amount,
        reason,
        admin_id,
        note
      ) VALUES (
        v_item.product_id,
        v_item.quantity,
        'return',
        v_acting_user,
        'Restitution stock suite à annulation de commande ' || v_order.order_number
      );
    END IF;
  END LOOP;

  -- 5. Update order status
  UPDATE public.orders
  SET status = 'cancelled',
      updated_at = now()
  WHERE id = p_order_id;

  -- 6. Add status history entry
  INSERT INTO public.order_status_history (
    order_id,
    status,
    changed_by,
    note
  ) VALUES (
    p_order_id,
    'cancelled',
    v_acting_user,
    p_note
  );

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'status', 'cancelled');
END;
$$;

-- Revoke default public execution & grant only to authenticated and service_role
REVOKE EXECUTE ON FUNCTION public.cancel_order_and_restore_stock(uuid, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_order_and_restore_stock(uuid, uuid, text) TO authenticated, service_role;


-- ============================================================
-- 5. BUG-01: FIX process_checkout_order COUPON CALCULATION
-- ============================================================

CREATE OR REPLACE FUNCTION public.process_checkout_order(
  p_user_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_shipping_address jsonb,
  p_items jsonb, -- Array of { product_id: uuid, quantity: int }
  p_coupon_code text default null,
  p_notes text default null,
  p_cart_id uuid default null
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item record;
  v_product record;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_shipping_cost numeric := 0;
  v_free_threshold numeric := 299;
  v_total numeric := 0;
  v_order_id uuid;
  v_order_number text;
  v_coupon record;
  v_item_subtotal numeric;
BEGIN
  -- Validate items present
  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Le panier est vide.';
  END IF;

  -- Generate human-friendly order number: CMD-YYYYMMDD-XXXXXX using built-in gen_random_uuid
  v_order_number := 'CMD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  -- Get store shipping threshold
  SELECT coalesce(free_shipping_threshold, 299) INTO v_free_threshold
  FROM public.store_settings WHERE id = 1;

  -- 1. Validate items & lock rows atomically (FOR UPDATE prevents race condition / overselling)
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'Quantité invalide pour le produit %', v_item.product_id;
    END IF;

    SELECT * INTO v_product
    FROM public.products
    WHERE id = v_item.product_id
    FOR UPDATE; -- ROW-LEVEL LOCKING

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produit non trouvé : %', v_item.product_id;
    END IF;

    IF NOT v_product.is_active THEN
      RAISE EXCEPTION 'Le produit "%" n''est plus disponible.', v_product.name;
    END IF;

    IF v_product.stock_quantity < v_item.quantity THEN
      RAISE EXCEPTION 'Stock insuffisant pour "%" (Disponible : %, Demandé : %)',
        v_product.name, v_product.stock_quantity, v_item.quantity;
    END IF;

    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
  END LOOP;

  -- 2. Validate and Apply Coupon (if supplied)
  IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) <> '' THEN
    SELECT * INTO v_coupon
    FROM public.coupons
    WHERE code = upper(trim(p_coupon_code))
      AND is_active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at >= now())
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Code promo invalide ou expiré : %', p_coupon_code;
    END IF;

    IF v_coupon.max_uses IS NOT NULL AND v_coupon.times_used >= v_coupon.max_uses THEN
      RAISE EXCEPTION 'Ce code promo a atteint sa limite d''utilisation.';
    END IF;

    IF v_coupon.min_order_amount IS NOT NULL AND v_subtotal < v_coupon.min_order_amount THEN
      RAISE EXCEPTION 'Montant minimum requis pour ce code promo : % DH (Sous-total actuel : % DH)',
        v_coupon.min_order_amount, v_subtotal;
    END IF;

    -- Calculate Discount using coupons table schema: 'type' and 'value'
    IF v_coupon.type = 'percentage' THEN
      v_discount := round((v_subtotal * v_coupon.value / 100.0), 2);
    ELSIF v_coupon.type = 'fixed' THEN
      v_discount := least(v_subtotal, v_coupon.value);
    END IF;

    -- Guarantee discount is strictly bounded
    v_discount := greatest(0, least(v_subtotal, v_discount));

    -- Increment usage atomically
    UPDATE public.coupons
    SET times_used = times_used + 1, updated_at = now()
    WHERE id = v_coupon.id;
  END IF;

  -- 3. Calculate Shipping (Free if subtotal >= free threshold, else 25 DH)
  IF v_subtotal >= v_free_threshold THEN
    v_shipping_cost := 0;
  ELSE
    v_shipping_cost := 25;
  END IF;

  v_total := greatest(0, v_subtotal - v_discount + v_shipping_cost);

  -- 4. Create Order
  INSERT INTO public.orders (
    order_number,
    user_id,
    customer_name,
    customer_phone,
    customer_email,
    status,
    subtotal,
    shipping_cost,
    discount_amount,
    total,
    payment_method,
    payment_status,
    shipping_address,
    coupon_code,
    notes
  ) VALUES (
    v_order_number,
    p_user_id,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    'pending',
    v_subtotal,
    v_shipping_cost,
    v_discount,
    v_total,
    'cod',
    'pending',
    p_shipping_address,
    p_coupon_code,
    p_notes
  ) RETURNING id INTO v_order_id;

  -- Record initial status in order_status_history
  INSERT INTO public.order_status_history (
    order_id,
    status,
    changed_by,
    note
  ) VALUES (
    v_order_id,
    'pending',
    p_user_id,
    'Commande validée avec succès (Paiement à la livraison)'
  );

  -- 5. Insert Order Items & Deduct Stock & Record Stock Movement
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  LOOP
    SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id;
    v_item_subtotal := v_product.price * v_item.quantity;

    -- Create snapshot item
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name_snapshot,
      price_snapshot,
      quantity,
      subtotal
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.price,
      v_item.quantity,
      v_item_subtotal
    );

    -- Decrement stock atomically
    UPDATE public.products
    SET stock_quantity = stock_quantity - v_item.quantity,
        updated_at = now()
    WHERE id = v_product.id;

    -- Record stock movement audit log
    INSERT INTO public.stock_movements (
      product_id,
      change_amount,
      reason,
      admin_id,
      note
    ) VALUES (
      v_product.id,
      -v_item.quantity,
      'sale',
      NULL,
      'Commande client #' || v_order_number
    );
  END LOOP;

  -- 6. Clear cart items if cart_id supplied
  IF p_cart_id IS NOT NULL THEN
    DELETE FROM public.cart_items WHERE cart_id = p_cart_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'shipping_cost', v_shipping_cost,
    'discount_amount', v_discount,
    'total', v_total
  );
END;
$$;

-- Revoke default public execution & grant to service_role
REVOKE EXECUTE ON FUNCTION public.process_checkout_order(uuid, text, text, text, jsonb, jsonb, text, text, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_checkout_order(uuid, text, text, text, jsonb, jsonb, text, text, uuid) TO service_role;


-- ============================================================
-- 6. PERF-01: ADD INDEXES FOR ORDERS, STOCK MOVEMENTS, PROFILES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON public.stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

