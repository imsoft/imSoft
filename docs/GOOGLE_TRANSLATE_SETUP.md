# Configuración de Google Cloud Translation API

Esta guía te ayudará a configurar Google Cloud Translation API para habilitar la traducción automática en los formularios del dashboard.

## Pasos para configurar

### 1. Crear un proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el ID del proyecto

### 2. Habilitar la API de Translation

1. En el menú de navegación, ve a **APIs & Services** > **Library**
2. Busca "Cloud Translation API"
3. Haz clic en **Enable** para habilitar la API

### 3. Crear una API Key

1. Ve a **APIs & Services** > **Credentials**
2. Haz clic en **Create Credentials** > **API Key**
3. Copia la API key generada
4. (Opcional pero recomendado) Restringe la API key:
   - Haz clic en **Restrict Key**
   - En **API restrictions**, selecciona "Restrict key"
   - Elige "Cloud Translation API"
   - Guarda los cambios

### 4. Configurar la variable de entorno

Agrega la siguiente variable a tu archivo `.env.local`:

```env
GOOGLE_TRANSLATE_API_KEY=tu_api_key_aqui
```

### 5. Reiniciar el servidor de desarrollo

Después de agregar la variable de entorno, reinicia tu servidor de desarrollo:

```bash
pnpm dev
```

## Uso

Una vez configurada la API, verás botones de "Traducir" junto a los campos en español en los siguientes formularios:

- **Blog**: Título, Resumen, Contenido
- **Servicios**: Título, Descripción
- **Portafolio**: Título, Descripción
- **Proyectos**: Título, Descripción
- **Testimonios**: Contenido

Al hacer clic en "Traducir", el texto en español se traducirá automáticamente al inglés y se llenará el campo correspondiente.

## Costos

Google Cloud Translation API ofrece:

- **Tier gratuito**: 500,000 caracteres por mes
- **Después del tier gratuito**: ~$20 USD por millón de caracteres

Para la mayoría de los casos de uso, el tier gratuito es más que suficiente.

## Notas importantes

- Las traducciones automáticas no son perfectas. Siempre revisa y edita las traducciones generadas.
- El contenido HTML (como en el editor de blog) se traduce extrayendo primero el texto plano.
- La API traduce de español a inglés por defecto.

