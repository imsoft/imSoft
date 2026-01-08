# Configuración de Empresas

Esta guía explica cómo configurar la funcionalidad de empresas en el sistema, donde un cliente puede tener varias empresas y cada empresa puede tener varios proyectos.

## Estructura de Base de Datos

### Tabla `companies`

La tabla `companies` almacena las empresas de los usuarios. Un usuario puede tener varias empresas, y cada empresa puede tener varios proyectos.

## Crear la Tabla

### Opción 1: Usando el SQL Editor en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Abre el archivo `scripts/create-companies-table.sql`
4. Copia y pega todo el contenido del archivo
5. Haz clic en **Run** para ejecutar el script

### Opción 2: Usando la CLI de Supabase

Si tienes la CLI de Supabase instalada:

```bash
supabase db push
```

O ejecuta el script directamente:

```bash
psql -h <tu-host> -U postgres -d postgres -f scripts/create-companies-table.sql
```

## Configurar Storage para Logos

Si la tabla ya existe y necesitas agregar el campo `logo_url`, ejecuta:

```sql
-- Ejecuta el script scripts/add-logo-url-to-companies.sql
```

### Crear el Bucket de Storage

Necesitas crear un bucket en Supabase Storage para almacenar los logos de las empresas.

#### Opción 1: Usando la Interfaz Web (Recomendado)

**Paso 1: Crear el bucket desde la interfaz web**

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Storage** en el menú lateral
3. Haz clic en **New bucket** o **Create bucket**
4. Configura el bucket:
   - **Bucket name**: `company-logos` (exactamente así, sin espacios)
   - **Public bucket**: ✅ **Activado (ON)** - Esto es importante para que las imágenes sean accesibles
   - **Restrict file size**: Opcional (recomendado: 5MB = 5242880 bytes)
   - **Restrict MIME types**: Opcional (recomendado: activar y permitir `image/*` o tipos específicos como `image/jpeg`, `image/png`, `image/webp`)
5. Haz clic en **Create bucket**

**Paso 2: Configurar las políticas RLS desde la interfaz web**

Después de crear el bucket, configura las políticas desde la interfaz:

1. Ve a **Storage** → **Policies** (o haz clic en el bucket `company-logos` y luego en **Policies**)
2. Haz clic en **New Policy** o **Create Policy**
3. Crea las siguientes políticas:

   **Política 1: Lectura Pública**
   - Policy name: `Public Access for company-logos`
   - Allowed operation: `SELECT`
   - Policy definition: `bucket_id = 'company-logos'`
   - Haz clic en **Save**

   **Política 2: Subida para usuarios autenticados**
   - Policy name: `Authenticated users can upload to company-logos`
   - Allowed operation: `INSERT`
   - Policy definition: `bucket_id = 'company-logos' AND auth.role() = 'authenticated'`
   - Haz clic en **Save**

   **Política 3: Actualización para usuarios autenticados**
   - Policy name: `Authenticated users can update their own files in company-logos`
   - Allowed operation: `UPDATE`
   - Policy definition: `bucket_id = 'company-logos' AND auth.role() = 'authenticated'`
   - Haz clic en **Save**

   **Política 4: Eliminación para usuarios autenticados**
   - Policy name: `Authenticated users can delete their own files in company-logos`
   - Allowed operation: `DELETE`
   - Policy definition: `bucket_id = 'company-logos' AND auth.role() = 'authenticated'`
   - Haz clic en **Save**

**Nota**: Si el bucket es público, la política de lectura puede no ser necesaria, pero es recomendable tenerla para mayor control.

#### Opción 2: Configuración Simplificada (Solo Bucket Público)

Si solo necesitas que los logos sean accesibles públicamente y los usuarios puedan subirlos, puedes usar una configuración más simple:

1. Crea el bucket desde la interfaz web con **Public bucket** activado
2. Las políticas básicas se configuran automáticamente para buckets públicos
3. Si necesitas más control, agrega las políticas manualmente desde **Storage** → **Policies**

**Nota**: Si obtienes errores de permisos con SQL, siempre usa la interfaz web de Supabase para crear buckets y configurar políticas. Es más seguro y no requiere permisos especiales.

## Verificar la Configuración

Después de ejecutar el script, verifica que el bucket se creó correctamente:

```sql
-- Verificar que el bucket existe
SELECT * FROM storage.buckets WHERE id = 'company-logos';

-- Verificar las políticas RLS
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%company-logos%';
```

También puedes verificar en la interfaz web:
1. Ve a **Storage** → **Buckets**
2. Deberías ver `company-logos` en la lista
3. Haz clic en el bucket para ver sus configuraciones

## Verificar la Creación

Después de ejecutar el script, verifica que la tabla se creó correctamente:

```sql
-- Verificar que la tabla existe
SELECT * FROM companies LIMIT 1;

-- Verificar las políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'companies';
```

## Migración de Datos Existentes

Si ya tienes usuarios con `company_name` en `user_metadata`, puedes migrar esos datos a la nueva tabla:

```sql
-- Migrar company_name de user_metadata a companies
INSERT INTO companies (user_id, name)
SELECT 
  id as user_id,
  raw_user_meta_data->>'company_name' as name
FROM auth.users
WHERE raw_user_meta_data->>'company_name' IS NOT NULL
  AND raw_user_meta_data->>'company_name' != ''
  AND NOT EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.user_id = auth.users.id 
      AND companies.name = raw_user_meta_data->>'company_name'
  );
```

## Verificar la Creación

Después de ejecutar el script, verifica que la tabla se creó correctamente:

```sql
-- Verificar que la tabla existe
SELECT * FROM companies LIMIT 1;

-- Verificar las políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'companies';
```

## Migración de Datos Existentes

Si ya tienes usuarios con `company_name` en `user_metadata`, puedes migrar esos datos a la nueva tabla:

```sql
-- Migrar company_name de user_metadata a companies
INSERT INTO companies (user_id, name)
SELECT 
  id as user_id,
  raw_user_meta_data->>'company_name' as name
FROM auth.users
WHERE raw_user_meta_data->>'company_name' IS NOT NULL
  AND raw_user_meta_data->>'company_name' != ''
  AND NOT EXISTS (
    SELECT 1 FROM companies 
    WHERE companies.user_id = auth.users.id 
      AND companies.name = raw_user_meta_data->>'company_name'
  );
```

## Actualizar Tablas Relacionadas

Después de crear la tabla `companies`, necesitarás agregar la columna `company_id` a las tablas que se relacionan con empresas:

### Actualizar tabla `projects`

```sql
-- Agregar columna company_id
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Índice para búsquedas rápidas por empresa
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
```

### Actualizar tabla `portfolio`

```sql
-- Agregar columna company_id
ALTER TABLE portfolio
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Índice para búsquedas rápidas por empresa
CREATE INDEX IF NOT EXISTS idx_portfolio_company_id ON portfolio(company_id);
```

### Actualizar tabla `testimonials`

```sql
-- Agregar columna company_id
ALTER TABLE testimonials
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Índice para búsquedas rápidas por empresa
CREATE INDEX IF NOT EXISTS idx_testimonials_company_id ON testimonials(company_id);
```

## Funcionalidad

### Para Administradores

- Pueden ver todas las empresas de todos los clientes
- Pueden crear empresas para cualquier cliente
- Pueden editar y eliminar cualquier empresa
- Al crear proyectos, pueden seleccionar cualquier empresa

### Para Clientes

- Solo pueden ver sus propias empresas
- Solo pueden crear empresas para sí mismos
- Solo pueden editar y eliminar sus propias empresas
- Al crear proyectos, solo pueden seleccionar sus propias empresas

## API Endpoints

### GET `/api/companies`
- Obtiene todas las empresas (admin) o solo las del usuario actual (cliente)
- Query params: `user_id` (solo para admins)

### POST `/api/companies`
- Crea una nueva empresa
- Body: `{ name: string, user_id?: string }` (user_id solo para admins)

### PUT `/api/companies/[id]`
- Actualiza una empresa
- Body: `{ name: string }`

### DELETE `/api/companies/[id]`
- Elimina una empresa
- No permite eliminar empresas que tienen proyectos asociados

## Notas

- El campo `client` en proyectos se mantiene para compatibilidad con datos existentes
- El campo `company` en testimonials se mantiene para compatibilidad con datos existentes
- Los formularios ahora usan `company_id` para la relación con empresas
- Los nombres de empresas se sincronizan automáticamente en los campos legacy para mantener compatibilidad

