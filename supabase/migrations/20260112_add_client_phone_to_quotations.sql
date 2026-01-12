-- Agregar columna client_phone a la tabla quotations
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS client_phone TEXT;

-- Agregar comentario explicativo
COMMENT ON COLUMN quotations.client_phone IS 'Número de teléfono del cliente';
