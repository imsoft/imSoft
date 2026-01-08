# Guía de Migración de Datos

Esta guía explica cómo migrar datos de usuarios existentes a las nuevas tablas después de crearlas.

## Orden de Ejecución

1. **Crear todas las tablas** siguiendo el orden en `docs/DATABASE_SETUP.md`
2. **Ejecutar el script de migración** para usuarios existentes
3. **Verificar** que los datos se migraron correctamente

## Script de Migración

### Ejecutar el Script

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Abre el archivo `scripts/migrate-user-data.sql`
4. Copia y pega todo el contenido del archivo
5. Haz clic en **Run** para ejecutar el script

### ¿Qué hace el script?

El script `migrate-user-data.sql` migra los siguientes datos:

#### 1. Datos a `user_profiles`
- `first_name` de `user_metadata` → `user_profiles.first_name`
- `last_name` de `user_metadata` → `user_profiles.last_name`
- `avatar_url` de `user_metadata` → `user_profiles.avatar_url`

#### 2. Datos a `companies`
- `company_name` de `user_metadata` → `companies.name`
- Crea una empresa para cada usuario que tenga `company_name` en su metadata

### Características del Script

- **Idempotente**: Puedes ejecutarlo múltiples veces sin duplicar datos
- **Seguro**: Solo migra usuarios que aún no tienen perfil
- **No destructivo**: No elimina datos de `user_metadata` (se mantienen para compatibilidad)
- **Verificación**: Incluye consultas para verificar que la migración fue exitosa

## Verificar la Migración

Después de ejecutar el script, verifica los resultados:

### Verificar Perfiles de Usuarios

```sql
SELECT 
  u.email,
  up.first_name,
  up.last_name,
  up.avatar_url,
  CASE 
    WHEN up.id IS NOT NULL THEN 'Migrado'
    ELSE 'Sin migrar'
  END as estado
FROM auth.users u
LEFT JOIN user_profiles up ON up.user_id = u.id
ORDER BY u.created_at;
```

### Verificar Empresas Migradas

```sql
SELECT 
  u.email,
  c.name as company_name,
  c.created_at
FROM auth.users u
INNER JOIN companies c ON c.user_id = u.id
ORDER BY c.created_at;
```

### Verificar Usuarios con company_name pero sin Empresa

```sql
SELECT 
  u.email,
  u.raw_user_meta_data->>'company_name' as company_name_en_metadata
FROM auth.users u
WHERE u.raw_user_meta_data->>'company_name' IS NOT NULL
  AND u.raw_user_meta_data->>'company_name' != ''
  AND NOT EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.user_id = u.id
  );
```

## Migración Manual (Si es Necesario)

Si el script automático no funciona o necesitas más control, puedes migrar manualmente:

### Migrar un Usuario Específico a user_profiles

```sql
INSERT INTO user_profiles (user_id, first_name, last_name, avatar_url)
SELECT 
  id,
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE email = 'usuario@ejemplo.com'
ON CONFLICT (user_id) DO UPDATE
SET 
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  avatar_url = EXCLUDED.avatar_url;
```

### Migrar company_name de un Usuario Específico

```sql
INSERT INTO companies (user_id, name)
SELECT 
  id,
  raw_user_meta_data->>'company_name'
FROM auth.users
WHERE email = 'usuario@ejemplo.com'
  AND raw_user_meta_data->>'company_name' IS NOT NULL
  AND raw_user_meta_data->>'company_name' != ''
ON CONFLICT DO NOTHING;
```

## Notas Importantes

1. **No elimines `user_metadata`**: Los datos en `user_metadata` se mantienen para compatibilidad con el código existente
2. **El rol se mantiene en `user_metadata`**: El campo `role` (admin/client) permanece en `user_metadata` por razones de rendimiento y seguridad
3. **Empresas múltiples**: Si un usuario tiene varias empresas en el futuro, se crearán registros adicionales en la tabla `companies`
4. **Datos opcionales**: Si un usuario no tiene `first_name`, `last_name` o `company_name`, simplemente no se creará el registro correspondiente

## Solución de Problemas

### Error: "duplicate key value violates unique constraint"
- Esto significa que el usuario ya tiene un perfil. El script usa `ON CONFLICT DO NOTHING` para evitar este error.

### No se migraron todos los usuarios
- Verifica que los usuarios tengan datos en `user_metadata`
- Ejecuta las consultas de verificación para ver qué usuarios no se migraron

### Las empresas no se crearon
- Verifica que los usuarios tengan `company_name` en `user_metadata`
- Verifica que la tabla `companies` existe y tiene las políticas RLS correctas

