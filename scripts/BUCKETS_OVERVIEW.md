# 📦 Resumen de Buckets de Storage

Este documento proporciona una vista rápida de todos los buckets de Supabase Storage configurados para el proyecto imSoft.

## 🗂️ Estructura General

Todos los buckets siguen la misma estructura:
```
<bucket-name>/
├── <resource-id-1>/
│   └── imagen.ext
├── <resource-id-2>/
│   └── imagen.ext
└── <resource-id-3>/
    └── imagen.ext
```

---

## 📋 Lista de Buckets

### 1️⃣ company-logos
**Propósito**: Almacenar logos de empresas

| Propiedad | Valor |
|-----------|-------|
| **Público** | ✅ Sí |
| **Tamaño máx** | 5MB |
| **Formatos** | JPG, PNG, WebP, GIF, SVG |
| **Estructura** | `/<company_id>/logo.ext` |

**Ejemplo**:
```
company-logos/1505c3e5-f168-4ee3-abf5-c9478c5abd95/logo.png
```

**Código**:
```typescript
const filePath = `${companyId}/logo.png`
await supabase.storage.from('company-logos').upload(filePath, file, { upsert: true })
```

**Permisos**:
- 👥 Lectura: Público
- 🔒 Escritura: Owner de la empresa o Admin

---

### 2️⃣ profile-images
**Propósito**: Almacenar avatares de usuarios

| Propiedad | Valor |
|-----------|-------|
| **Público** | ✅ Sí |
| **Tamaño máx** | 5MB |
| **Formatos** | JPG, PNG, WebP, GIF |
| **Estructura** | `/<user_id>/avatar.ext` |

**Ejemplo**:
```
profile-images/a1b2c3d4-e5f6-7890-abcd-ef1234567890/avatar.jpg
```

**Código**:
```typescript
const filePath = `${userId}/avatar.jpg`
await supabase.storage.from('profile-images').upload(filePath, file, { upsert: true })
```

**Permisos**:
- 👥 Lectura: Público
- 🔒 Escritura: Owner del perfil o Admin

---

### 3️⃣ blog-images
**Propósito**: Almacenar imágenes de artículos del blog (covers, contenido)

| Propiedad | Valor |
|-----------|-------|
| **Público** | ✅ Sí |
| **Tamaño máx** | 10MB |
| **Formatos** | JPG, PNG, WebP, GIF, SVG |
| **Estructura** | `/<blog_id>/cover.ext`, `/<blog_id>/image-1.ext` |

**Ejemplos**:
```
blog-images/z9y8x7w6-v5u4-3210-zyxw-vu9876543210/cover.png
blog-images/z9y8x7w6-v5u4-3210-zyxw-vu9876543210/image-1.jpg
blog-images/z9y8x7w6-v5u4-3210-zyxw-vu9876543210/image-2.webp
```

**Código**:
```typescript
// Cover del artículo
const filePath = `${blogId}/cover.png`
await supabase.storage.from('blog-images').upload(filePath, file, { upsert: true })

// Imágenes adicionales
const filePath = `${blogId}/image-1.jpg`
await supabase.storage.from('blog-images').upload(filePath, file, { upsert: true })
```

**Permisos**:
- 👥 Lectura: Público
- 👑 Escritura: Solo Admins

---

### 4️⃣ service-images
**Propósito**: Almacenar imágenes de servicios (hero images, iconos)

| Propiedad | Valor |
|-----------|-------|
| **Público** | ✅ Sí |
| **Tamaño máx** | 10MB |
| **Formatos** | JPG, PNG, WebP, GIF, SVG |
| **Estructura** | `/<service_id>/hero.ext`, `/<service_id>/icon.ext` |

**Ejemplos**:
```
service-images/service-123-uuid/hero.jpg
service-images/service-123-uuid/icon.svg
```

**Código**:
```typescript
// Hero image del servicio
const filePath = `${serviceId}/hero.jpg`
await supabase.storage.from('service-images').upload(filePath, file, { upsert: true })

// Ícono del servicio
const filePath = `${serviceId}/icon.svg`
await supabase.storage.from('service-images').upload(filePath, file, { upsert: true })
```

**Permisos**:
- 👥 Lectura: Público
- 👑 Escritura: Solo Admins

---

### 5️⃣ portfolio-images
**Propósito**: Almacenar imágenes de portfolio (thumbnails, capturas de proyectos)

| Propiedad | Valor |
|-----------|-------|
| **Público** | ✅ Sí |
| **Tamaño máx** | 10MB |
| **Formatos** | JPG, PNG, WebP, GIF |
| **Estructura** | `/<portfolio_id>/thumbnail.ext` |

**Ejemplo**:
```
portfolio-images/portfolio-456-uuid/thumbnail.webp
```

**Código**:
```typescript
const filePath = `${portfolioId}/thumbnail.webp`
await supabase.storage.from('portfolio-images').upload(filePath, file, { upsert: true })
```

**Permisos**:
- 👥 Lectura: Público
- 👑 Escritura: Solo Admins

---

### 6️⃣ project-images
**Propósito**: Almacenar imágenes de proyectos (screenshots, demos, muestras)

| Propiedad | Valor |
|-----------|-------|
| **Público** | ✅ Sí |
| **Tamaño máx** | 10MB |
| **Formatos** | JPG, PNG, WebP, GIF |
| **Estructura** | `/<project_id>/screenshot-1.ext`, `/<project_id>/demo.ext` |

**Ejemplos**:
```
project-images/project-789-uuid/screenshot-1.png
project-images/project-789-uuid/screenshot-2.png
project-images/project-789-uuid/demo.gif
```

**Código**:
```typescript
// Multiple screenshots
const filePath = `${projectId}/screenshot-1.png`
await supabase.storage.from('project-images').upload(filePath, file, { upsert: true })

// Demo/GIF
const filePath = `${projectId}/demo.gif`
await supabase.storage.from('project-images').upload(filePath, file, { upsert: true })
```

**Permisos**:
- 👥 Lectura: Público
- 👑 Escritura: Solo Admins

---

### 7️⃣ testimonial-images
**Propósito**: Almacenar avatares de clientes en testimonios

| Propiedad | Valor |
|-----------|-------|
| **Público** | ✅ Sí |
| **Tamaño máx** | 5MB |
| **Formatos** | JPG, PNG, WebP, GIF |
| **Estructura** | `/<testimonial_id>/avatar.ext` |

**Ejemplo**:
```
testimonial-images/testimonial-101-uuid/avatar.jpg
```

**Código**:
```typescript
const filePath = `${testimonialId}/avatar.jpg`
await supabase.storage.from('testimonial-images').upload(filePath, file, { upsert: true })
```

**Permisos**:
- 👥 Lectura: Público
- 👑 Escritura: Solo Admins

---

## 📊 Resumen de Políticas

Cada bucket tiene 4 políticas (28 en total):

| Operación | Company Logos | Profile Images | Blog/Service/Portfolio/Project/Testimonial |
|-----------|---------------|----------------|-------------------------------------------|
| **SELECT** | 👥 Público | 👥 Público | 👥 Público |
| **INSERT** | 🔒 Autenticados | 🔒 Autenticados | 🔒 Autenticados |
| **UPDATE** | 🔒 Owner/Admin | 🔒 Owner/Admin | 👑 Solo Admins |
| **DELETE** | 🔒 Owner/Admin | 🔒 Owner/Admin | 👑 Solo Admins |

---

## 🎯 Convenciones de Nombres

### Para archivos únicos (logos, avatares):
```
<bucket>/<id>/nombre-descriptivo.ext
```

Ejemplos:
- `company-logos/abc-123/logo.png`
- `profile-images/user-456/avatar.jpg`
- `testimonial-images/test-789/avatar.webp`

### Para múltiples archivos (blog, proyectos):
```
<bucket>/<id>/nombre-archivo-1.ext
<bucket>/<id>/nombre-archivo-2.ext
```

Ejemplos:
- `blog-images/blog-123/cover.png`
- `blog-images/blog-123/image-1.jpg`
- `blog-images/blog-123/image-2.webp`
- `project-images/project-456/screenshot-1.png`
- `project-images/project-456/screenshot-2.png`

---

## ⚙️ Configuración

### Crear todos los buckets:
```bash
npx tsx scripts/setup-storage-buckets.ts
```

### Configurar todas las políticas:
1. Ve a Supabase Dashboard > SQL Editor
2. Copia el contenido de `scripts/setup-all-storage-policies.sql`
3. Pégalo y ejecuta
4. Verifica: deberías ver 28 políticas creadas

---

## 🔍 Verificación

### Ver todos los buckets:
```sql
SELECT * FROM storage.buckets ORDER BY name;
```

### Ver todas las políticas:
```sql
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
```

### Ver archivos en un bucket:
```sql
SELECT name, created_at, metadata
FROM storage.objects
WHERE bucket_id = 'company-logos'
ORDER BY created_at DESC;
```

---

## 📚 Referencias

- [Scripts de Setup](./README.md)
- [Documentación Completa](./STORAGE_SETUP.md)
- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)

---

**Última actualización**: Diciembre 2024
