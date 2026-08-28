-- ============================================================
-- 014_transactional_checkout_functions.sql
-- Transactional RPCs: Atomic checkout, Coupon validation, Order cancellation
-- ============================================================

-- ── 1. VALIDATE COUPON (Atomic / Safe Calculation RPC) ──────
create or replace function public.validate_coupon(
  p_code text,
  p_subtotal numeric
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_coupon record;
  v_discount numeric := 0;
begin
  select * into v_coupon
  from public.coupons
  where upper(code) = upper(trim(p_code))
    and is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now());

  if not found then
    return jsonb_build_object('valid', false, 'message', 'Code promo invalide ou expiré.');
  end if;

  if v_coupon.max_uses is not null and v_coupon.times_used >= v_coupon.max_uses then
    return jsonb_build_object('valid', false, 'message', 'Ce code promo a atteint sa limite d''utilisation.');
  end if;

  if p_subtotal < v_coupon.min_order_amount then
    return jsonb_build_object(
      'valid', false,
      'message', format('Le montant minimum pour ce coupon est de %s DH.', v_coupon.min_order_amount)
    );
  end if;

  if v_coupon.type = 'percentage' then
    v_discount := round((p_subtotal * v_coupon.value / 100.0), 2);
  else
    v_discount := least(v_coupon.value, p_subtotal);
  end if;

  return jsonb_build_object(
    'valid', true,
    'code', v_coupon.code,
    'discount_amount', v_discount,
    'type', v_coupon.type,
    'value', v_coupon.value
  );
end;
$$;

-- ── 2. ATOMIC CHECKOUT / ORDER CREATION RPC ──────────────────
create or replace function public.process_checkout_order(
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
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
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
begin
  -- Validate items present
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Le panier est vide.';
  end if;

  -- Generate human-friendly order number: CMD-YYYYMMDD-XXXXX
  v_order_number := 'CMD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(encode(gen_random_bytes(3), 'hex'), 1, 5));

  -- Get store shipping threshold
  select coalesce(free_shipping_threshold, 299) into v_free_threshold
  from public.store_settings where id = 1;

  -- 1. Validate items & lock rows atomically (FOR UPDATE prevents race condition / overselling)
  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  loop
    if v_item.quantity <= 0 then
      raise exception 'Quantité invalide pour le produit %', v_item.product_id;
    end if;

    select * into v_product
    from public.products
    where id = v_item.product_id
    for update; -- ROW-LEVEL LOCKING

    if not found then
      raise exception 'Produit non trouvé : %', v_item.product_id;
    end if;

    if not v_product.is_active then
      raise exception 'Le produit "%s" n''est plus disponible.', v_product.name;
    end if;

    if v_product.stock_quantity < v_item.quantity then
      raise exception 'Stock insuffisant pour "%s" (Disponible : %s, Demandé : %s)',
        v_product.name, v_product.stock_quantity, v_item.quantity;
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
  end loop;

  -- 2. Validate Coupon if supplied
  if p_coupon_code is not null and trim(p_coupon_code) != '' then
    select * into v_coupon
    from public.coupons
    where upper(code) = upper(trim(p_coupon_code))
      and is_active = true
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
    for update; -- Lock coupon to increment times_used safely

    if found then
      if (v_coupon.max_uses is null or v_coupon.times_used < v_coupon.max_uses)
         and (v_subtotal >= v_coupon.min_order_amount) then
        if v_coupon.type = 'percentage' then
          v_discount := round((v_subtotal * v_coupon.value / 100.0), 2);
        else
          v_discount := least(v_coupon.value, v_subtotal);
        end if;
        -- Atomically increment times_used
        update public.coupons
        set times_used = times_used + 1
        where id = v_coupon.id;
      end if;
    end if;
  end if;

  -- 3. Calculate Shipping (Free if subtotal >= free threshold, else 25 DH)
  if v_subtotal >= v_free_threshold then
    v_shipping_cost := 0;
  else
    v_shipping_cost := 25;
  end if;

  v_total := greatest(0, v_subtotal - v_discount + v_shipping_cost);

  -- 4. Create Order
  insert into public.orders (
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
  ) values (
    v_order_number,
    p_user_id,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    'confirmed',
    v_subtotal,
    v_shipping_cost,
    v_discount,
    v_total,
    'cod',
    'pending',
    p_shipping_address,
    p_coupon_code,
    p_notes
  ) returning id into v_order_id;

  -- 5. Insert Order Items & Deduct Stock & Record Stock Movement
  for v_item in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity int)
  loop
    select * into v_product from public.products where id = v_item.product_id;
    v_item_subtotal := v_product.price * v_item.quantity;

    -- Create snapshot item
    insert into public.order_items (
      order_id,
      product_id,
      product_name_snapshot,
      price_snapshot,
      quantity,
      subtotal
    ) values (
      v_order_id,
      v_product.id,
      v_product.name,
      v_product.price,
      v_item.quantity,
      v_item_subtotal
    );

    -- Atomically decrement stock
    update public.products
    set stock_quantity = stock_quantity - v_item.quantity
    where id = v_product.id;

    -- Record stock movement
    insert into public.stock_movements (
      product_id,
      change_amount,
      reason,
      note
    ) values (
      v_product.id,
      -v_item.quantity,
      'sale',
      'Vente commande ' || v_order_number
    );
  end loop;

  -- 6. Insert initial status history
  insert into public.order_status_history (
    order_id,
    status,
    note
  ) values (
    v_order_id,
    'confirmed',
    'Commande validée avec succès (Paiement à la livraison)'
  );

  -- 7. Clear Cart if provided
  if p_cart_id is not null then
    delete from public.cart_items where cart_id = p_cart_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total', v_total,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'shipping_cost', v_shipping_cost
  );
end;
$$;

-- ── 3. TRANSACTIONAL ORDER CANCELLATION & STOCK RESTORATION ──
create or replace function public.cancel_order_and_restore_stock(
  p_order_id uuid,
  p_admin_id uuid default null,
  p_note text default 'Annulation de commande'
)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_order record;
  v_item record;
begin
  select * into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Commande introuvable.');
  end if;

  if v_order.status = 'cancelled' then
    return jsonb_build_object('success', false, 'message', 'La commande est déjà annulée.');
  end if;

  -- Restore stock for all items
  for v_item in select * from public.order_items where order_id = p_order_id
  loop
    if v_item.product_id is not null then
      update public.products
      set stock_quantity = stock_quantity + v_item.quantity
      where id = v_item.product_id;

      insert into public.stock_movements (
        product_id,
        change_amount,
        reason,
        admin_id,
        note
      ) values (
        v_item.product_id,
        v_item.quantity,
        'return',
        p_admin_id,
        'Restitution stock suite à annulation de commande ' || v_order.order_number
      );
    end if;
  end loop;

  -- Update order status
  update public.orders
  set status = 'cancelled'
  where id = p_order_id;

  -- Add status history
  insert into public.order_status_history (
    order_id,
    status,
    changed_by,
    note
  ) values (
    p_order_id,
    'cancelled',
    p_admin_id,
    p_note
  );

  return jsonb_build_object('success', true, 'order_id', p_order_id, 'status', 'cancelled');
end;
$$;
