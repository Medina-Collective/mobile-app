# Medina Collective – Research & Infrastructure TODO

## Infrastructure & Services

### Email
- [ ] **Custom professional email** — Set up a custom domain email (e.g. hello@medinacollective.com) via Namecheap Email Hosting: https://www.namecheap.com/hosting/email/

### Error Monitoring
- [ ] **Sentry** — Error monitoring and crash reporting platform. Captures runtime exceptions, stack traces, and performance issues automatically. Evaluate the React Native / Expo SDK: https://sentry.io
  - Free tier covers small teams (5k errors/month)
  - Relevant: yes — catch crashes in prod before users report them

### Authentication
- [ ] **Clerk** — Auth provider with prebuilt UI (sign-in, sign-up, MFA, social logins). Currently using Supabase Auth — evaluate whether migrating to Clerk is worth it for the added UX polish and user management dashboard: https://clerk.com
  - Note: Supabase Auth is already integrated; a migration would require updating RLS policies and JWT claims

### Transactional Email
- [ ] **Resend** — Developer-friendly email API for transactional messages: https://resend.com
  - Use cases (strictly necessary, no marketing):
    - Welcome email on sign-up
    - Participation confirmation when a user RSVPs to an event
    - Reminder email before an event (day before / morning of)
  - Free tier: 3,000 emails/month, 100/day

### Caching / Real-time
- [ ] **Redis** — In-memory key-value store. Evaluate relevance:
  - Potential use cases: rate limiting API routes, caching popular announcement feeds, session storage
  - Less critical while on Supabase (which has built-in real-time subscriptions and PostgREST caching)
  - Revisit if feed query performance becomes an issue at scale

### Analytics & Product Insight
- [ ] **PostHog** — Open-source product analytics: https://posthog.com
  - Tracks user events (screen views, button taps, feature usage) without being a privacy nightmare
  - Self-hostable or cloud (generous free tier: 1M events/month)
  - Relevant: yes — understand which announcement types are most popular, funnel drop-off on the create flow, follow/unfollow patterns

### Payments
- [ ] **Stripe** — Payment processing for paid event participation: https://stripe.com
  - Flow: PRO creates a paid announcement → attendee pays at RSVP → Stripe Connect routes funds to the PRO's account
  - Key concept: **Stripe Connect** (not regular Stripe) — allows the platform to collect payments on behalf of third-party PRO accounts
  - Considerations:
    - Platform fee: Stripe Connect allows taking a % cut per transaction
    - Payouts: PROs need to onboard with Stripe (KYC / bank details)
    - Refunds policy needs to be defined
  - Only relevant once participation feature is live and PROs want to monetise events

---

## Pending Technical Tasks


### Supabase setup (run before testing announcements)

1. Create **`announcement-images`** storage bucket (public read access)
2. Run announcements migration:
   ```sql
   CREATE TYPE announcement_type AS ENUM (
     'activity_event', 'bazaar', 'brand_popup', 'halaqa', 'limited_offer', 'other'
   );
   CREATE TYPE announcement_status AS ENUM ('draft', 'published', 'archived');

   CREATE TABLE announcements (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
     type announcement_type NOT NULL,
     title TEXT NOT NULL,
     description TEXT,
     cover_image_url TEXT,
     location TEXT,
     event_start TIMESTAMPTZ,
     event_end TIMESTAMPTZ,
     visibility_start TIMESTAMPTZ NOT NULL,
     visibility_end TIMESTAMPTZ NOT NULL,
     audience TEXT NOT NULL DEFAULT 'public' CHECK (audience IN ('public', 'pro_only')),
     participation_enabled BOOLEAN NOT NULL DEFAULT false,
     max_capacity INT,
     participant_count INT NOT NULL DEFAULT 0,
     status announcement_status NOT NULL DEFAULT 'published',
     created_at TIMESTAMPTZ NOT NULL DEFAULT now()
   );

   CREATE TABLE announcement_participants (
     announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
     user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     PRIMARY KEY (announcement_id, user_id)
   );

   -- Keep participant_count in sync automatically
   CREATE OR REPLACE FUNCTION sync_participant_count()
   RETURNS TRIGGER LANGUAGE plpgsql AS $$
   BEGIN
     IF TG_OP = 'INSERT' THEN
       UPDATE announcements SET participant_count = participant_count + 1 WHERE id = NEW.announcement_id;
     ELSIF TG_OP = 'DELETE' THEN
       UPDATE announcements SET participant_count = participant_count - 1 WHERE id = OLD.announcement_id;
     END IF;
     RETURN NULL;
   END;
   $$;

   CREATE TRIGGER sync_participant_count
   AFTER INSERT OR DELETE ON announcement_participants
   FOR EACH ROW EXECUTE FUNCTION sync_participant_count();
   ```

3. Run followers migration:
   ```sql
   CREATE TABLE followers (
     follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
     professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
     PRIMARY KEY (follower_id, professional_id)
   );
   ```

4. Create `is_professional()` helper + RLS policies:
   ```sql
   CREATE OR REPLACE FUNCTION is_professional()
   RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
     SELECT coalesce(
       (current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'role') = 'professional',
       false
     );
   $$;

   ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

   -- Everyone can read published public announcements; pros can also read pro_only
   CREATE POLICY "read published announcements" ON announcements
     FOR SELECT USING (
       status = 'published'
       AND visibility_start <= now()
       AND visibility_end >= now()
       AND (audience = 'public' OR is_professional())
     );

   -- PROs can only insert/update/delete their own announcements
   CREATE POLICY "pros manage own announcements" ON announcements
     FOR ALL USING (
       professional_id IN (
         SELECT id FROM professionals WHERE user_id = auth.uid()
       )
     );

   ALTER TABLE announcement_participants ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "users manage own participation" ON announcement_participants
     FOR ALL USING (user_id = auth.uid());

   CREATE POLICY "read participation counts" ON announcement_participants
     FOR SELECT USING (true);

   ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "users manage own follows" ON followers
     FOR ALL USING (follower_id = auth.uid());

   CREATE POLICY "read followers" ON followers
     FOR SELECT USING (true);
   ```

### Profile rework
- Deferred — user confirmed: "for the profile we need to rework it but later"
