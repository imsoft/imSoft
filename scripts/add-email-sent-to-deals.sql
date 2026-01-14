-- Agregar campo email_sent a la tabla deals para rastrear si se envió correo
ALTER TABLE deals
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false;

-- Cambiar el valor por defecto del stage a 'no_contact' para nuevos deals
ALTER TABLE deals
ALTER COLUMN stage SET DEFAULT 'no_contact';

-- Actualizar deals existentes sin stage específico a 'no_contact' (opcional, solo si quieres migrar datos existentes)
-- UPDATE deals SET stage = 'no_contact' WHERE stage IS NULL;

-- Índice para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_deals_email_sent ON deals(email_sent);

-- Comentario
COMMENT ON COLUMN deals.email_sent IS 'Indica si se ha enviado correo electrónico al contacto de este deal';
