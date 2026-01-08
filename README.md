# imSoft - Soluciones Tecnológicas Modernas

Aplicación web moderna desarrollada con Next.js 16 para ofrecer soluciones tecnológicas, servicios de desarrollo de software, consultoría y transformación digital.

## 🚀 Características

- **Multiidioma**: Soporte completo para español e inglés
- **Dashboard Administrativo**: Gestión completa de proyectos, clientes, servicios, blog y más
- **Dashboard de Cliente**: Portal para que los clientes gestionen sus proyectos y cotizaciones
- **Sistema CRM**: Gestión de contactos, actividades y deals
- **Sistema de Cotizaciones**: Creación y gestión de cotizaciones personalizadas con preguntas dinámicas
- **Blog**: Sistema de blog con editor rico (Lexical)
- **Portfolio**: Showcase de proyectos completados
- **Pagos con Stripe**: Integración completa con Stripe para enlaces de pago y webhooks
- **SEO Optimizado**: Metadata dinámica, sitemap, robots.txt y structured data
- **PWA Ready**: Configuración completa para Progressive Web App

## 🛠️ Tecnologías

- **Framework**: Next.js 16.1.1 (App Router)
- **Lenguaje**: TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Pagos**: Stripe
- **UI Components**: Radix UI + shadcn/ui
- **Estilos**: Tailwind CSS 4
- **Formularios**: React Hook Form + Zod
- **Editor de Texto**: Lexical
- **Animaciones**: GSAP, Motion
- **Drag & Drop**: @dnd-kit
- **Email**: Resend

## 📋 Requisitos Previos

- Node.js 18+ 
- pnpm (recomendado) o npm/yarn
- Cuenta de Supabase
- Cuenta de Stripe (opcional, para funcionalidad de pagos)

## 🔧 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd imsoft
```

2. Instala las dependencias:
```bash
pnpm install
```

3. Configura las variables de entorno (ver sección de configuración)

4. Ejecuta el servidor de desarrollo:
```bash
pnpm dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## ⚙️ Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

### Supabase (Requerido)
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
```

### Stripe (Opcional - para funcionalidad de pagos)
```env
STRIPE_SECRET_KEY=sk_live_... o sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Otros
```env
NEXT_PUBLIC_SITE_URL=https://imsoft.io
RESEND_API_KEY=tu_resend_api_key (opcional, para emails)
```

## 📜 Scripts Disponibles

```bash
# Desarrollo
pnpm dev          # Inicia el servidor de desarrollo

# Producción
pnpm build        # Construye la aplicación para producción
pnpm start        # Inicia el servidor de producción

# Linting
pnpm lint         # Ejecuta ESLint
```

## 📁 Estructura del Proyecto

```
imsoft/
├── src/
│   ├── app/                    # Rutas de Next.js (App Router)
│   │   ├── [lang]/            # Rutas con internacionalización
│   │   │   ├── dashboard/     # Dashboards (admin y client)
│   │   │   ├── blog/          # Blog público
│   │   │   ├── portfolio/     # Portfolio público
│   │   │   └── servicios/     # Páginas de servicios
│   │   ├── api/               # API Routes
│   │   └── sitemap.ts         # Generación de sitemap
│   ├── components/            # Componentes React
│   │   ├── blocks/            # Componentes de bloques (hero, footer, etc.)
│   │   ├── dashboards/        # Componentes del dashboard
│   │   ├── projects/          # Componentes de proyectos
│   │   └── ui/                # Componentes UI (shadcn)
│   ├── lib/                   # Utilidades y helpers
│   │   ├── supabase/          # Clientes de Supabase
│   │   ├── stripe.ts          # Configuración de Stripe
│   │   └── seo.ts             # Utilidades de SEO
│   └── types/                 # Tipos TypeScript
├── scripts/                   # Scripts SQL para configuración de BD
├── public/                    # Archivos estáticos
└── docs/                      # Documentación adicional
```

## 🗄️ Base de Datos

El proyecto utiliza Supabase (PostgreSQL). Los scripts SQL para configurar la base de datos se encuentran en la carpeta `scripts/`.

### Tablas principales:
- `users` - Usuarios del sistema
- `projects` - Proyectos
- `companies` - Empresas/clientes
- `services` - Servicios ofrecidos
- `blog` - Posts del blog
- `portfolio` - Proyectos del portfolio
- `quotations` - Cotizaciones
- `quotation_questions` - Preguntas de cotizaciones
- `project_payments` - Pagos de proyectos
- `testimonials` - Testimonios
- `contact` - Información de contacto
- Y más...

## 🔐 Autenticación y Roles

El sistema soporta dos tipos de usuarios:
- **Admin**: Acceso completo al dashboard administrativo
- **Client**: Acceso al dashboard de cliente para gestionar sus proyectos

Los roles se gestionan a través de `user_metadata.role` en Supabase Auth.

## 💳 Integración con Stripe

### Configuración de Webhooks

1. Crea un webhook endpoint en Stripe Dashboard
2. URL: `https://imsoft.io/api/webhooks/stripe`
3. Eventos a escuchar:
   - `checkout.session.completed`
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.failed`
4. Copia el "Signing secret" y agrégalo a `STRIPE_WEBHOOK_SECRET`

## 🌐 Internacionalización

El proyecto soporta español (`es`) e inglés (`en`). Las rutas están prefijadas con el idioma:
- `/es` - Versión en español
- `/en` - Versión en inglés

Los diccionarios se encuentran en `src/app/[lang]/dictionaries/`

## 📱 PWA

El proyecto está configurado como Progressive Web App. El manifest se encuentra en `public/manifest.json` y los iconos en `public/manifest/`.

## 🔍 SEO

- Sitemap dinámico en `/sitemap.xml`
- Robots.txt en `/robots.txt`
- Metadata dinámica para todas las páginas
- Structured Data (JSON-LD) para mejor indexación
- Open Graph y Twitter Cards

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push

### Otros proveedores

El proyecto puede desplegarse en cualquier plataforma que soporte Next.js:
- Netlify
- AWS Amplify
- Railway
- Render
- etc.

## 📚 Documentación Adicional

Consulta la carpeta `docs/` para documentación específica sobre:
- Configuración de base de datos
- Sistema de cotizaciones
- Sistema CRM
- Configuración de Google OAuth
- Y más...

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y propiedad de imSoft.

## 📞 Contacto

Para más información, visita [https://imsoft.io](https://imsoft.io)

---

Desarrollado con ❤️ por imSoft
