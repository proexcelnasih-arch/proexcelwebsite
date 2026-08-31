-- ============================================================
-- 016_add_needs_manual_image_and_pending_source.sql
-- Add image review tracking and pending external image source fields
-- ============================================================

alter table public.products
  add column if not exists needs_manual_image boolean not null default false,
  add column if not exists pending_image_source text;

-- Create partial index for rapid lookup in admin panel
create index if not exists idx_products_needs_manual_image
  on public.products(needs_manual_image)
  where needs_manual_image = true;
