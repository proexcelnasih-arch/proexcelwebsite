-- ============================================================
-- 004_inventory.sql
-- Stock movements tracking table
-- ============================================================

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  change_amount int not null,
  reason public.stock_reason not null,
  admin_id uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
