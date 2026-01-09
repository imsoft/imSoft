-- Agregar campos para administración de cotizaciones
-- Estos campos permiten al admin establecer precio final, tiempo estimado y recibir recomendaciones de IA

-- Precio final que el administrador decide cobrar al cliente
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS final_price DECIMAL(10, 2);

COMMENT ON COLUMN quotations.final_price IS 'Precio final decidido por el administrador para el cliente';

-- Tiempo estimado de desarrollo en días
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS estimated_development_time INTEGER;

COMMENT ON COLUMN quotations.estimated_development_time IS 'Tiempo estimado de desarrollo en días';

-- Recomendación de IA (almacena JSON con recomendaciones de precio y tiempo)
ALTER TABLE quotations 
ADD COLUMN IF NOT EXISTS ai_recommendation JSONB;

COMMENT ON COLUMN quotations.ai_recommendation IS 'Recomendaciones de IA sobre precio final y tiempo estimado de desarrollo';
