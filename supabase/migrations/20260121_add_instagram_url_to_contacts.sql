-- Add instagram_url column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Add comment
COMMENT ON COLUMN contacts.instagram_url IS 'Instagram username or URL of the contact';
