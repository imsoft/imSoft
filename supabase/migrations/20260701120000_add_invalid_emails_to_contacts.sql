-- Add invalid_emails column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS invalid_emails TEXT[] DEFAULT '{}';

COMMENT ON COLUMN contacts.invalid_emails IS 'Lista de correos de este contacto que han sido marcados como inexistentes o inválidos (rebotados)';
