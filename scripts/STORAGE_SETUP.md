# 📦 Configuración de Storage en Supabase

Este documento explica cómo configurar y gestionar el almacenamiento de archivos en Supabase para el proyecto imSoft.

## 📋 Tabla de Contenidos

1. [Estructura de Buckets](#estructura-de-buckets)
2. [Configuración Inicial](#configuración-inicial)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Políticas de Acceso](#políticas-de-acceso)
5. [Uso en el Código](#uso-en-el-código)
6. [Troubleshooting](#troubleshooting)

---

## 🪣 Estructura de Buckets

El proyecto utiliza 2 buckets principales:

### 1. `company-logos`
- **Propósito**: Almacenar logos de empresas
- **Público**: ✅ Sí
- **Tamaño máximo**: 5MB
- **Formatos**: JPG, PNG, WebP, GIF, SVG
- **Estructura**: `/<company_id>/logo.ext`

### 2. `images`
- **Propósito**: Imágenes generales del sitio (servicios, blog, portfolio, proyectos, perfil)
- **Público**: ✅ Sí
- **Tamaño máximo**: 10MB
- **Formatos**: JPG, PNG, WebP, GIF, SVG
- **Estructura**: `/<resource_id>/image.ext`

---

## ⚙️ Configuración Inicial

### Paso 1: Variables de Entorno

Asegúrate de tener estas variables en tu `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Paso 2: Crear los Buckets

Ejecuta el script de TypeScript para crear los buckets automáticamente:

```bash
npx tsx scripts/setup-storage-buckets.ts
```

Este script:
- ✅ Crea los buckets si no existen
- ✅ Actualiza la configuración si ya existen
- ✅ Muestra información detallada del proceso
- ✅ Verifica que todo esté correcto

### Paso 3: Configurar las Políticas RLS

**⚠️ IMPORTANTE**: Las políticas de Storage SOLO pueden configurarse desde el Dashboard de Supabase, no desde scripts externos.

1. Ve a **Supabase Dashboard** → Tu Proyecto → **SQL Editor**
2. Abre el archivo `scripts/setup-storage-policies.sql`
3. Copia TODO el contenido del archivo
4. Pégalo en el SQL Editor
5. Haz clic en **Run** para ejecutar el script
6. Verifica que se hayan creado todas las políticas (el script incluye queries de verificación al final)

**Si obtienes el error**: `"must be owner of relation objects"`
- Esto significa que estás intentando ejecutar el script desde fuera del Dashboard
- SOLUCIÓN: Ejecuta el script directamente en el SQL Editor del Dashboard de Supabase

---

## 📁 Estructura de Archivos

### Company Logos

```
company-logos/
├── {company-id-1}/
│   └── logo.png
├── {company-id-2}/
│   └── logo.jpg
└── {company-id-3}/
    └── logo.webp
```

**Ejemplo**:
```
company-logos/1505c3e5-f168-4ee3-abf5-c9478c5abd95/logo.png
```

### Images (General)

```
images/
├── {service-id}/
│   └── hero.jpg
├── {blog-id}/
│   └── cover.png
├── {portfolio-id}/
│   └── thumbnail.webp
├── {project-id}/
│   └── screenshot.jpg
└── {user-id}/
    └── avatar.png
```

**Ejemplos**:
```
images/a1b2c3d4-e5f6-7890-abcd-ef1234567890/hero.jpg
images/z9y8x7w6-v5u4-3210-zyxw-vu9876543210/cover.png
```

---

## 🔐 Políticas de Acceso

### Company Logos

| Operación | Quién | Condiciones |
|-----------|-------|-------------|
| **SELECT** (Leer) | 👥 Todos | Acceso público |
| **INSERT** (Subir) | 🔒 Autenticados | Cualquier usuario autenticado |
| **UPDATE** (Actualizar) | 🔒 Owner o Admin | Solo el dueño de la empresa o un admin |
| **DELETE** (Eliminar) | 🔒 Owner o Admin | Solo el dueño de la empresa o un admin |

### Images

| Operación | Quién | Condiciones |
|-----------|-------|-------------|
| **SELECT** (Leer) | 👥 Todos | Acceso público |
| **INSERT** (Subir) | 🔒 Autenticados | Cualquier usuario autenticado |
| **UPDATE** (Actualizar) | 👑 Solo Admins | Solo administradores |
| **DELETE** (Eliminar) | 👑 Solo Admins | Solo administradores |

---

## 💻 Uso en el Código

### Subir Logo de Empresa

```typescript
// En el formulario de empresa
async function handleFileUpload(file: File) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()

  // Usar el ID de la empresa para la ruta
  const companyId = company.id || crypto.randomUUID()
  const filePath = `${companyId}/logo.${fileExt}`

  // Subir con upsert: true para reemplazar el logo existente
  const { error } = await supabase.storage
    .from('company-logos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error

  // Obtener URL pública
  const { data } = supabase.storage
    .from('company-logos')
    .getPublicUrl(filePath)

  return data.publicUrl
}
```

### Subir Imagen General (Servicio, Blog, etc.)

```typescript
// En el formulario de servicio/blog/portfolio/proyecto
async function handleImageUpload(file: File, resourceId: string, imageName: string) {
  const supabase = createClient()
  const fileExt = file.name.split('.').pop()

  // Estructura: /<resource_id>/<nombre>.ext
  const filePath = `${resourceId}/${imageName}.${fileExt}`

  const { error } = await supabase.storage
    .from('images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error

  const { data } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return data.publicUrl
}
```

### Eliminar Imagen

```typescript
async function deleteImage(bucketName: string, filePath: string) {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath])

  if (error) throw error
}

// Ejemplo de uso
await deleteImage('company-logos', `${companyId}/logo.png`)
await deleteImage('images', `${serviceId}/hero.jpg`)
```

### Obtener URL Pública

```typescript
function getPublicUrl(bucketName: string, filePath: string) {
  const supabase = createClient()

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)

  return data.publicUrl
}

// Ejemplo de uso
const logoUrl = getPublicUrl('company-logos', `${companyId}/logo.png`)
const heroUrl = getPublicUrl('images', `${serviceId}/hero.jpg`)
```

---

## 🔧 Troubleshooting

### Error: "must be owner of relation objects"

**Causa**: Intentando ejecutar el script de políticas desde fuera del Dashboard de Supabase.

**Solución**:
1. Las políticas de `storage.objects` solo pueden modificarse desde el Dashboard
2. Ve a **Supabase Dashboard** → **SQL Editor**
3. Copia el contenido de `setup-storage-policies.sql`
4. Pégalo en el editor y ejecuta desde ahí
5. ❌ NO uses `psql`, scripts externos, o herramientas de terceros

### Error: "new row violates row-level security policy"

**Causa**: Las políticas RLS no permiten la operación.

**Solución**:
1. Verifica que el usuario esté autenticado
2. Revisa las políticas en Supabase Dashboard > Storage > Policies
3. Ejecuta `setup-storage-policies.sql` nuevamente

### Error: "The resource already exists"

**Causa**: Intentando subir un archivo que ya existe sin `upsert: true`.

**Solución**:
```typescript
// Opción 1: Usar upsert para reemplazar
upload(filePath, file, { upsert: true })

// Opción 2: Eliminar el archivo primero
await supabase.storage.from(bucket).remove([filePath])
await supabase.storage.from(bucket).upload(filePath, file)
```

### Error: "File size exceeds the limit"

**Causa**: El archivo es más grande que el límite del bucket.

**Solución**:
- Company logos: Máximo 5MB
- Images: Máximo 10MB
- Valida el tamaño antes de subir:

```typescript
if (file.size > 5 * 1024 * 1024) {
  throw new Error('El archivo debe ser menor a 5MB')
}
```

### No puedo ver las imágenes subidas

**Causa**: El bucket no es público o la URL es incorrecta.

**Solución**:
1. Verifica que el bucket sea público en Dashboard > Storage > Settings
2. Usa `getPublicUrl()` en lugar de construir la URL manualmente
3. Revisa la consola del navegador para errores CORS

### Las políticas no funcionan correctamente

**Causa**: Política mal configurada o caché.

**Solución**:
1. Elimina las políticas existentes
2. Ejecuta `setup-storage-policies.sql` nuevamente
3. Cierra sesión y vuelve a iniciar
4. Limpia el caché del navegador

---

## 📊 Verificación

### Verificar Buckets Creados

```sql
SELECT * FROM storage.buckets;
```

### Verificar Políticas

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY policyname;
```

### Verificar Archivos

```sql
SELECT
  name,
  bucket_id,
  created_at,
  metadata
FROM storage.objects
WHERE bucket_id IN ('company-logos', 'images')
ORDER BY created_at DESC;
```

---

## 🎯 Mejores Prácticas

1. **Usa `upsert: true`** cuando quieras reemplazar archivos existentes
2. **Valida el tamaño** antes de subir (evita costos innecesarios)
3. **Valida el tipo MIME** para asegurar que sean imágenes
4. **Usa WebP** cuando sea posible (mejor compresión)
5. **Optimiza las imágenes** antes de subirlas
6. **Estructura consistente**: Siempre usa `/<id>/nombre.ext`
7. **Elimina archivos viejos** cuando se reemplacen
8. **Usa cache control** apropiado (`3600` = 1 hora)

---

## 📚 Referencias

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

---

## 📝 Notas Adicionales

### Migración de Archivos Existentes

Si ya tienes archivos en el bucket con la estructura antigua (`admin/filename.ext`), necesitarás migrarlos:

```typescript
// Script de migración (ejecutar una vez)
async function migrateFiles() {
  const supabase = createClient()

  // Listar archivos en la carpeta 'admin'
  const { data: files } = await supabase.storage
    .from('company-logos')
    .list('admin')

  for (const file of files || []) {
    // Descargar archivo
    const { data: fileData } = await supabase.storage
      .from('company-logos')
      .download(`admin/${file.name}`)

    // Subir a nueva ubicación
    const companyId = 'obtener-del-database'
    const ext = file.name.split('.').pop()
    await supabase.storage
      .from('company-logos')
      .upload(`${companyId}/logo.${ext}`, fileData!, {
        upsert: true
      })

    // Eliminar archivo viejo (opcional)
    await supabase.storage
      .from('company-logos')
      .remove([`admin/${file.name}`])
  }
}
```

### Monitoreo de Almacenamiento

Revisa regularmente el uso de storage en Supabase Dashboard > Settings > Usage para evitar sorpresas en la facturación.

---

**Última actualización**: Diciembre 2024
