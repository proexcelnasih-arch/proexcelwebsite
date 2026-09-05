-- ============================================================
-- 020_admin_audit_log.sql
-- Admin Audit Logging Table & RLS Policies
-- ============================================================

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,        -- e.g. 'product.delete', 'order.status_change', 'coupon.create', 'settings.update'
  target_table text,
  target_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow admins to read audit logs
DROP POLICY IF EXISTS "admin_audit_log_select_admin" ON public.admin_audit_log;
CREATE POLICY "admin_audit_log_select_admin"
  ON public.admin_audit_log
  FOR SELECT
  USING (public.is_admin());

-- Allow admins and service_role to insert audit logs
DROP POLICY IF EXISTS "admin_audit_log_insert_admin" ON public.admin_audit_log;
CREATE POLICY "admin_audit_log_insert_admin"
  ON public.admin_audit_log
  FOR INSERT
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- Create helpful indexing for action and date queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_action ON public.admin_audit_log (action);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target ON public.admin_audit_log (target_table, target_id);
