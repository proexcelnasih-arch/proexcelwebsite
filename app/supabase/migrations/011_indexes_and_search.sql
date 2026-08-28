-- ============================================================
-- 011_indexes_and_search.sql
-- Production indexes: Foreign keys, Unique lookups, Filter-heavy, Full-text Search
-- ============================================================

-- ── Unique indexes ──────────────────────────────────────────
create index ifn_profiles_phone on public.profiles(phone);
create index ifn_brands_slug on public.brands(slug);
create index ifn_categories_slug on public.categories(slug);
create index ifn_products_slug on public.products(slug);
create index ifn_products_sku on public.products(sku);
create index ifn_orders_number on public.orders(order_number);
create index ifn_coupons_code on public.coupons(code);
create index ifn_newsletter_email on public.newsletter_subscribers(email);

-- ── Foreign Key indexes ─────────────────────────────────────
create index ifn_addresses_user on public.addresses(user_id);
create index ifn_categories_parent on public.categories(parent_id);
create index ifn_products_category on public.products(category_id);
create index ifn_products_brand on public.products(brand_id);
create index ifn_product_images_product on public.product_images(product_id);
create index ifn_stock_movements_product on public.stock_movements(product_id);
create index ifn_stock_movements_admin on public.stock_movements(admin_id);
create index ifn_carts_user on public.carts(user_id);
create index ifn_carts_session on public.carts(session_token) where session_token is not null;
create index ifn_cart_items_cart on public.cart_items(cart_id);
create index ifn_cart_items_product on public.cart_items(product_id);
create index ifn_orders_user on public.orders(user_id);
create index ifn_order_items_order on public.order_items(order_id);
create index ifn_order_items_product on public.order_items(product_id);
create index ifn_order_status_history_order on public.order_status_history(order_id);
create index ifn_wishlist_items_user on public.wishlist_items(user_id);
create index ifn_wishlist_items_product on public.wishlist_items(product_id);
create index ifn_reviews_product on public.reviews(product_id);
create index ifn_reviews_user on public.reviews(user_id);

-- ── Filter-Heavy & Sorting indexes ──────────────────────────
create index ifn_products_active on public.products(is_active);
create index ifn_products_featured on public.products(is_featured, featured_display_order) where is_featured = true;
create index ifn_products_bestseller on public.products(is_bestseller) where is_bestseller = true;
create index ifn_products_new_arrival on public.products(is_new_arrival) where is_new_arrival = true;
create index ifn_products_price on public.products(price);
create index ifn_products_rating on public.products(rating_avg desc);
create index ifn_products_created on public.products(created_at desc);

create index ifn_categories_active on public.categories(is_active, display_order);
create index ifn_categories_featured on public.categories(is_featured, display_order) where is_featured = true;

create index ifn_orders_status on public.orders(status);
create index ifn_orders_created on public.orders(created_at desc);

create index ifn_reviews_status on public.reviews(status, product_id);

create index ifn_hero_slides_active on public.hero_slides(is_active, display_order);
create index ifn_promo_tiles_active on public.promo_tiles(is_active, display_order);

-- ── Full-Text Search (GIN Index on tsvector with weighted terms) ──
create index ifn_products_search_gin on public.products using gin(search_vector);
