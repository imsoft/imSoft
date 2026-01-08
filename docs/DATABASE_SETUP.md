# Configuración Completa de la Base de Datos

Esta guía proporciona una visión general de todas las tablas de la base de datos y cómo crearlas.

## Orden de Creación Recomendado

Para evitar errores de dependencias, crea las tablas en el siguiente orden:

1. **user_profiles** - Perfiles de usuarios (no tiene dependencias)
2. **companies** - Empresas de los clientes (depende de `auth.users`)
3. **services** - Servicios ofrecidos (no tiene dependencias)
4. **portfolio** - Proyectos del portafolio (depende de `companies`)
5. **blog** - Publicaciones del blog (no tiene dependencias)
6. **testimonials** - Testimonios de clientes (depende de `companies`)
7. **projects** - Proyectos de los clientes (depende de `companies`)
8. **contact** - Información de contacto (no tiene dependencias)

## Scripts Disponibles

### 1. Tabla de Perfiles de Usuarios
- **Script**: `scripts/create-user-profiles-table.sql`
- **Documentación**: `docs/USER_PROFILES_SETUP.md`
- **Dependencias**: Ninguna (usa `auth.users` que ya existe)

### 2. Tabla de Empresas
- **Script**: `scripts/create-companies-table.sql`
- **Documentación**: `docs/COMPANIES_SETUP.md`
- **Dependencias**: `auth.users`
- **Nota**: También necesitas crear el bucket `company-logos` en Storage

### 3. Tabla de Servicios
- **Script**: `scripts/create-services-table.sql`
- **Documentación**: `docs/SERVICES_SETUP.md`
- **Dependencias**: Ninguna

### 4. Tabla de Portafolio
- **Script**: `scripts/create-portfolio-table.sql`
- **Dependencias**: `companies`
- **Nota**: Asegúrate de crear la tabla `companies` primero

### 5. Tabla de Blog
- **Script**: `scripts/create-blog-table.sql`
- **Documentación**: `docs/BLOG_SETUP.md`
- **Dependencias**: `auth.users` (para `author_id`)
- **Nota**: Si la tabla ya existe, ejecuta `scripts/add-author-id-to-blog.sql` para agregar el campo de autor

### 6. Tabla de Testimonios
- **Script**: `scripts/create-testimonials-table.sql`
- **Dependencias**: `companies`
- **Nota**: Asegúrate de crear la tabla `companies` primero

### 7. Tabla de Proyectos
- **Script**: `scripts/create-projects-table.sql`
- **Dependencias**: `companies`
- **Nota**: Asegúrate de crear la tabla `companies` primero

### 8. Tabla de Contacto
- **Script**: `scripts/create-contact-table.sql`
- **Dependencias**: Ninguna

## Cómo Ejecutar los Scripts

### Opción 1: Usando el SQL Editor en Supabase (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Para cada script:
   - Abre el archivo correspondiente en `scripts/`
   - Copia y pega todo el contenido
   - Haz clic en **Run** para ejecutar el script
4. Verifica que cada tabla se creó correctamente

### Opción 2: Ejecutar Todos los Scripts en Orden

Puedes ejecutar todos los scripts en una sola sesión siguiendo el orden recomendado:

```sql
-- 1. Perfiles de usuarios
-- Ejecuta: scripts/create-user-profiles-table.sql

-- 2. Empresas
-- Ejecuta: scripts/create-companies-table.sql

-- 3. Servicios
-- Ejecuta: scripts/create-services-table.sql

-- 4. Portafolio
-- Ejecuta: scripts/create-portfolio-table.sql

-- 5. Blog
-- Ejecuta: scripts/create-blog-table.sql

-- 6. Testimonios
-- Ejecuta: scripts/create-testimonials-table.sql

-- 7. Proyectos
-- Ejecuta: scripts/create-projects-table.sql

-- 8. Contacto
-- Ejecuta: scripts/create-contact-table.sql
```

## Configuración de Storage

Además de las tablas, necesitas configurar buckets en Supabase Storage:

### Bucket para Logos de Empresas
- **Nombre**: `company-logos`
- **Script**: `scripts/create-company-logos-bucket-policies.sql` (solo políticas, el bucket se crea desde la interfaz web)
- **Documentación**: `docs/STORAGE_POLICIES_SETUP.md`
- **Nota**: Crea el bucket desde la interfaz web primero, luego ejecuta el script de políticas

### Bucket para Imágenes Generales
- **Nombre**: `images`
- **Uso**: Imágenes de servicios, portafolio, blog, proyectos
- **Nota**: Crea este bucket desde la interfaz web con configuración pública

## Verificar la Instalación

Después de ejecutar todos los scripts, verifica que todas las tablas existen:

```sql
-- Listar todas las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_profiles',
    'companies',
    'services',
    'portfolio',
    'blog',
    'testimonials',
    'projects',
    'contact'
  )
ORDER BY table_name;
```

## Políticas RLS

Todas las tablas tienen Row Level Security (RLS) habilitado con políticas específicas:

- **Tablas públicas** (services, portfolio, blog publicados, testimonials, contact): Lectura pública, solo admins pueden modificar
- **Tablas de usuarios** (user_profiles, companies, projects): Los usuarios solo pueden ver/modificar sus propios datos, admins pueden ver/modificar todo

## Notas Importantes

1. **Orden de creación**: Respeta el orden recomendado para evitar errores de dependencias
2. **Campos legacy**: Muchas tablas tienen campos sin sufijo de idioma (`title`, `description`) para compatibilidad con datos existentes
3. **Relaciones**: Las tablas `portfolio`, `testimonials` y `projects` tienen relación con `companies` a través de `company_id`
4. **Slugs únicos**: Las tablas `services`, `portfolio`, `blog` y `projects` tienen campos `slug` únicos para URLs amigables
5. **Triggers**: Las tablas con `updated_at` tienen triggers automáticos para actualizar la fecha

## Solución de Problemas

### Error: "relation does not exist"
- Asegúrate de haber creado las tablas en el orden correcto
- Verifica que las tablas dependientes existan antes de crear las que las referencian

### Error: "must be owner of relation"
- Algunas operaciones requieren permisos de administrador
- Usa la interfaz web de Supabase para crear buckets y configurar políticas de Storage

### Error: "duplicate key value violates unique constraint"
- Verifica que no estés intentando crear registros con valores únicos duplicados (como slugs)

