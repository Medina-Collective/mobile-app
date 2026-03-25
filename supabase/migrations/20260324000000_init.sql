-- ============================================================
-- Enums
-- ============================================================
create type public.profile_type as enum (
  'shop',
  'service',
  'organizer',
  'classes_circles'
);

create type public.profile_status as enum (
  'draft',
  'pending_review',
  'approved',
  'changes_requested',
  'rejected'
);

create type public.price_range as enum ('$', '$$', '$$$');

create type public.service_type_value as enum (
  'at_home',
  'has_studio',
  'online',
  'travels_to_client'
);

-- ============================================================
-- professionals
-- ============================================================
create table public.professionals (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users (id) on delete cascade,
  business_name    text not null,
  profile_type     public.profile_type not null,
  category         text not null,
  subcategories    text[]                    not null default '{}',
  service_types    public.service_type_value[] not null default '{}',
  based_in         text not null,
  serves_areas     text[]                    not null default '{}',
  description      text not null,
  inquiry_email    text not null,
  instagram        text,
  phone            text,
  website          text,
  booking_link     text,
  price_range      public.price_range,
  starting_price   text,
  logo_uri         text,
  status           public.profile_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger professionals_updated_at
  before update on public.professionals
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- favorites
-- ============================================================
create table public.favorites (
  user_id         uuid not null references auth.users (id) on delete cascade,
  professional_id uuid not null references public.professionals (id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (user_id, professional_id)
);

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table public.professionals enable row level security;
alter table public.favorites     enable row level security;

-- professionals: anyone can read approved profiles
create policy "approved profiles are public"
  on public.professionals for select
  using (status = 'approved');

-- professionals: owner can read their own profile regardless of status
create policy "owner can read own profile"
  on public.professionals for select
  using (user_id = auth.uid());

-- professionals: owner can insert
create policy "owner can create profile"
  on public.professionals for insert
  with check (user_id = auth.uid());

-- professionals: owner can update
create policy "owner can update profile"
  on public.professionals for update
  using (user_id = auth.uid());

-- favorites: user can read their own favorites
create policy "user can read own favorites"
  on public.favorites for select
  using (user_id = auth.uid());

-- favorites: user can insert their own favorites
create policy "user can add favorite"
  on public.favorites for insert
  with check (user_id = auth.uid());

-- favorites: user can delete their own favorites
create policy "user can remove favorite"
  on public.favorites for delete
  using (user_id = auth.uid());

-- ============================================================
-- Indexes
-- ============================================================
create index professionals_user_id_idx on public.professionals (user_id);
create index professionals_status_idx  on public.professionals (status);
create index favorites_user_id_idx     on public.favorites (user_id);
