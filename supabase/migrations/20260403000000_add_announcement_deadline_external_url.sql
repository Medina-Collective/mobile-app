-- Add deadline and external_url columns to announcements table

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS deadline timestamptz,
  ADD COLUMN IF NOT EXISTS external_url text;
