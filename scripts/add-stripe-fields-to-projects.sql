-- Agregar campos de Stripe a la tabla projects
-- Para almacenar información de payment links de Stripe

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS stripe_payment_link_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_link_url TEXT,
ADD COLUMN IF NOT EXISTS stripe_enable_installments BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_installment_options TEXT; -- JSON array con opciones de meses sin intereses

-- Índice para búsquedas por payment link
CREATE INDEX IF NOT EXISTS idx_projects_stripe_payment_link_id ON projects(stripe_payment_link_id);

-- Comentarios para documentación
COMMENT ON COLUMN projects.stripe_payment_link_id IS 'ID del payment link de Stripe';
COMMENT ON COLUMN projects.stripe_payment_link_url IS 'URL del payment link de Stripe para compartir con el cliente';
COMMENT ON COLUMN projects.stripe_enable_installments IS 'Habilitar opciones de meses sin intereses';
COMMENT ON COLUMN projects.stripe_installment_options IS 'Opciones de meses sin intereses (JSON array, ej: ["3", "6", "12"])';

