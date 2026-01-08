# Configuración de Blog

Esta guía explica cómo configurar la tabla de blog en Supabase.

## Estructura de Base de Datos

### Tabla `blog`

La tabla `blog` almacena las publicaciones del blog. Cada publicación puede tener contenido en español e inglés, un slug único para URLs amigables, una imagen destacada, categoría, y un autor.

## Crear la Tabla

### Opción 1: Usando el SQL Editor en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Abre el archivo `scripts/create-blog-table.sql`
4. Copia y pega todo el contenido del archivo
5. Haz clic en **Run** para ejecutar el script

### Opción 2: Usando la CLI de Supabase

Si tienes la CLI de Supabase instalada:

```bash
supabase db push
```

O ejecuta el script directamente:

```bash
psql -h <tu-host> -U postgres -d postgres -f scripts/create-blog-table.sql
```

## Verificar la Creación

Después de ejecutar el script, verifica que la tabla se creó correctamente:

```sql
-- Verificar que la tabla existe
SELECT * FROM blog LIMIT 1;

-- Verificar las políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'blog';
```

## Estructura de la Tabla

La tabla `blog` tiene los siguientes campos:

- `id` (UUID): Identificador único de la publicación
- `title_es` (TEXT): Título de la publicación en español
- `title_en` (TEXT): Título de la publicación en inglés
- `title` (TEXT): Campo legacy para compatibilidad
- `content_es` (TEXT): Contenido completo de la publicación en español (HTML)
- `content_en` (TEXT): Contenido completo de la publicación en inglés (HTML)
- `content` (TEXT): Campo legacy para compatibilidad
- `excerpt_es` (TEXT): Resumen de la publicación en español
- `excerpt_en` (TEXT): Resumen de la publicación en inglés
- `excerpt` (TEXT): Campo legacy para compatibilidad
- `slug` (TEXT, UNIQUE): URL amigable única para la publicación
- `image_url` (TEXT): URL de la imagen destacada almacenada en Supabase Storage
- `category` (TEXT): Categoría de la publicación
- `author_id` (UUID): Referencia al usuario autor de la publicación
- `published` (BOOLEAN): Indica si la publicación está publicada y visible públicamente
- `created_at` (TIMESTAMP): Fecha de creación de la publicación
- `updated_at` (TIMESTAMP): Fecha de última actualización (se actualiza automáticamente)

## Políticas RLS

Las políticas de seguridad configuradas son:

- **Lectura pública**: Solo las publicaciones con `published = true` son visibles públicamente
- **Lectura para admins**: Los administradores pueden ver todas las publicaciones (publicadas y borradores)
- **Inserción**: Solo administradores pueden crear publicaciones
- **Actualización**: Solo administradores pueden actualizar publicaciones
- **Eliminación**: Solo administradores pueden eliminar publicaciones

## Configurar Storage para Imágenes

Si aún no lo has hecho, necesitas crear un bucket en Supabase Storage para las imágenes del blog:

1. Ve a **Storage** en el menú lateral de Supabase
2. Haz clic en **New bucket**
3. Nombre: `images` (o el nombre que uses para imágenes generales)
4. Marca como **Public bucket** (para que las imágenes sean accesibles públicamente)
5. Haz clic en **Create bucket**

O si ya tienes un bucket `images` configurado, el blog usará ese mismo bucket con la ruta `blog/{filename}`.

## Funcionalidad

### Para Administradores

- Pueden crear, editar y eliminar publicaciones
- Pueden subir imágenes destacadas para cada publicación
- Pueden asignar un autor a cada publicación (por defecto, el usuario actual)
- Los slugs se generan automáticamente desde el título en inglés
- Pueden usar traducción automática con Google Translate
- Pueden controlar si una publicación está publicada o es un borrador

### Para Visitantes del Sitio Web

- Solo pueden ver publicaciones con `published = true`
- Las publicaciones se muestran en la página de blog del sitio web

## Relaciones

- **author_id**: Relación con `auth.users` para identificar quién escribió cada publicación
  - Si el autor se elimina, el `author_id` se establece en `NULL` (no se elimina la publicación)

## Notas

- El campo `slug` debe ser único. Si intentas crear una publicación con un slug que ya existe, obtendrás un error.
- Los campos `title`, `content` y `excerpt` (sin sufijo de idioma) se mantienen para compatibilidad con datos existentes.
- El campo `author_id` es opcional pero recomendado. Si no se especifica, la publicación no tendrá autor asignado.
- Por defecto, cuando se crea una nueva publicación, el autor se establece automáticamente como el usuario actual.

