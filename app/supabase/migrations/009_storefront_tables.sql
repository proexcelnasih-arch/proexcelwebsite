-- ============================================================
-- 009_storefront_tables.sql
-- Hero slides and Promo tiles for homepage storefront
-- ============================================================

-- ── HERO SLIDES ─────────────────────────────────────────────
create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  cta_text text,
  cta_link text,
  image_url text,
  background_style text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── PROMO TILES ─────────────────────────────────────────────
create table public.promo_tiles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  link text,
  icon text,
  background_style text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
