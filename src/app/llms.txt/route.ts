import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://imsoft.io'

export const dynamic = 'force-static'
export const revalidate = 86400 // 24 horas

export function GET() {
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

## About

- [Nosotros / About](${SITE_URL}/es/about): Who we are, our values, and how we work.
- [Portafolio / Portfolio](${SITE_URL}/es/portfolio): Case studies and real projects we have built for clients — including e-commerce, dental clinics, logistics systems, inventory management, and SaaS platforms.
- [Blog](${SITE_URL}/es/blog): Practical articles on software development, digital transformation, and technology for business owners.
- [Contacto / Contact](${SITE_URL}/es/contact): Get in touch. First call is free and with no commitment.

## Pricing

All projects receive a fixed-price proposal within 48 hours. No surprise charges.

- Web pages: From $15,000 MXN / $800 USD
- MVP / Product launch: From $60,000 MXN / $3,000 USD
- Custom software / SaaS: From $150,000 MXN / $8,000 USD

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
