-- Tabla para guardar reportes generados
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type VARCHAR(50) NOT NULL, -- 'users', 'projects', 'services', etc.
  report_format VARCHAR(10) NOT NULL, -- 'json', 'csv'
  file_url TEXT, -- URL del archivo guardado en storage (opcional)
  file_name TEXT NOT NULL, -- Nombre del archivo
  file_size INTEGER, -- Tamaño del archivo en bytes
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_type ON reports(report_type);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON reports(generated_at DESC);

-- RLS Policies
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Política para que los admins puedan ver todos los reportes
CREATE POLICY "Admins can view all reports"
  ON reports
  FOR SELECT
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los admins puedan insertar reportes
CREATE POLICY "Admins can insert reports"
  ON reports
  FOR INSERT
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los admins puedan eliminar reportes
CREATE POLICY "Admins can delete reports"
  ON reports
  FOR DELETE
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Política para que los usuarios puedan ver sus propios reportes
CREATE POLICY "Users can view their own reports"
  ON reports
  FOR SELECT
  USING (user_id = auth.uid());
