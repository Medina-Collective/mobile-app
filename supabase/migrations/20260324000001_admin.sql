-- ============================================================
-- Helper: check if current user is admin
-- ============================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  )
$$;

-- ============================================================
-- Admin RLS policies for professionals
-- ============================================================

-- Admin can read ALL professionals regardless of status
create policy "admins can read all professionals"
  on public.professionals for select
  using (public.is_admin());

-- Admin can update any professional (to approve / reject)
create policy "admins can update any professional"
  on public.professionals for update
  using (public.is_admin());
