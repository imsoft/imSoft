-- Hacer opcionales los campos first_name y last_name en la tabla contacts
-- Esto permite crear contactos sin nombre y apellido

-- Modificar first_name para permitir NULL
ALTER TABLE contacts
ALTER COLUMN first_name DROP NOT NULL;

-- Modificar last_name para permitir NULL
ALTER TABLE contacts
ALTER COLUMN last_name DROP NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN contacts.first_name IS 'Nombre del contacto (opcional)';
COMMENT ON COLUMN contacts.last_name IS 'Apellido del contacto (opcional)';
