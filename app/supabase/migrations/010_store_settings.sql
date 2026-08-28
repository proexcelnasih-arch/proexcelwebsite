-- ============================================================
-- 010_store_settings.sql
-- Store settings singleton table (id = 1)
-- ============================================================

create table public.store_settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'ProExcel',
  description text,
  logo_url text,
  contact_email text,
  contact_phone text,
  address text,
  delivery_zones jsonb,
  free_shipping_threshold numeric(10,2) not null default 299 check (free_shipping_threshold >= 0),
  cod_enabled boolean not null default true,
  social_links jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
