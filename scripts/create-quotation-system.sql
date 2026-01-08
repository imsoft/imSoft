-- Sistema de Cotizaciones
-- Este script crea las tablas necesarias para el sistema de cotizador

-- Tabla de preguntas del cotizador
CREATE TABLE IF NOT EXISTS quotation_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  question_es TEXT NOT NULL,
  question_en TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL, -- 'multiple_choice', 'number', 'yes_no', 'range'
  options JSONB, -- Para preguntas de opción múltiple: [{ "label_es": "...", "label_en": "...", "price": 100 }]
  base_price DECIMAL(10, 2) DEFAULT 0, -- Precio base de la pregunta
  price_multiplier DECIMAL(10, 2) DEFAULT 1, -- Multiplicador para preguntas de número/rango
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de cotizaciones guardadas
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  client_company VARCHAR(255),
  answers JSONB NOT NULL, -- Almacena las respuestas del cuestionario
  subtotal DECIMAL(10, 2) NOT NULL,
  iva DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'converted'
  notes TEXT,
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_quotation_questions_service_id ON quotation_questions(service_id);
CREATE INDEX IF NOT EXISTS idx_quotation_questions_order ON quotation_questions(service_id, order_index);
CREATE INDEX IF NOT EXISTS idx_quotations_user_id ON quotations(user_id);
CREATE INDEX IF NOT EXISTS idx_quotations_service_id ON quotations(service_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_created_at ON quotations(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quotation_questions_updated_at
  BEFORE UPDATE ON quotation_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
  BEFORE UPDATE ON quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE quotation_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para quotation_questions
-- Todos pueden leer las preguntas
CREATE POLICY "Enable read access for all users"
  ON quotation_questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Solo admins pueden crear/actualizar/eliminar preguntas
CREATE POLICY "Enable insert for admins"
  ON quotation_questions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for admins"
  ON quotation_questions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for admins"
  ON quotation_questions
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas RLS para quotations
-- Los usuarios pueden leer sus propias cotizaciones
CREATE POLICY "Enable read access for own quotations"
  ON quotations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Los usuarios pueden crear cotizaciones
CREATE POLICY "Enable insert for authenticated users"
  ON quotations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias cotizaciones
CREATE POLICY "Enable update for own quotations"
  ON quotations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propias cotizaciones
CREATE POLICY "Enable delete for own quotations"
  ON quotations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comentarios
COMMENT ON TABLE quotation_questions IS 'Preguntas del cotizador configurables por servicio';
COMMENT ON TABLE quotations IS 'Cotizaciones generadas por los usuarios';
COMMENT ON COLUMN quotation_questions.question_type IS 'Tipo de pregunta: multiple_choice, number, yes_no, range';
COMMENT ON COLUMN quotation_questions.options IS 'Opciones para preguntas de opción múltiple con sus precios';
COMMENT ON COLUMN quotations.answers IS 'Respuestas del usuario en formato JSON';
COMMENT ON COLUMN quotations.status IS 'Estado: pending, approved, rejected, converted';
