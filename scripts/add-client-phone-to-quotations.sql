-- Agregar campo client_phone a la tabla quotations
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS client_phone VARCHAR(50);

COMMENT ON COLUMN quotations.client_phone IS 'Número de teléfono del cliente';
