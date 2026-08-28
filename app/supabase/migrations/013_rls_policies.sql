-- ============================================================
-- 013_rls_policies.sql
-- Production Row Level Security (RLS) policies for all tables
-- ============================================================

-- Enable RLS on every table
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.stock_movements enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.reviews enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.coupons enable row level security;
alter table public.hero_slides enable row level security;
alter table public.promo_tiles enable row level security;
alter table public.store_settings enable row level security;

-- ── Admin Authorization Helper ──────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ── PROFILES ────────────────────────────────────────────────
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id and (role = 'customer' or public.is_admin())
  );

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- ── ADDRESSES ───────────────────────────────────────────────
create policy "addresses_select_own" on public.addresses
  for select using (user_id = auth.uid());

create policy "addresses_insert_own" on public.addresses
  for insert with check (user_id = auth.uid());

create policy "addresses_update_own" on public.addresses
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "addresses_delete_own" on public.addresses
  for delete using (user_id = auth.uid());

create policy "addresses_admin_all" on public.addresses
  for all using (public.is_admin());

-- ── BRANDS ──────────────────────────────────────────────────
create policy "brands_public_read" on public.brands
  for select using (true);

create policy "brands_admin_all" on public.brands
  for all using (public.is_admin());

-- ── CATEGORIES ──────────────────────────────────────────────
create policy "categories_public_read" on public.categories
  for select using (is_active = true);

create policy "categories_admin_all" on public.categories
  for all using (public.is_admin());

-- ── PRODUCTS ────────────────────────────────────────────────
create policy "products_public_read" on public.products
  for select using (is_active = true);

create policy "products_admin_all" on public.products
  for all using (public.is_admin());

-- ── PRODUCT IMAGES ──────────────────────────────────────────
create policy "product_images_public_read" on public.product_images
  for select using (
    exists (
      select 1 from public.products
      where id = product_images.product_id and is_active = true
    )
  );

create policy "product_images_admin_all" on public.product_images
  for all using (public.is_admin());

-- ── STOCK MOVEMENTS (Admin only) ────────────────────────────
create policy "stock_movements_admin_all" on public.stock_movements
  for all using (public.is_admin());

-- ── CARTS ───────────────────────────────────────────────────
create policy "carts_select_own" on public.carts
  for select using (
    (auth.uid() is not null and user_id = auth.uid())
  );

create policy "carts_insert_own" on public.carts
  for insert with check (
    (auth.uid() is not null and user_id = auth.uid()) or
    (auth.uid() is null and session_token is not null)
  );

create policy "carts_update_own" on public.carts
  for update using (
    (auth.uid() is not null and user_id = auth.uid())
  );

create policy "carts_delete_own" on public.carts
  for delete using (
    (auth.uid() is not null and user_id = auth.uid())
  );

create policy "carts_admin_all" on public.carts
  for all using (public.is_admin());

-- ── CART ITEMS ──────────────────────────────────────────────
create policy "cart_items_select_own" on public.cart_items
  for select using (
    exists (
      select 1 from public.carts
      where id = cart_items.cart_id
        and ((auth.uid() is not null and carts.user_id = auth.uid()))
    )
  );

create policy "cart_items_insert_own" on public.cart_items
  for insert with check (
    exists (
      select 1 from public.carts
      where id = cart_items.cart_id
        and ((auth.uid() is not null and carts.user_id = auth.uid()) or (auth.uid() is null and carts.session_token is not null))
    )
  );

create policy "cart_items_update_own" on public.cart_items
  for update using (
    exists (
      select 1 from public.carts
      where id = cart_items.cart_id
        and ((auth.uid() is not null and carts.user_id = auth.uid()) or (auth.uid() is null and carts.session_token is not null))
    )
  );

create policy "cart_items_delete_own" on public.cart_items
  for delete using (
    exists (
      select 1 from public.carts
      where id = cart_items.cart_id
        and ((auth.uid() is not null and carts.user_id = auth.uid()) or (auth.uid() is null and carts.session_token is not null))
    )
  );

create policy "cart_items_admin_all" on public.cart_items
  for all using (public.is_admin());

-- ── ORDERS ──────────────────────────────────────────────────
create policy "orders_select_own" on public.orders
  for select using (user_id = auth.uid());

create policy "orders_insert_checkout" on public.orders
  for insert with check (user_id = auth.uid() or user_id is null);

create policy "orders_admin_all" on public.orders
  for all using (public.is_admin());

-- ── ORDER ITEMS ─────────────────────────────────────────────
create policy "order_items_select_own" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where id = order_items.order_id and user_id = auth.uid()
    )
  );

create policy "order_items_admin_all" on public.order_items
  for all using (public.is_admin());

-- ── ORDER STATUS HISTORY ────────────────────────────────────
create policy "order_status_history_select_own" on public.order_status_history
  for select using (
    exists (
      select 1 from public.orders
      where id = order_status_history.order_id and user_id = auth.uid()
    )
  );

create policy "order_status_history_admin_all" on public.order_status_history
  for all using (public.is_admin());

-- ── WISHLIST ITEMS ──────────────────────────────────────────
create policy "wishlist_items_select_own" on public.wishlist_items
  for select using (user_id = auth.uid());

create policy "wishlist_items_insert_own" on public.wishlist_items
  for insert with check (user_id = auth.uid());

create policy "wishlist_items_delete_own" on public.wishlist_items
  for delete using (user_id = auth.uid());

create policy "wishlist_items_admin_all" on public.wishlist_items
  for all using (public.is_admin());

-- ── REVIEWS ─────────────────────────────────────────────────
create policy "reviews_public_read_approved" on public.reviews
  for select using (status = 'approved');

create policy "reviews_insert_authenticated" on public.reviews
  for insert with check (user_id = auth.uid() and status = 'pending');

create policy "reviews_admin_all" on public.reviews
  for all using (public.is_admin());

-- ── NEWSLETTER SUBSCRIBERS ──────────────────────────────────
create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert with check (true);

create policy "newsletter_admin_all" on public.newsletter_subscribers
  for all using (public.is_admin());

-- ── COUPONS (Admin only direct access) ──────────────────────
create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin());

-- ── HERO SLIDES ─────────────────────────────────────────────
create policy "hero_slides_public_read" on public.hero_slides
  for select using (is_active = true);

create policy "hero_slides_admin_all" on public.hero_slides
  for all using (public.is_admin());

-- ── PROMO TILES ─────────────────────────────────────────────
create policy "promo_tiles_public_read" on public.promo_tiles
  for select using (is_active = true);

create policy "promo_tiles_admin_all" on public.promo_tiles
  for all using (public.is_admin());

-- ── STORE SETTINGS ──────────────────────────────────────────
create policy "store_settings_public_read" on public.store_settings
  for select using (true);

create policy "store_settings_admin_all" on public.store_settings
  for all using (public.is_admin());
