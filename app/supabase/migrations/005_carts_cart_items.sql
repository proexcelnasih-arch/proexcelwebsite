-- ============================================================
-- 005_carts_cart_items.sql
-- Shopping carts and Cart items for authenticated & guest users
-- ============================================================

-- ── CARTS ───────────────────────────────────────────────────
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  session_token text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_cart_owner check (
    (user_id is not null) or (session_token is not null)
  )
);

-- ── CART ITEMS ──────────────────────────────────────────────
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(cart_id, product_id)
);
