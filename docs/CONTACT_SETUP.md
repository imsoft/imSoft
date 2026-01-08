# Configuración de la Tabla Contact

Esta guía explica cómo crear la tabla `contact` en Supabase para almacenar la información de contacto de la empresa.

## Crear la Tabla

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Abre el archivo `scripts/create-contact-table.sql`
4. Copia y pega todo el contenido del archivo
5. Haz clic en **Run** para ejecutar el script

## Estructura de la Tabla

La tabla `contact` contiene los siguientes campos:

- `id` (UUID): Identificador único
- `address` (TEXT): Dirección física de la empresa
- `phone` (TEXT): Número de teléfono de contacto
- `email` (TEXT): Correo electrónico de contacto
- `description` (TEXT): Descripción adicional de contacto
- `facebook` (TEXT): URL del perfil de Facebook
- `twitter` (TEXT): URL del perfil de Twitter/X
- `instagram` (TEXT): URL del perfil de Instagram
- `linkedin` (TEXT): URL del perfil de LinkedIn
- `youtube` (TEXT): URL del canal de YouTube
- `tiktok` (TEXT): URL del perfil de TikTok
- `twitch` (TEXT): URL del canal de Twitch
- `whatsapp` (TEXT): Número de WhatsApp o URL
- `created_at` (TIMESTAMP): Fecha de creación
- `updated_at` (TIMESTAMP): Fecha de última actualización

## Políticas RLS (Row Level Security)

La tabla tiene las siguientes políticas de seguridad:

1. **Lectura pública**: Cualquiera puede leer los datos de contacto
2. **Inserción**: Solo administradores pueden insertar datos
3. **Actualización**: Solo administradores pueden actualizar datos
4. **Eliminación**: Solo administradores pueden eliminar datos

## Función Auxiliar `is_admin()`

El script crea una función auxiliar `is_admin()` que verifica si el usuario actual es administrador. Esta función:

- Usa `SECURITY DEFINER` para poder acceder a `auth.users`
- Las políticas RLS no pueden acceder directamente a `auth.users`, por lo que necesitamos esta función auxiliar
- Verifica el rol del usuario desde `raw_user_meta_data->>'role'`

## Solución de Problemas

### Error: "permission denied for table users"

Si recibes este error después de crear la tabla, significa que las políticas RLS están intentando acceder a `auth.users` directamente. 

**Solución**: Ejecuta el script `scripts/fix-contact-rls-policies.sql` que:
1. Crea la función auxiliar `is_admin()` si no existe
2. Elimina las políticas existentes
3. Recrea las políticas usando la función auxiliar

### La función `is_admin()` ya existe

Si la función `is_admin()` ya existe (por ejemplo, de otra tabla), el script usará `CREATE OR REPLACE` para actualizarla. Esto es seguro porque todas las tablas pueden usar la misma función.

## Notas Importantes

- Solo debe haber un registro en la tabla `contact` (o ninguno)
- Los datos de contacto son públicos (cualquiera puede leerlos)
- Solo los administradores pueden modificar los datos
- El campo `updated_at` se actualiza automáticamente cuando se modifica un registro

