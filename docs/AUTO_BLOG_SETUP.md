# Configuración del Blog Automático

El workflow de GitHub Actions genera y publica un artículo de blog cada día a las **8:00 AM hora México** usando Claude (Haiku) como redactor e inserta el resultado directamente en Supabase.

## Archivos creados

- `.github/workflows/auto-blog.yml` — Workflow que corre el cron diario
- `scripts/generate-blog.mjs` — Script Node.js que llama a Claude y publica en Supabase

---

## Paso 1: Obtener las credenciales necesarias

### ANTHROPIC_API_KEY
1. Ve a [console.anthropic.com](https://console.anthropic.com)
2. **API Keys** → **Create Key**
3. Copia la key (solo se muestra una vez)

### GEMINI_API_KEY
1. Ve a [aistudio.google.com](https://aistudio.google.com)
2. **Get API key** → **Create API key**
3. Copia la key
> Nota: Imagen 3 requiere que tu proyecto de Google Cloud tenga habilitada la API "Generative Language API". Si usas AI Studio directamente la key ya tiene acceso.

### SUPABASE_URL
Es la URL de tu proyecto Supabase. La encontrarás en:
- Supabase Dashboard → **Project Settings** → **API** → **Project URL**
- Ejemplo: `https://wuttmqoohdsgbsdbanoj.supabase.co`

### SUPABASE_SERVICE_ROLE_KEY
> ⚠️ Esta key bypasea las políticas RLS. Nunca la expongas en el frontend.

En Supabase Dashboard → **Project Settings** → **API** → **service_role** (secret)

### BLOG_AUTHOR_ID
El UUID del usuario de Supabase que aparecerá como autor de los posts automáticos.

Para obtenerlo ejecuta en el SQL Editor de Supabase:
```sql
SELECT id, email FROM auth.users;
```
Copia el UUID del usuario que quieres usar como autor.

---

## Paso 2: Agregar los secrets en GitHub

1. Ve a tu repositorio en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **New repository secret** para cada uno:

| Secret name               | Valor                                      |
|---------------------------|--------------------------------------------|
| `ANTHROPIC_API_KEY`       | Tu API key de Anthropic                    |
| `GEMINI_API_KEY`          | Tu API key de Google AI Studio             |
| `SUPABASE_URL`            | URL de tu proyecto Supabase                |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key de Supabase             |
| `BLOG_AUTHOR_ID`          | UUID del usuario autor en Supabase         |

---

## Paso 3: Verificar que funciona

Una vez configurados los secrets, puedes ejecutar el workflow manualmente:

1. Ve a **Actions** en tu repositorio de GitHub
2. Selecciona **Auto Blog Publisher**
3. Haz clic en **Run workflow** → **Run workflow**
4. Revisa los logs para confirmar que el artículo se publicó

Después de un run exitoso, el artículo aparecerá en `imsoft.io/es/blog` y `imsoft.io/en/blog`.

---

## Cómo funciona

El script rota entre las 8 categorías del blog (una distinta cada día de forma cíclica):
`Tecnología → Desarrollo → Negocios → Marketing → Diseño → Tutoriales → Tips → Noticias`

Cada artículo se genera con:
- Título, extracto y contenido en **español e inglés**
- Contenido HTML semántico (~600-900 palabras)
- Slug único generado desde el título en inglés
- `published = true` (se publica directamente)

---

## Costos aproximados

| Servicio | Costo por artículo | Costo mensual (30 posts) |
|---|---|---|
| Claude Haiku (texto) | ~$0.003 USD | ~$0.09 USD |
| Imagen 3 (imagen 16:9) | ~$0.02 USD | ~$0.60 USD |
| **Total** | **~$0.023 USD** | **~$0.69 USD** |
