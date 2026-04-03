-- ============================================================
-- saved_announcements
-- Persists user saves to Supabase so the server can use them
-- for event reminders and interest-based recommendations.
-- ============================================================
create table public.saved_announcements (
  user_id         uuid not null references auth.users (id) on delete cascade,
  announcement_id uuid not null references public.announcements (id) on delete cascade,
  created_at      timestamptz not null default now(),
  primary key (user_id, announcement_id)
);

alter table public.saved_announcements enable row level security;

create policy "user can read own saved"
  on public.saved_announcements for select
  using (user_id = auth.uid());

create policy "user can save"
  on public.saved_announcements for insert
  with check (user_id = auth.uid());

create policy "user can unsave"
  on public.saved_announcements for delete
  using (user_id = auth.uid());

create index saved_announcements_user_id_idx       on public.saved_announcements (user_id);
create index saved_announcements_announcement_idx  on public.saved_announcements (announcement_id);

-- ============================================================
-- push_tokens
-- Stores Expo push tokens per user for push delivery.
-- ============================================================
create table public.push_tokens (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users (id) on delete cascade,
  token      text        not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, token)
);

alter table public.push_tokens enable row level security;

create policy "user can manage own push token"
  on public.push_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create trigger push_tokens_updated_at
  before update on public.push_tokens
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- notifications
-- In-app notification inbox, written by edge functions.
-- ============================================================
create table public.notifications (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users (id) on delete cascade,
  type            text        not null check (type in (
                                'event_reminder',
                                'offer',
                                'announcement',
                                'saved_event',
                                'community'
                              )),
  title           text        not null,
  subtitle        text        not null,
  announcement_id uuid        references public.announcements (id) on delete set null,
  read            boolean     not null default false,
  created_at      timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "user can read own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "user can mark notifications read"
  on public.notifications for update
  using (user_id = auth.uid());

create index notifications_user_id_idx    on public.notifications (user_id);
create index notifications_created_at_idx on public.notifications (created_at desc);
create index notifications_unread_idx     on public.notifications (user_id, read) where read = false;
