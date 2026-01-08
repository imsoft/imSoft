# Scripts de Administración

## 📋 Índice

1. [Asignar Rol de Administrador](#asignar-rol-de-administrador)
2. [Configuración de Políticas de Usuarios](#configuración-de-políticas-de-usuarios)
3. [Configuración de Políticas RLS para Tablas](#configuración-de-políticas-rls-para-tablas)
4. [Configuración de Storage](#configuración-de-storage)

---

## Asignar Rol de Administrador

### Opción 1: Usando SQL (Recomendado - Más Rápido)

1. Ve al dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Copia y pega el contenido de `set-admin-role.sql`
5. Modifica el email si es necesario (por defecto: `weareimsoft@gmail.com`)
6. Ejecuta el script

### Opción 2: Usando el Script TypeScript

1. Agrega la variable de entorno `SUPABASE_SERVICE_ROLE_KEY` a tu archivo `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
   ```
   
   Puedes encontrar el Service Role Key en:
   - Supabase Dashboard → Settings → API → Service Role Key

2. Instala `tsx` si no lo tienes:
   ```bash
   pnpm add -D tsx
   ```

3. Ejecuta el script:
   ```bash
   npx tsx scripts/set-admin-role.ts weareimsoft@gmail.com
   ```

### Verificar que Funcionó

Después de ejecutar cualquiera de las opciones, inicia sesión con el usuario `weareimsoft@gmail.com` y deberías ser redirigido al dashboard de administrador.

---

## Configuración de Políticas de Usuarios

### Descripción

**ℹ️ NOTA IMPORTANTE**: El acceso a usuarios ya está configurado correctamente en el backend usando el Admin Client de Supabase.

**NO necesitas ejecutar ningún script adicional** para acceder a la lista de usuarios. El API endpoint `/api/users` utiliza el `Service Role Key` que tiene acceso completo a todos los usuarios.

### Solución de Problemas

Si obtienes el error `"permission denied for table users"`, verifica:

1. **Variable de entorno `SUPABASE_SERVICE_ROLE_KEY`**:
   - Asegúrate de que esté configurada en tu archivo `.env.local`
   - Puedes encontrar el Service Role Key en: Supabase Dashboard → Settings → API → Service Role Key

   ```env
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
   ```

2. **Reinicia el servidor de desarrollo**:
   ```bash
   # Detén el servidor (Ctrl+C) y vuelve a iniciarlo
   pnpm dev
   ```

3. **Verifica que el endpoint esté funcionando**:
   - Abre `http://localhost:3000/api/users` en tu navegador
   - Deberías ver un error 401 (Unauthorized) si no estás autenticado
   - Si ves 500 (Internal Server Error), revisa la configuración del Service Role Key

### Archivos Relacionados

- `/src/app/api/users/route.ts` - Endpoint que lista usuarios usando Admin Client
- `/src/lib/supabase/admin.ts` - Configuración del Admin Client con Service Role Key

---

## Configuración de Políticas RLS para Tablas

### Descripción

Scripts para configurar las políticas RLS (Row Level Security) de las tablas principales del proyecto.

**⚠️ IMPORTANTE**: Ejecuta estos scripts si obtienes errores de `"permission denied for table <nombre>"` al intentar crear, actualizar o eliminar recursos.

### Tablas Configuradas

#### Services (Servicios)

**Ejecutar**: `scripts/setup-services-policies.sql`

**Políticas creadas**:
- Lectura pública: Todos pueden ver los servicios
- Escritura admin: Solo administradores pueden crear, actualizar y eliminar

**Cuándo ejecutar**: Si obtienes el error `"permission denied for table services"` al intentar guardar un servicio.

### Instrucciones

1. Ve a **Supabase Dashboard** → Tu Proyecto → **SQL Editor**
2. Abre el archivo SQL correspondiente a la tabla que necesitas configurar
3. Copia TODO el contenido
4. Pégalo en el SQL Editor y haz clic en **Run**
5. Verifica que las políticas se crearon correctamente

---

## Configuración de Storage

### Descripción

Scripts para configurar y gestionar el almacenamiento de archivos en Supabase Storage.

**Buckets** (7 en total):
- `company-logos`: Logos de empresas (5MB máx)
- `profile-images`: Avatares de usuarios (5MB máx)
- `blog-images`: Imágenes de artículos del blog (10MB máx)
- `service-images`: Imágenes de servicios (10MB máx)
- `portfolio-images`: Imágenes de portfolio (10MB máx)
- `project-images`: Imágenes de proyectos (10MB máx)
- `testimonial-images`: Avatares de testimonios (5MB máx)

**Estructura de archivos**: `/<resource_id>/imagen.ext`

### Configuración Rápida

#### 1. Crear Buckets

**⚠️ IMPORTANTE**: Los buckets SOLO pueden crearse desde el Dashboard de Supabase.

**Opción A - SQL (Más fácil)** ⭐:
1. Ve a **Supabase Dashboard** → Tu Proyecto → **SQL Editor**
2. Abre `scripts/create-all-storage-buckets.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor y haz clic en **Run**
5. Verifica que se crearon 7 buckets

**Opción B - TypeScript (Requiere variables de entorno)**:
```bash
# Solo si tienes .env.local configurado con:
# NEXT_PUBLIC_SUPABASE_URL=...
# SUPABASE_SERVICE_ROLE_KEY=...
npx tsx scripts/setup-storage-buckets.ts
```

#### 2. Configurar Políticas RLS

**⚠️ IMPORTANTE**: Las políticas SOLO pueden ejecutarse desde el Dashboard de Supabase.

**Opción A - Todos los Buckets (Recomendado)** ⭐:
1. Ve a **Supabase Dashboard** → Tu Proyecto → **SQL Editor**
2. Abre `scripts/setup-all-storage-policies.sql`
3. Copia TODO el contenido
4. Pégalo en el SQL Editor y haz clic en **Run**
5. Verifica que se crearon 28 políticas (4 por cada uno de los 7 buckets)

**Opción B - Solo Company Logos**:
1. Si solo necesitas configurar company-logos
2. Usa `scripts/setup-storage-policies-simple.sql`

**Opción C - Con Documentación Completa**:
1. Similar a la opción A pero usa `scripts/setup-storage-policies.sql`
2. Incluye más documentación y comentarios inline

❌ **NO ejecutes estos scripts desde la terminal** - Obtendrás el error: `"must be owner of relation objects"`

### Documentación Completa

Para más información detallada sobre:
- Estructura de buckets
- Políticas de acceso
- Uso en el código
- Troubleshooting
- Mejores prácticas

👉 **Lee la documentación completa**: [STORAGE_SETUP.md](./STORAGE_SETUP.md)

### Archivos Relacionados

**Scripts Principales**:
- `create-all-storage-buckets.sql` - Crea los 7 buckets (ejecutar en Dashboard) ⭐
- `setup-all-storage-policies.sql` - Políticas para TODOS los buckets (ejecutar en Dashboard) ⭐
- `STORAGE_SETUP.md` - Documentación completa de Storage
- `BUCKETS_OVERVIEW.md` - Resumen visual de todos los buckets

**Scripts Alternativos**:
- `setup-storage-policies-simple.sql` - Solo company-logos (legacy)
- `setup-storage-policies.sql` - Company-logos + images (legacy)
- `copy-sql-for-dashboard.sh` - Helper para copiar SQL al portapapeles

**Deprecated** (no usar):
- `create-company-logos-bucket.sql`
- `create-company-logos-bucket-policies.sql`

