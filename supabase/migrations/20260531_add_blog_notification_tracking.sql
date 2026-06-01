-- ============================================================================
-- NOTIFICACIÓN DE NUEVOS ARTÍCULOS DEL BLOG
-- ============================================================================
-- Añade el campo que marca cuándo se notificó por correo un artículo a los
-- usuarios. Sirve de candado de idempotencia: si tiene valor, NO se vuelve a
-- enviar (aunque se edite el artículo).
-- ============================================================================

ALTER TABLE blog
  ADD COLUMN IF NOT EXISTS notification_sent_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN blog.notification_sent_at IS
  'Fecha/hora en que se envió el correo de aviso a los usuarios. NULL = aún no notificado.';

-- Índice parcial para localizar rápido los publicados sin notificar.
CREATE INDEX IF NOT EXISTS idx_blog_pending_notification
  ON blog (published)
  WHERE published = true AND notification_sent_at IS NULL;
