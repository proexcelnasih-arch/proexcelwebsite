-- ============================================================
-- 001_extensions_and_enums.sql
-- Extensions and Enum types for ProExcel
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

-- User Role
create type public.user_role as enum (
  'customer',
  'admin'
);

-- Product Type
create type public.product_type as enum (
  'book',
  'stationery',
  'school_supply',
  'office',
  'art',
  'pack',
  'other'
);

-- Stock Movement Reason
create type public.stock_reason as enum (
  'restock',
  'sale',
  'return',
  'adjustment'
);

-- Order Status Workflow
create type public.order_status as enum (
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);

-- Payment Method (Cash on Delivery only)
create type public.payment_method as enum (
  'cod'
);

-- Payment Status
create type public.payment_status as enum (
  'pending',
  'paid',
  'failed'
);

-- Review Moderation Status
create type public.review_status as enum (
  'pending',
  'approved',
  'rejected'
);

-- Coupon Discount Type
create type public.coupon_type as enum (
  'percentage',
  'fixed'
);
