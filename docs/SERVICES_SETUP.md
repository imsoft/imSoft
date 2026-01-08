# Configuración de Servicios

Esta guía explica cómo configurar la tabla de servicios en Supabase.

## Estructura de Base de Datos

### Tabla `services`

La tabla `services` almacena los servicios ofrecidos por la empresa. Cada servicio puede tener contenido en español e inglés, un slug único para URLs amigables, y una imagen.

## Crear la Tabla

### Opción 1: Usando el SQL Editor en Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Abre el archivo `scripts/create-services-table.sql`
4. Copia y pega todo el contenido del archivo
5. Haz clic en **Run** para ejecutar el script

### Opción 2: Usando la CLI de Supabase

Si tienes la CLI de Supabase instalada:

```bash
supabase db push
```

O ejecuta el script directamente:

```bash
psql -h <tu-host> -U postgres -d postgres -f scripts/create-services-table.sql
```

## Verificar la Creación

Después de ejecutar el script, verifica que la tabla se creó correctamente:

```sql
-- Verificar que la tabla existe
SELECT * FROM services LIMIT 1;

-- Verificar las políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'services';
```

## Estructura de la Tabla

La tabla `services` tiene los siguientes campos:

- `id` (UUID): Identificador único del servicio
- `title_es` (TEXT): Título del servicio en español
- `title_en` (TEXT): Título del servicio en inglés
- `title` (TEXT): Campo legacy para compatibilidad
- `description_es` (TEXT): Descripción del servicio en español
- `description_en` (TEXT): Descripción del servicio en inglés
- `description` (TEXT): Campo legacy para compatibilidad
- `slug` (TEXT, UNIQUE): URL amigable única para el servicio
- `image_url` (TEXT): URL de la imagen del servicio almacenada en Supabase Storage
- `icon` (TEXT): Campo legacy para compatibilidad
- `created_at` (TIMESTAMP): Fecha de creación del servicio
- `updated_at` (TIMESTAMP): Fecha de última actualización (se actualiza automáticamente)

## Políticas RLS

Las políticas de seguridad configuradas son:

- **Lectura pública**: Cualquiera puede leer los servicios (para mostrarlos en el sitio web público)
- **Inserción**: Solo administradores pueden crear servicios
- **Actualización**: Solo administradores pueden actualizar servicios
- **Eliminación**: Solo administradores pueden eliminar servicios

## Configurar Storage para Imágenes

Si aún no lo has hecho, necesitas crear un bucket en Supabase Storage para las imágenes de servicios:

1. Ve a **Storage** en el menú lateral de Supabase
2. Haz clic en **New bucket**
3. Nombre: `images` (o el nombre que uses para imágenes generales)
4. Marca como **Public bucket** (para que las imágenes sean accesibles públicamente)
5. Haz clic en **Create bucket**

O si ya tienes un bucket `images` configurado, los servicios usarán ese mismo bucket con la ruta `services/{filename}`.

## Funcionalidad

### Para Administradores

- Pueden crear, editar y eliminar servicios
- Pueden subir imágenes para cada servicio
- Los slugs se generan automáticamente desde el título en inglés
- Pueden usar traducción automática con Google Translate

### Para Visitantes del Sitio Web

- Pueden ver todos los servicios públicos
- Los servicios se muestran en la página de servicios del sitio web

## API Endpoints

Los servicios se gestionan directamente desde el dashboard de administración usando Supabase client. No hay endpoints API específicos para servicios, ya que se accede directamente a la tabla de Supabase.

## Notas

- El campo `slug` debe ser único. Si intentas crear un servicio con un slug que ya existe, obtendrás un error.
- Los campos `title` y `description` (sin sufijo de idioma) se mantienen para compatibilidad con datos existentes.
- El campo `icon` se mantiene para compatibilidad, pero se recomienda usar `image_url` para nuevas implementaciones.

