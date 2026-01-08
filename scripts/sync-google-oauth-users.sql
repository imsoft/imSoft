-- Script para sincronizar usuarios de Google OAuth con la metadata correcta
-- Este script crea una función que se ejecuta automáticamente cuando un usuario
-- se registra o actualiza su información

-- Función para sincronizar metadata de usuarios de Google OAuth
CREATE OR REPLACE FUNCTION sync_google_oauth_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo procesar si es un nuevo usuario o si cambió el proveedor
  IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.raw_app_meta_data IS DISTINCT FROM NEW.raw_app_meta_data)) THEN

    -- Verificar si el usuario se registró con Google
    IF NEW.raw_app_meta_data->>'provider' = 'google' THEN

      -- Si no tiene first_name en user_metadata, extraerlo de raw_user_meta_data
      IF NEW.raw_user_meta_data->>'first_name' IS NULL OR NEW.raw_user_meta_data->>'first_name' = '' THEN

        -- Intentar extraer el nombre completo y dividirlo
        DECLARE
          full_name TEXT;
          name_parts TEXT[];
          first_name TEXT;
          last_name TEXT;
        BEGIN
          -- Obtener el nombre completo de Google
          full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            ''
          );

          -- Dividir el nombre en partes
          IF full_name != '' THEN
            name_parts := string_to_array(full_name, ' ');

            -- Asignar first_name (primera parte)
            first_name := name_parts[1];

            -- Asignar last_name (resto de las partes)
            IF array_length(name_parts, 1) > 1 THEN
              last_name := array_to_string(name_parts[2:array_length(name_parts, 1)], ' ');
            ELSE
              last_name := '';
            END IF;

            -- Actualizar el user_metadata
            NEW.raw_user_meta_data := jsonb_set(
              COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
              '{first_name}',
              to_jsonb(first_name)
            );

            NEW.raw_user_meta_data := jsonb_set(
              NEW.raw_user_meta_data,
              '{last_name}',
              to_jsonb(last_name)
            );
          END IF;
        END;
      END IF;

      -- Si no tiene rol asignado, asignar 'client' por defecto
      IF NEW.raw_user_meta_data->>'role' IS NULL OR NEW.raw_user_meta_data->>'role' = '' THEN
        NEW.raw_user_meta_data := jsonb_set(
          COALESCE(NEW.raw_user_meta_data, '{}'::jsonb),
          '{role}',
          '"client"'
        );
      END IF;

      -- Asegurar que full_name esté presente
      IF NEW.raw_user_meta_data->>'full_name' IS NULL OR NEW.raw_user_meta_data->>'full_name' = '' THEN
        NEW.raw_user_meta_data := jsonb_set(
          NEW.raw_user_meta_data,
          '{full_name}',
          to_jsonb(COALESCE(NEW.raw_user_meta_data->>'name', ''))
        );
      END IF;

      -- Si no tiene company_name, establecer un valor por defecto
      IF NEW.raw_user_meta_data->>'company_name' IS NULL OR NEW.raw_user_meta_data->>'company_name' = '' THEN
        NEW.raw_user_meta_data := jsonb_set(
          NEW.raw_user_meta_data,
          '{company_name}',
          '""'
        );
      END IF;

    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar el trigger si existe
DROP TRIGGER IF EXISTS sync_google_oauth_metadata_trigger ON auth.users;

-- Crear el trigger que se ejecuta ANTES de insertar o actualizar
CREATE TRIGGER sync_google_oauth_metadata_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_google_oauth_metadata();

-- Comentario explicativo
COMMENT ON FUNCTION sync_google_oauth_metadata() IS
'Sincroniza automáticamente la metadata de usuarios que se registran con Google OAuth.
Extrae first_name y last_name del nombre completo, asigna rol de cliente por defecto,
y asegura que todos los campos necesarios estén presentes.';
