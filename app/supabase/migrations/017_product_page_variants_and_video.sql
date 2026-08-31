-- ============================================================
-- 017_product_page_variants_and_video.sql
-- Add video_url column to products and create product_variants table
-- ============================================================

-- 1. Add video_url column to products table if not exists
alter table public.products add column if not exists video_url text;

-- 2. Create product_variants table
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_type text not null,       -- 'color' | 'size' | 'pack'
  label text not null,              -- e.g. "Bleu", "Pack de 5", "Grand Format"
  price_delta numeric default 0,    -- adjustment to base price (can be positive, negative, or 0)
  stock_quantity int default 10,
  display_order int default 0,
  created_at timestamptz default now()
);

-- 3. Create index for fast variant lookup by product_id
create index if not exists idx_product_variants_product_id on public.product_variants(product_id);

-- 4. Enable RLS
alter table public.product_variants enable row level security;

-- 5. RLS Policy: Anyone can view variants of active products
create policy "Allow public read access to product variants"
  on public.product_variants
  for select
  using (
    exists (
      select 1 from public.products
      where products.id = product_variants.product_id
      and products.is_active = true
    )
  );

-- 6. RLS Policy: Service role can manage all variants
create policy "Allow service role full access to product variants"
  on public.product_variants
  for all
  to service_role
  using (true)
  with check (true);
