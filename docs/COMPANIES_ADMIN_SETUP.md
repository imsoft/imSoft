# Configuración de Empresas para Administradores

Este documento explica cómo configurar la funcionalidad para que los administradores puedan crear empresas sin usuarios asociados.

## Pasos de Configuración

### 1. Ejecutar el script para permitir user_id NULL

Ejecuta el siguiente script en el SQL Editor de Supabase:

```sql
-- Modificar la columna user_id para permitir NULL
ALTER TABLE companies
ALTER COLUMN user_id DROP NOT NULL;
```

### 2. Actualizar las políticas RLS

Ejecuta el script completo `scripts/allow-null-user-id-in-companies.sql` en Supabase. Este script:

- Permite que `user_id` sea `NULL`
- Actualiza las políticas RLS para que los administradores puedan ver y gestionar todas las empresas (incluyendo las sin usuario)
- Permite que los usuarios vean empresas sin usuario (para poder asociarlas después)

### 3. Verificar las políticas

Después de ejecutar el script, verifica que las políticas estén correctamente configuradas:

```sql
-- Ver todas las políticas de la tabla companies
SELECT * FROM pg_policies WHERE tablename = 'companies';
```

Deberías ver:
- "Admins can manage all companies" - Para todas las operaciones de admin
- "Users can view their own companies" - Para que los usuarios vean sus empresas y las sin usuario

## Uso

Una vez configurado:

1. **Crear empresas sin usuario**: Los administradores pueden ir a `/es/dashboard/admin/companies` y crear empresas sin asignar un usuario.

2. **Asociar empresas a usuarios**: Cuando un cliente se registre, puedes editar la empresa y asignarle su `user_id` manualmente, o crear una funcionalidad para asociar empresas existentes a usuarios.

## Solución de Problemas

### Error: "Error fetching companies: {}"

Si ves este error, verifica:

1. **¿Se ejecutó el script SQL?**
   - Verifica que `user_id` permita NULL: `SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'companies' AND column_name = 'user_id';`
   - Debería mostrar `is_nullable = YES`

2. **¿Las políticas RLS están correctas?**
   - Verifica que tu usuario tenga el rol 'admin' en `user_metadata`
   - Ejecuta: `SELECT raw_user_meta_data->>'role' FROM auth.users WHERE email = 'tu-email@ejemplo.com';`
   - Debería mostrar `"admin"`

3. **¿La tabla existe?**
   - Verifica que la tabla `companies` existe: `SELECT * FROM information_schema.tables WHERE table_name = 'companies';`

### Si el error persiste

1. Verifica los logs del servidor para más detalles del error
2. Intenta ejecutar la consulta directamente en Supabase SQL Editor:
   ```sql
   SELECT * FROM companies ORDER BY name;
   ```
3. Si funciona en SQL Editor pero no en la app, el problema es de RLS. Revisa las políticas.

