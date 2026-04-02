ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS monetization_type text
  CHECK (monetization_type IN ('nonprofit', 'for_profit'));
