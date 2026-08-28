-- ============================================================
-- 012_functions_and_triggers.sql
-- Database functions and automated triggers
-- ============================================================

-- ── Trigger Function: updated_at auto-updater ───────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply updated_at trigger across all mutable tables
create trigger trg_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger trg_addresses_updated_at before update on public.addresses for each row execute procedure public.set_updated_at();
create trigger trg_brands_updated_at before update on public.brands for each row execute procedure public.set_updated_at();
create trigger trg_categories_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
create trigger trg_products_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger trg_product_images_updated_at before update on public.product_images for each row execute procedure public.set_updated_at();
create trigger trg_carts_updated_at before update on public.carts for each row execute procedure public.set_updated_at();
create trigger trg_cart_items_updated_at before update on public.cart_items for each row execute procedure public.set_updated_at();
create trigger trg_orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
create trigger trg_order_items_updated_at before update on public.order_items for each row execute procedure public.set_updated_at();
create trigger trg_reviews_updated_at before update on public.reviews for each row execute procedure public.set_updated_at();
create trigger trg_coupons_updated_at before update on public.coupons for each row execute procedure public.set_updated_at();
create trigger trg_hero_slides_updated_at before update on public.hero_slides for each row execute procedure public.set_updated_at();
create trigger trg_promo_tiles_updated_at before update on public.promo_tiles for each row execute procedure public.set_updated_at();
create trigger trg_store_settings_updated_at before update on public.store_settings for each row execute procedure public.set_updated_at();

-- ── Trigger Function: Auto-create Profile on Auth Signup ─────
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Trigger Function: Maintain Product Search Vector ─────────
create or replace function public.maintain_product_search_vector()
returns trigger
language plpgsql
as $$
begin
  new.search_vector = 
    setweight(to_tsvector('french', unaccent(coalesce(new.name, ''))), 'A') ||
    setweight(to_tsvector('french', unaccent(coalesce(new.description, ''))), 'B') ||
    setweight(to_tsvector('simple', coalesce(new.sku, '')), 'A');
  return new;
end;
$$;

create trigger trg_products_search_vector
  before insert or update of name, description, sku on public.products
  for each row execute procedure public.maintain_product_search_vector();

-- ── Trigger Function: Maintain Product Rating Aggregates ─────
create or replace function public.recalculate_product_rating()
returns trigger
language plpgsql security definer
as $$
declare
  target_product_id uuid;
begin
  target_product_id := coalesce(new.product_id, old.product_id);

  update public.products
  set
    rating_avg = (
      select coalesce(round(avg(rating)::numeric, 2), 0)
      from public.reviews
      where product_id = target_product_id
        and status = 'approved'
    ),
    review_count = (
      select count(*)
      from public.reviews
      where product_id = target_product_id
        and status = 'approved'
    )
  where id = target_product_id;

  return coalesce(new, old);
end;
$$;

create trigger trg_reviews_aggregate_rating
  after insert or update of status, rating, product_id or delete on public.reviews
  for each row execute procedure public.recalculate_product_rating();
