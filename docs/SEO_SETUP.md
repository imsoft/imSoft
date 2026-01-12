# Configuración SEO

Este documento describe cómo configurar y optimizar el SEO del sitio imSoft.

## Variables de Entorno para SEO

Agrega estas variables a tu archivo `.env` para habilitar la verificación de search consoles:

```bash
# Google Search Console
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=tu-codigo-de-verificacion-google

# Yandex Webmaster
NEXT_PUBLIC_YANDEX_VERIFICATION=tu-codigo-de-verificacion-yandex

# Bing Webmaster Tools
NEXT_PUBLIC_BING_VERIFICATION=tu-codigo-de-verificacion-bing
```

## Cómo Obtener los Códigos de Verificación

### Google Search Console
1. Ve a [Google Search Console](https://search.google.com/search-console)
2. Agrega tu propiedad (https://imsoft.io)
3. Selecciona "Etiqueta HTML" como método de verificación
4. Copia el código que aparece en `content="XXXXX"`
5. Agrega `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=XXXXX` a tu .env

### Bing Webmaster Tools
1. Ve a [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Agrega tu sitio
3. Selecciona "Etiqueta meta" como método de verificación
4. Copia el código que aparece en `content="XXXXX"`
5. Agrega `NEXT_PUBLIC_BING_VERIFICATION=XXXXX` a tu .env

### Yandex Webmaster
1. Ve a [Yandex Webmaster](https://webmaster.yandex.com)
2. Agrega tu sitio
3. Selecciona "Meta tag" como método de verificación
4. Copia el código que aparece en `content="XXXXX"`
5. Agrega `NEXT_PUBLIC_YANDEX_VERIFICATION=XXXXX` a tu .env

## Características SEO Implementadas

### ✅ Sitemap Dinámico
- Generación automática desde base de datos
- Incluye todas las páginas, servicios y posts del blog
- Soporte bilingüe (ES/EN)
- Actualización automática con cada build

**URL**: `https://imsoft.io/sitemap.xml`

### ✅ Robots.txt
- Configuración optimizada para crawlers
- Bloquea rutas privadas (dashboard, api, auth)
- Referencias al sitemap

**URL**: `https://imsoft.io/robots.txt`

### ✅ Metadata Completa
Todas las páginas incluyen:
- Títulos optimizados
- Descripciones meta
- Open Graph para redes sociales
- Twitter Cards
- Canonical URLs
- Hreflang tags bilingües
- Keywords relevantes

### ✅ Structured Data (JSON-LD)
Implementado en todas las páginas principales:

- **Home**: Organization + WebSite schema
- **Servicios**: Service + BreadcrumbList schema
- **Blog**: Article + BreadcrumbList schema
- **Contact**: ContactPage + BreadcrumbList schema
- **Landing Pages**: LocalBusiness schema (ciudad + industria)

### ✅ URLs Amigables
- Estructura semántica por idioma
- `/es/servicios/[slug]` y `/en/services/[slug]`
- `/es/cotizador` y `/en/quote`
- `/es/blog/[slug]` y `/en/blog/[slug]`

### ✅ Alternates Bilingües
Cada página especifica sus versiones alternativas:
```html
<link rel="alternate" hreflang="es" href="https://imsoft.io/es/..." />
<link rel="alternate" hreflang="en" href="https://imsoft.io/en/..." />
<link rel="alternate" hreflang="x-default" href="https://imsoft.io/es/..." />
```

## Mejoras Implementadas (Enero 2026)

1. **Sitemap actualizado** con rutas del cotizador público
2. **Función generateMetadata mejorada** con alternates específicos por página
3. **LocalBusiness schema** con información geográfica de ciudades
4. **Códigos de verificación** para Google, Bing y Yandex
5. **Metadata optimizada** en páginas principales y secundarias

## Próximos Pasos Recomendados

### 1. Verificar el sitio en Search Consoles
- [ ] Google Search Console
- [ ] Bing Webmaster Tools
- [ ] Yandex Webmaster

### 2. Enviar sitemaps
Una vez verificado el sitio, envía el sitemap en cada consola:
- URL del sitemap: `https://imsoft.io/sitemap.xml`

### 3. Configurar Google Analytics / Tag Manager
Agrega tracking analytics para medir el tráfico orgánico.

### 4. Crear landing pages específicas
Las rutas ciudad + industria están definidas en el sitemap pero necesitan páginas físicas:
- `/es/guadalajara/software-para-inmobiliarias`
- `/es/cdmx/software-para-restaurantes`
- etc.

### 5. Optimizar imágenes
- Agrega alt text descriptivo a todas las imágenes
- Usa Next.js Image component para optimización automática
- Considera WebP format

### 6. Mejorar performance
- Revisa Core Web Vitals en Google Search Console
- Optimiza LCP, FID, CLS
- Implementa lazy loading donde sea necesario

### 7. Schema adicional
Considera agregar:
- FAQ schema en páginas relevantes
- Review/Rating schema en servicios
- VideoObject schema si agregas videos

## Herramientas de Testing

### Validar Structured Data
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

### Validar Meta Tags
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### Analizar SEO General
- [Google Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Screaming Frog SEO Spider](https://www.screamingfrogseoseo.co.uk/seo-spider/)

## Contacto

Para preguntas sobre la configuración SEO, contacta al equipo de desarrollo.
