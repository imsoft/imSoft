-- Agregar campos de visibilidad para redes sociales
-- Estos campos permiten controlar qué redes sociales se muestran en el footer

ALTER TABLE contact
ADD COLUMN IF NOT EXISTS facebook_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS twitter_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS instagram_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS linkedin_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS youtube_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS tiktok_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS twitch_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS whatsapp_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS spotify_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS threads_visible BOOLEAN DEFAULT true;

-- Comentarios para documentación
COMMENT ON COLUMN contact.facebook_visible IS 'Controla si Facebook se muestra en el footer';
COMMENT ON COLUMN contact.twitter_visible IS 'Controla si Twitter/X se muestra en el footer';
COMMENT ON COLUMN contact.instagram_visible IS 'Controla si Instagram se muestra en el footer';
COMMENT ON COLUMN contact.linkedin_visible IS 'Controla si LinkedIn se muestra en el footer';
COMMENT ON COLUMN contact.youtube_visible IS 'Controla si YouTube se muestra en el footer';
COMMENT ON COLUMN contact.tiktok_visible IS 'Controla si TikTok se muestra en el footer';
COMMENT ON COLUMN contact.twitch_visible IS 'Controla si Twitch se muestra en el footer';
COMMENT ON COLUMN contact.whatsapp_visible IS 'Controla si WhatsApp se muestra en el footer';
COMMENT ON COLUMN contact.spotify_visible IS 'Controla si Spotify se muestra en el footer';
COMMENT ON COLUMN contact.threads_visible IS 'Controla si Threads se muestra en el footer';
