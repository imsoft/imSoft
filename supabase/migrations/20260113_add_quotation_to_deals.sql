-- Agregar columna quotation_id a la tabla deals
ALTER TABLE deals
ADD COLUMN quotation_id uuid REFERENCES quotations(id) ON DELETE SET NULL;

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX idx_deals_quotation_id ON deals(quotation_id);

-- Comentar la columna para documentación
COMMENT ON COLUMN deals.quotation_id IS 'Cotización vinculada al negocio (opcional)';
