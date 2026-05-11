# imSoft — Soluciones Tecnológicas Modernas

Aplicación web moderna desarrollada con Next.js para ofrecer servicios de desarrollo de software, consultoría tecnológica y transformación digital.

## Características

- **Multiidioma** — Soporte completo para español (es-MX) e inglés (en) con hreflang y rutas prefijadas
- **Dashboard Administrativo** — Gestión de proyectos, clientes, servicios, blog, portafolio, testimonios y más
- **Dashboard de Cliente** — Portal para que los clientes vean y gestionen sus proyectos
- **Sistema CRM** — Gestión de contactos, deals, actividades y pipeline de ventas
- **Blog** — Sistema de blog con editor rico (Lexical) y soporte bilingüe
- **Portafolio** — Showcase de proyectos completados
- **Pagos con Stripe** — Integración para crear y gestionar enlaces de pago e installments
- **SEO al 100%** — Metadata dinámica, sitemap, robots.txt, structured data (JSON-LD), OG images dinámicas y hreflang
- **PWA Ready** — Manifest, iconos y soporte offline configurados

## Stack tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Framework | Next.js 16.2 (App Router) |
| Lenguaje | TypeScript 6 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Pagos | Stripe 22 |
| UI | shadcn/ui + Radix UI + Tailwind CSS 4 |
| Formularios | React Hook Form 7 + Zod 4 |
| Editor de texto | Lexical |
| Animaciones | GSAP + Motion |
| Drag & Drop | @dnd-kit |
| Email | Resend |
| Deploy | Vercel |

## Requisitos

- Node.js 18+
- pnpm
- Cuenta de Supabase
- Cuenta de Stripe (para funcionalidad de pagos)

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/imsoft/imSoft.git
cd imSoft

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# 4. Iniciar servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Variables de entorno

Crea un archivo `.env.local` con las siguientes variables:

```env
# Supabase (requerido)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe (requerido para pagos)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_SITE_URL=https://imsoft.io

# Resend (requerido para emails)
RESEND_API_KEY=

# SEO — verificación en buscadores (opcional)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
NEXT_PUBLIC_BING_VERIFICATION=
NEXT_PUBLIC_YANDEX_VERIFICATION=
```

## Scripts

```bash
pnpm dev      # Servidor de desarrollo
pnpm build    # Build de producción
pnpm start    # Servidor de producción
pnpm lint     # ESLint
```

## Estructura del proyecto

```
src/
├── app/
│   ├── [lang]/                  # Rutas públicas (es / en)
│   │   ├── [city]/[service]/    # Landing pages por ciudad y servicio
│   │   ├── blog/                # Blog público
│   │   ├── portfolio/           # Portafolio
│   │   ├── services/            # Servicios
│   │   ├── contact/             # Contacto
│   │   ├── dashboard/
│   │   │   ├── admin/           # Dashboard administrativo
│   │   │   └── client/          # Dashboard de cliente
│   │   ├── dictionaries/        # Traducciones es.json / en.json
│   │   └── opengraph-image.tsx  # OG image dinámica
│   ├── api/                     # API Routes
│   ├── sitemap.ts               # Sitemap dinámico
│   └── robots.ts                # Robots.txt
├── components/
│   ├── blocks/                  # Secciones (hero, footer, servicios…)
│   ├── dashboards/              # Sidebars de admin y cliente
│   ├── seo/                     # Componente StructuredData
│   └── ui/                      # Componentes shadcn/ui
├── lib/
│   ├── supabase/                # Clientes server / client / admin
│   ├── seo.ts                   # generateMetadata y generateStructuredData
│   └── stripe.ts                # Configuración de Stripe
└── types/
    └── database.ts              # Interfaces TypeScript del modelo de datos
scripts/                         # Scripts SQL para setup de la BD
docs/                            # Documentación de módulos y configuración
supabase/
└── migrations/                  # Migraciones de base de datos
```

## Base de datos

El proyecto usa Supabase (PostgreSQL). Los scripts SQL están en `scripts/`.

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios del sistema |
| `companies` | Empresas/clientes |
| `projects` | Proyectos |
| `project_payments` | Pagos de proyectos |
| `project_tasks` | Tareas de proyectos |
| `services` | Servicios ofrecidos |
| `blog` | Posts del blog |
| `portfolio` | Proyectos del portafolio |
| `testimonials` | Testimonios |
| `contact` | Información de contacto |
| `contact_messages` | Mensajes del formulario de contacto |
| `contacts` | Contactos CRM |
| `deals` | Deals CRM |
| `activities` | Actividades CRM |
| `technologies` | Tecnologías |
| `feedbacks` | Feedbacks de clientes |

## Autenticación y roles

El sistema maneja dos roles de usuario mediante `user_metadata.role` en Supabase Auth:

- **admin** — Acceso completo al dashboard administrativo
- **client** — Acceso al dashboard de cliente

Para asignar el rol admin a un usuario, usa el script `scripts/set-admin-role.sql`.

## Stripe — Configuración de webhooks

1. Crea un endpoint en el Stripe Dashboard
2. URL: `https://imsoft.io/api/webhooks/stripe`
3. Eventos requeridos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.failed`
4. Copia el "Signing secret" en `STRIPE_WEBHOOK_SECRET`

## Internacionalización

Las rutas están prefijadas por idioma:

- `/es/...` — Español (México)
- `/en/...` — Inglés

Los diccionarios están en `src/app/[lang]/dictionaries/es.json` y `en.json`.

## SEO

- Sitemap dinámico en `/sitemap.xml` con hreflang es-MX / en / x-default
- `robots.txt` configurado en `/robots.txt`
- `generateMetadata` en todas las páginas públicas
- Structured Data (JSON-LD): Organization, WebSite, LocalBusiness, Service, Article, BreadcrumbList
- OG images dinámicas vía `ImageResponse`
- Preconnect a Supabase, ImageKit y Unsplash

## PWA

Manifest en `public/manifest.json` con iconos en `public/manifest/` (Android, iOS, Windows 11).

## Despliegue

### Vercel (recomendado)

1. Conecta el repositorio a Vercel
2. Configura las variables de entorno
3. El deploy es automático en cada push a `main`

## Licencia

Proyecto privado — propiedad de imSoft. Todos los derechos reservados.

---

[imsoft.io](https://imsoft.io)
