-- Convert service_types from the old enum array to text[] so new values are accepted.
-- Validation is enforced at the application layer (Zod schema).
ALTER TABLE professionals
  ALTER COLUMN service_types TYPE text[] USING service_types::text[];

DROP TYPE IF EXISTS public.service_type_value;
