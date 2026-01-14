-- Agregar campo deal_id a la tabla quotations para conectar cotizaciones con negocios
ALTER TABLE quotations
ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE SET NULL;

-- Índice para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_quotations_deal_id ON quotations(deal_id);

-- Comentario
COMMENT ON COLUMN quotations.deal_id IS 'ID del negocio (deal) asociado a esta cotización';
