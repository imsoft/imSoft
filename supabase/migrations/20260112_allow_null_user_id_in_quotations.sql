-- Permitir user_id nulo en la tabla quotations para cotizaciones públicas
ALTER TABLE quotations ALTER COLUMN user_id DROP NOT NULL;

-- Agregar comentario explicativo
COMMENT ON COLUMN quotations.user_id IS 'ID del usuario. NULL para cotizaciones públicas (sin registro)';
