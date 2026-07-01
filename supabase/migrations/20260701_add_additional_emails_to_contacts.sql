-- Add additional_emails column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS additional_emails TEXT[];

COMMENT ON COLUMN contacts.additional_emails IS 'Additional email addresses for the contact';
