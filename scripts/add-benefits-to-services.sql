-- Add benefits fields to services table
-- Benefits will be stored as JSONB array for both Spanish and English

ALTER TABLE services
ADD COLUMN IF NOT EXISTS benefits_es JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS benefits_en JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN services.benefits_es IS 'Array of benefit strings in Spanish, stored as ["Benefit 1", "Benefit 2", ...]';
COMMENT ON COLUMN services.benefits_en IS 'Array of benefit strings in English, stored as ["Benefit 1", "Benefit 2", ...]';
