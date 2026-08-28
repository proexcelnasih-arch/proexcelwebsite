-- ============================================================
-- 008_coupons.sql
-- Coupons with validation constraints
-- ============================================================

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type public.coupon_type not null,
  value numeric(10,2) not null check (value >= 0),
  min_order_amount numeric(10,2) not null default 0 check (min_order_amount >= 0),
  max_uses int check (max_uses is null or max_uses >= 0),
  times_used int not null default 0 check (times_used >= 0),
  applies_to_category_ids uuid[],
  applies_to_product_ids uuid[],
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_coupon_value check (
    (type = 'percentage' and value <= 100) or (type = 'fixed')
  ),
  constraint chk_coupon_dates check (
    ends_at is null or starts_at is null or ends_at > starts_at
  )
);
