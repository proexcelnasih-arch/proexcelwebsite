-- ============================================================
-- 019_fix_checkout_rpc_and_profiles_email.sql
-- 1. Add email to profiles and sync from auth.users
-- 2. Fix process_checkout_order to use gen_random_uuid() instead of gen_random_bytes
-- ============================================================

-- 1. Add email column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;

-- Backfill emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- Update trigger function for new user signups to store email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, email)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer',
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = coalesce(excluded.full_name, profiles.full_name),
    phone = coalesce(excluded.phone, profiles.phone),
    email = coalesce(excluded.email, profiles.email);
  RETURN new;
END;
$$;

-- 2. Replace process_checkout_order with robust order number generation
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
SECURITY DEFINER SET search_path = public
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

    -- Calculate Discount
    IF v_coupon.discount_type = 'percentage' THEN
      v_discount := round((v_subtotal * v_coupon.discount_value / 100.0), 2);
    ELSIF v_coupon.discount_type = 'fixed' THEN
      v_discount := least(v_subtotal, v_coupon.discount_value);
    END IF;

    -- Increment usage
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
    'Commande passée avec succès sur la boutique Nadiaa'
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
