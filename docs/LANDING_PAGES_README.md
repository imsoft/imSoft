# Landing Pages Dinámicas - Documentación

## 📋 Resumen

Sistema de **30 landing pages estáticas bilingües** generadas automáticamente para SEO, combinando 2 idiomas (español/inglés) con 3 ciudades y 5 industrias diferentes.

## 🗂️ Estructura de Archivos Creados

```
src/
├── types/
│   └── landing-pages.ts          # Tipos TypeScript para City e Industry
├── config/
│   └── landing-pages-data.ts     # Configuración completa con contenido único
├── components/
│   └── landing/
│       ├── hero-section-landing.tsx      # Hero con soporte multiidioma
│       ├── problems-section.tsx
│       ├── solutions-section.tsx
│       ├── services-section-landing.tsx
│       └── cta-section.tsx              # CTA con soporte multiidioma
└── app/
    └── [lang]/
        └── [city]/
            └── [service]/
                └── page.tsx          # Página dinámica con generateStaticParams
```

## 🌐 Rutas Generadas (30 páginas estáticas)

### Español (15 páginas)

#### Guadalajara (5 páginas)
- `/es/guadalajara/software-para-inmobiliarias`
- `/es/guadalajara/software-para-constructoras`
- `/es/guadalajara/software-para-restaurantes`
- `/es/guadalajara/software-para-clinicas`
- `/es/guadalajara/software-para-logistica`

#### CDMX (5 páginas)
- `/es/cdmx/software-para-inmobiliarias`
- `/es/cdmx/software-para-constructoras`
- `/es/cdmx/software-para-restaurantes`
- `/es/cdmx/software-para-clinicas`
- `/es/cdmx/software-para-logistica`

#### Monterrey (5 páginas)
- `/es/monterrey/software-para-inmobiliarias`
- `/es/monterrey/software-para-constructoras`
- `/es/monterrey/software-para-restaurantes`
- `/es/monterrey/software-para-clinicas`
- `/es/monterrey/software-para-logistica`

### Inglés (15 páginas)

#### Guadalajara (5 páginas)
- `/en/guadalajara/software-para-inmobiliarias`
- `/en/guadalajara/software-para-constructoras`
- `/en/guadalajara/software-para-restaurantes`
- `/en/guadalajara/software-para-clinicas`
- `/en/guadalajara/software-para-logistica`

#### CDMX (5 páginas)
- `/en/cdmx/software-para-inmobiliarias`
- `/en/cdmx/software-para-constructoras`
- `/en/cdmx/software-para-restaurantes`
- `/en/cdmx/software-para-clinicas`
- `/en/cdmx/software-para-logistica`

#### Monterrey (5 páginas)
- `/en/monterrey/software-para-inmobiliarias`
- `/en/monterrey/software-para-constructoras`
- `/en/monterrey/software-para-restaurantes`
- `/en/monterrey/software-para-clinicas`
- `/en/monterrey/software-para-logistica`

## 🎯 Características

### 1. SEO Optimizado
- Título y descripción únicos por página
- Open Graph tags para redes sociales
- Twitter Card metadata
- Canonical URLs
- Structured Data (Schema.org)
- Robots meta tags configurados

### 2. Contenido Personalizado
Cada combinación ciudad + industria tiene:
- **H1 único** específico para la ciudad y nicho
- **Hero subtitle** contextualizado
- **Lista de problemas** del nicho específico
- **Soluciones propuestas** por imSoft
- **Servicios de imSoft** (apps web, móviles, consultoría)
- **CTA personalizado** por industria

### 3. Generación Estática (SSG)
- Usa `generateStaticParams()` para crear las 30 páginas en build time
- Renderizado en servidor (SSG) = velocidad máxima
- SEO perfecto: páginas completamente renderizadas
- Sin JavaScript necesario para el contenido principal
- Alternates bilingües configurados en sitemap.xml

### 4. Tono Empresarial
- Profesional y orientado a empresas medianas/grandes
- No genérico ni repetitivo
- Copy específico por ciudad e industria
- Enfocado en venta de:
  - Sistemas a la medida
  - Plataformas web
  - Aplicaciones móviles
  - Consultoría tecnológica

## 🚀 Cómo Funciona

### 1. Tipos TypeScript ([src/types/landing-pages.ts](src/types/landing-pages.ts))
Define los tipos `City`, `Industry` y la estructura `LandingPageData` con toda la información que necesita cada página.

### 2. Configuración de Datos ([src/config/landing-pages-data.ts](src/config/landing-pages-data.ts))
Objeto `landingPagesData` con las 15 combinaciones. Cada una tiene:
- SEO (title, description)
- Hero (h1, subtitle)
- Problemas (title, items[])
- Soluciones (title, items[])
- Servicios de imSoft (title, description, services[])
- CTA (title, description, buttonText)

### 3. Componentes Reutilizables
Cinco componentes en [src/components/landing/](src/components/landing/):
- `HeroSectionLanding`: Hero con H1 y CTAs
- `ProblemsSection`: Grid de problemas con ícono ✕
- `SolutionsSection`: Grid de soluciones con ícono ✓
- `ServicesSectionLanding`: 3 servicios de imSoft
- `CTASection`: CTA final con botones

### 4. Página Dinámica ([src/app/[city]/[service]/page.tsx](src/app/[city]/[service]/page.tsx))
- **generateStaticParams()**: Genera las 15 rutas en build time
- **generateMetadata()**: Metadata SEO dinámica
- **LandingPage**: Renderiza los componentes con los datos correspondientes

## 📝 Cómo Agregar Nuevas Páginas

### Agregar una nueva ciudad:
1. Agrega el nombre a `City` en [src/types/landing-pages.ts](src/types/landing-pages.ts:5)
2. Agrega la configuración en [src/config/landing-pages-data.ts](src/config/landing-pages-data.ts)
3. Listo, se generará automáticamente en el build

### Agregar una nueva industria:
1. Agrega el slug a `Industry` en [src/types/landing-pages.ts](src/types/landing-pages.ts:7)
2. Agrega la configuración para cada ciudad en [src/config/landing-pages-data.ts](src/config/landing-pages-data.ts)
3. Listo, se generará automáticamente en el build

## 🛠️ Comandos

```bash
# Desarrollo (páginas generadas dinámicamente)
npm run dev

# Build (genera las 15 páginas estáticas)
npm run build

# Previsualizar build
npm run start
```

## 🎨 Personalización de Diseño

Los componentes usan Tailwind CSS y están en modo claro/oscuro. Puedes personalizar:
- Colores en cada componente
- Espaciado y tamaños
- Animaciones y transiciones
- Estructura del layout

## 🔗 Integración con tu Sitio

Las páginas ya están integradas con:
- Sistema de rutas de Next.js App Router
- Links a `/contact`, `/servicios`, `/portfolio`
- Dark mode (usando `dark:` classes de Tailwind)
- Variables de entorno (`NEXT_PUBLIC_SITE_URL`)

## ✅ Checklist de Verificación

Después del build, verifica que:
- [ ] Las 15 rutas se generan correctamente
- [ ] Cada página tiene H1 único
- [ ] Los meta tags SEO están bien configurados
- [ ] El structured data JSON-LD es válido
- [ ] Los enlaces funcionan correctamente
- [ ] El diseño es responsive (móvil, tablet, desktop)
- [ ] El modo oscuro funciona correctamente

## 📊 SEO Tips

- Envía las 15 URLs al Google Search Console
- Crea un sitemap.xml que las incluya
- Agrega enlaces internos desde tu homepage
- Usa Google Analytics para medir el tráfico
- Monitorea el ranking en Google para las keywords objetivo

## 🎯 Próximos Pasos Sugeridos

1. **Integrar con Supabase** (opcional):
   - Puedes mover el contenido a la BD si quieres editarlo desde un CMS
   - Mantener la generación estática con `revalidate`

2. **Agregar formularios**:
   - Formulario de contacto específico por industria
   - Captura de leads con campos personalizados

3. **Testimonios por industria**:
   - Mostrar casos de éxito relevantes según la industria

4. **Blog posts relacionados**:
   - Sugerir artículos del blog relacionados con la industria

5. **Chat/WhatsApp**:
   - Botón de WhatsApp con mensaje pre-escrito por industria

---

**Desarrollado por imSoft**
Soluciones de software a la medida para empresas
