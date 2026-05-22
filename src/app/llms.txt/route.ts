import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 24 horas

export async function GET() {
  let blogSection = `- [Blog](${SITE_URL}/es/blog): Artículos prácticos sobre desarrollo de software, transformación digital y tecnología para empresarios.\n`
  let portfolioSection = `- [Portafolio / Portfolio](${SITE_URL}/es/portfolio): Casos de éxito reales: e-commerce, clínicas dentales, sistemas de logística, inventarios y plataformas SaaS.\n`

  try {
    const supabase = createAdminClient()

    const [{ data: posts }, { data: portfolio }] = await Promise.all([
      supabase
        .from('blog')
        .select('slug, title_es, title_en, excerpt_es, excerpt_en')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('portfolio')
        .select('slug, title_es, title_en, description_es, description_en, client, project_type')
        .not('slug', 'is', null)
        .order('created_at', { ascending: false }),
    ])

    if (posts && posts.length > 0) {
      const esEntries = posts
        .map((p) => {
          const title = p.title_es || p.title_en || ''
          const excerpt = p.excerpt_es || p.excerpt_en || ''
          return `- [${title}](${SITE_URL}/es/blog/${p.slug})${excerpt ? `: ${excerpt}` : ''}`
        })
        .join('\n')

      const enEntries = posts
        .map((p) => {
          const title = p.title_en || p.title_es || ''
          const excerpt = p.excerpt_en || p.excerpt_es || ''
          return `- [${title}](${SITE_URL}/en/blog/${p.slug})${excerpt ? `: ${excerpt}` : ''}`
        })
        .join('\n')

      blogSection = `- [Blog](${SITE_URL}/es/blog): Artículos prácticos sobre desarrollo de software, transformación digital y tecnología para empresarios.

### Blog articles (ES)

${esEntries}

### Blog articles (EN)

${enEntries}
`
    }

    if (portfolio && portfolio.length > 0) {
      const portfolioEntries = portfolio
        .map((p) => {
          const title = p.title_es || p.title_en || ''
          const desc = p.description_es || p.description_en || ''
          const meta = [p.client, p.project_type].filter(Boolean).join(' — ')
          const summary = [meta, desc].filter(Boolean).join('. ')
          return `- [${title}](${SITE_URL}/es/portfolio/${p.slug})${summary ? `: ${summary}` : ''}`
        })
        .join('\n')

      portfolioSection = `- [Portafolio / Portfolio](${SITE_URL}/es/portfolio): Casos de éxito reales de imSoft.

### Portfolio projects

${portfolioEntries}
`
    }
  } catch {
    // Si falla Supabase, se usan los fallbacks estáticos
  }

  const content = `# imSoft

> imSoft es una empresa de desarrollo de software con sede en Guadalajara, México. Diseñamos y construimos soluciones digitales a medida para empresas: desde páginas web y aplicaciones móviles hasta plataformas SaaS y sistemas empresariales complejos. Trabajamos con clientes en México, Estados Unidos, Canadá y Alemania. Precio fijo en cada proyecto — sin cobros sorpresa.

imSoft (also written as imsoft) is a software development company based in Guadalajara, Jalisco, Mexico. We build custom digital solutions for businesses across multiple industries. Founded with the mission of transforming ideas into software that drives real business growth.

## Core services

- [Páginas Web / Web Pages](${SITE_URL}/es/services/web-pages): Professional websites with responsive design, technical SEO, domain, hosting and SSL included. Delivery in 2–3 weeks. From $800 USD.
- [Desarrollo de MVP](${SITE_URL}/es/services/desarrollo-de-mvp): Launch your product to market fast and validate with real users. Auth, payments and admin included. Architecture that scales without rewriting. From $3,000 USD.
- [Software a Medida / Custom Software](${SITE_URL}/es/services/software-a-medida): Complex platforms, SaaS and enterprise systems. 100% your code, no licenses. Dedicated roadmap and team. From $8,000 USD.
- [Aplicaciones Web / Web Applications](${SITE_URL}/es/services/aplicaciones-web): Custom web apps tailored to business processes.
- [Aplicaciones Móviles / Mobile Applications](${SITE_URL}/es/services/aplicaciones-moviles): iOS and Android apps for businesses.
- [Consultoría Tecnológica / Technology Consulting](${SITE_URL}/es/services/consultoria-tecnologica): Strategic technology guidance to help businesses make better decisions.

## Technology stack

imSoft builds with modern, production-grade technologies:

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Next.js API Routes, REST APIs, GraphQL
- **Mobile:** React Native (iOS & Android)
- **Databases:** PostgreSQL (Supabase), MySQL, MongoDB
- **Cloud & Infra:** Vercel, AWS, Google Cloud, Supabase
- **Payments:** Stripe, MercadoPago, PayPal
- **Auth:** Supabase Auth, NextAuth.js
- **E-commerce:** Custom-built stores, WooCommerce integrations
- **AI / Automation:** OpenAI, Anthropic Claude, Google Gemini

## About

- [Nosotros / About](${SITE_URL}/es/about): Who we are, our values, and how we work.
${portfolioSection}
${blogSection}
- [Contacto / Contact](${SITE_URL}/es/contact): Get in touch. First call is free and with no commitment.

## Pricing

All projects receive a fixed-price proposal within 48 hours. No surprise charges.

- Web pages: From $15,000 MXN / $800 USD
- MVP / Product launch: From $60,000 MXN / $3,000 USD
- Custom software / SaaS: From $150,000 MXN / $8,000 USD

## Frequently asked questions

**¿Cuánto cuesta hacer una página web con imSoft? / How much does a website cost with imSoft?**
Web pages start at $15,000 MXN / $800 USD. Price includes domain, hosting, SSL, responsive design and basic SEO. Fixed price, no surprises.

**¿Cuánto tiempo tarda un proyecto? / How long does a project take?**
Web pages: 2–3 weeks. Web applications and MVPs: 6–12 weeks. Custom software and SaaS: 3–6 months. Timelines are agreed upfront in the proposal.

**¿Trabajan con startups y emprendedores? / Do you work with startups and entrepreneurs?**
Yes. We have a dedicated Starter/Emprendedor plan for first-time entrepreneurs. We also offer MVP development to help validate ideas quickly before investing in full development.

**¿En qué países trabajan? / What countries do you work in?**
We work with clients in Mexico, United States, Canada, and Germany. We are based in Guadalajara, Jalisco, Mexico and work 100% remotely with international clients.

**¿El código es mío cuando termina el proyecto? / Do I own the code after the project?**
Yes. 100% of the code belongs to you. No licenses, no lock-in. You get full access to the repository at the end of the project.

**¿Hacen aplicaciones móviles? / Do you build mobile apps?**
Yes. We build iOS and Android apps using React Native, which allows us to build both platforms simultaneously, reducing cost and time to market.

**¿Ofrecen mantenimiento después del lanzamiento? / Do you offer post-launch maintenance?**
Yes. We offer ongoing maintenance and support plans after launch. Details are discussed during the project proposal phase.

## Service area

Guadalajara (Jalisco), Ciudad de México, Monterrey — and remote clients across Mexico, United States, Canada, and Germany.

## Languages

Site available in Spanish (es) and English (en):
- Spanish: ${SITE_URL}/es
- English: ${SITE_URL}/en

## Contact

- Website: ${SITE_URL}
- WhatsApp: +52 33 2536 5558
- Email: weareimsoft@gmail.com
- Location: Guadalajara, Jalisco, Mexico
`

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
