-- Tabla de relación entre cotizaciones y tecnologías
CREATE TABLE IF NOT EXISTS quotation_technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  technology_id UUID NOT NULL REFERENCES technologies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quotation_id, technology_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_quotation_technologies_quotation_id ON quotation_technologies(quotation_id);
CREATE INDEX IF NOT EXISTS idx_quotation_technologies_technology_id ON quotation_technologies(technology_id);

-- RLS Policies
ALTER TABLE quotation_technologies ENABLE ROW LEVEL SECURITY;

-- Política para que los admins puedan ver todas las relaciones
CREATE POLICY "Admins can view all quotation technologies"
  ON quotation_technologies
  FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los admins puedan insertar relaciones
CREATE POLICY "Admins can insert quotation technologies"
  ON quotation_technologies
  FOR INSERT
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los admins puedan actualizar relaciones
CREATE POLICY "Admins can update quotation technologies"
  ON quotation_technologies
  FOR UPDATE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los admins puedan eliminar relaciones
CREATE POLICY "Admins can delete quotation technologies"
  ON quotation_technologies
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los usuarios puedan ver las tecnologías de sus cotizaciones
CREATE POLICY "Users can view their quotation technologies"
  ON quotation_technologies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM quotations
      WHERE quotations.id = quotation_technologies.quotation_id
      AND quotations.user_id = auth.uid()
    )
  );
