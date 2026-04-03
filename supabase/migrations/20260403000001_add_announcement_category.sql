-- Add category column to announcements table

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS category text;
