# Configuración de la Tabla de Perfiles de Usuarios

Esta guía explica cómo crear la tabla `user_profiles` en Supabase para almacenar información adicional de los usuarios.

## Estructura de la Tabla

La tabla `user_profiles` almacena información personal adicional de los usuarios que complementa la información básica en `auth.users`.

### Campos

- `id` (UUID): Identificador único del perfil
- `user_id` (UUID): Referencia al usuario en `auth.users` (único, un perfil por usuario)
- `first_name` (TEXT): Nombre del usuario
- `last_name` (TEXT): Apellido del usuario
- `avatar_url` (TEXT): URL de la imagen de perfil
- `created_at` (TIMESTAMP): Fecha de creación del perfil
- `updated_at` (TIMESTAMP): Fecha de última actualización (se actualiza automáticamente)

**Notas importantes**:
- El nombre completo se calcula dinámicamente como `first_name + ' ' + last_name` cuando sea necesario
- `company_name` NO está en esta tabla porque un usuario puede tener **varias empresas**. La relación usuario-empresa está en la tabla `companies` (uno a muchos: un usuario puede tener múltiples empresas)

## Crear la Tabla

### Opción 1: Usando el SQL Editor en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Abre el archivo `scripts/create-user-profiles-table.sql`
4. Copia y pega todo el contenido del archivo
5. Haz clic en **Run** para ejecutar el script

### Opción 2: Usando la CLI de Supabase

Si tienes la CLI de Supabase instalada:

```bash
supabase db push
```

O ejecuta el script directamente:

```bash
psql -h <tu-host> -U postgres -d postgres -f scripts/create-user-profiles-table.sql
```

## Verificar la Creación

Después de ejecutar el script, verifica que la tabla se creó correctamente:

```sql
-- Verificar que la tabla existe
SELECT * FROM user_profiles LIMIT 1;

-- Verificar las políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

## Migración de Datos Existentes

Si ya tienes usuarios con información en `user_metadata`, puedes migrar esos datos a la nueva tabla:

```sql
-- Migrar datos de user_metadata a user_profiles
-- Nota: company_name NO se migra aquí porque debe estar en la tabla 'companies'
INSERT INTO user_profiles (user_id, first_name, last_name, avatar_url)
SELECT 
  id as user_id,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles WHERE user_profiles.user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;

-- Si tienes company_name en user_metadata y quieres migrarlo a la tabla companies:
-- (Ejecuta esto DESPUÉS de crear la tabla companies)
-- INSERT INTO companies (user_id, name)
-- SELECT 
--   id as user_id,
--   raw_user_meta_data->>'company_name' as name
-- FROM auth.users
-- WHERE raw_user_meta_data->>'company_name' IS NOT NULL
--   AND raw_user_meta_data->>'company_name' != ''
--   AND NOT EXISTS (
--     SELECT 1 FROM companies WHERE companies.user_id = auth.users.id 
--       AND companies.name = raw_user_meta_data->>'company_name'
--   );
```

## Funcionalidad

### Para Usuarios

- Solo pueden ver su propio perfil
- Solo pueden crear/editar/eliminar su propio perfil
- Pueden actualizar su información personal (nombre, avatar, etc.)

### Para Administradores

- Pueden ver todos los perfiles
- Pueden crear/editar/eliminar cualquier perfil
- Pueden gestionar la información de todos los usuarios

## Sobre el Campo `role`

El **tipo de usuario (role)** se mantiene en `user_metadata` de `auth.users` y **NO** se almacena en `user_profiles` por las siguientes razones:

1. **Rendimiento**: Se accede frecuentemente para autorización sin necesidad de hacer JOINs
2. **Seguridad**: Está disponible directamente en el token de autenticación
3. **RLS Policies**: Las políticas de Row Level Security pueden verificar el rol rápidamente
4. **Control de acceso**: Se usa en middleware y layouts para redirigir usuarios según su rol

Si necesitas consultar el rol junto con otros datos del perfil, puedes hacer un JOIN:

```sql
SELECT 
  up.*,
  au.raw_user_meta_data->>'role' as role
FROM user_profiles up
JOIN auth.users au ON au.id = up.user_id;
```

## Notas

- La relación con `auth.users` es de uno a uno (un usuario = un perfil)
- Si se elimina un usuario de `auth.users`, su perfil se elimina automáticamente (CASCADE)
- El campo `updated_at` se actualiza automáticamente cuando se modifica el registro

