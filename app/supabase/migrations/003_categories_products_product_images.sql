-- ============================================================
-- 003_categories_products_product_images.sql
-- Categories (with hierarchy), Products, and Product Images
-- ============================================================

-- ── CATEGORIES ──────────────────────────────────────────────
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  icon text,
  image_url text,
  description text,
  display_order int not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_category_not_self_parent check (id != parent_id)
);

-- ── PRODUCTS ────────────────────────────────────────────────
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  product_type public.product_type not null default 'other',
  price numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= 0),
  cost_price numeric(10,2) check (cost_price is null or cost_price >= 0),
  sku text not null unique,
  category_id uuid not null references public.categories(id) on delete restrict,
  brand_id uuid references public.brands(id) on delete set null,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  min_stock_threshold int not null default 5 check (min_stock_threshold >= 0),
  featured_display_order int,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_new_arrival boolean not null default false,
  is_active boolean not null default true,
  rating_avg numeric(3,2) not null default 0 check (rating_avg between 0 and 5),
  review_count int not null default 0 check (review_count >= 0),
  seo_title text,
  seo_description text,
  search_vector tsvector,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── PRODUCT IMAGES ──────────────────────────────────────────
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  display_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
