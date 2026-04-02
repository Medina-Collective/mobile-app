-- Convert profile_type from the old enum to text so new values are accepted.
-- Validation is enforced at the application layer (Zod schema).
ALTER TABLE professionals
  ALTER COLUMN profile_type TYPE text USING profile_type::text;

DROP TYPE IF EXISTS public.profile_type;

-- Also add needs_follow_up to profile_status enum while we're here.
ALTER TYPE public.profile_status ADD VALUE IF NOT EXISTS 'needs_follow_up';
