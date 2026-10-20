-- Firma dibujada y huella de integridad en la aceptacion de contratos.
-- signed_signature: PNG en data URL con el trazo del cliente (firma con dedo o mouse).
-- signed_hash: SHA-256 del body_html en el momento exacto de la aceptacion; permite
-- probar que el texto que el cliente acepto es identico al que se conserva.
-- Aplicar a mano en el SQL Editor de Supabase.

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_signature TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_hash TEXT;
