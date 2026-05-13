'use client'

import Link from 'next/link'
import { Check } from 'lucide-react'
import type { Dictionary } from '@/app/[lang]/dictionaries'

interface PricingSectionProps {
  dict: Dictionary
  lang: string
}

export function PricingSection({ dict, lang }: PricingSectionProps) {
  const isEs = lang === 'es'

  const tiers = [
    {
      icon: '🌱',
      name: isEs ? 'Emprendedor' : 'Starter',
      slug: 'web-pages',
      price: isEs ? 'Desde $5,000 MXN' : 'From $299 USD',
      description: isEs
        ? 'Para emprendedores que dan su primer paso digital sin complicaciones.'
        : 'For entrepreneurs taking their first digital step without the hassle.',
      features: isEs
        ? ['Landing page de una página', 'Diseño personalizado con plantilla', 'Formulario de contacto', 'Entrega en 1 semana']
        : ['Single-page landing page', 'Custom template design', 'Contact form', 'Delivery in 1 week'],
      highlight: false,
    },
    {
      icon: '🖥️',
      name: isEs ? 'Páginas Web' : 'Web Pages',
      slug: 'web-pages',
      price: isEs ? 'Desde $15,000 MXN' : 'From $800 USD',
      description: isEs
        ? 'Ideal para negocios que necesitan presencia digital profesional rápida.'
        : 'Ideal for businesses that need fast professional digital presence.',
      features: isEs
        ? ['Diseño responsive y moderno', 'SEO técnico incluido', 'Dominio, hosting y SSL', 'Entrega en 2–3 semanas']
        : ['Responsive modern design', 'Technical SEO included', 'Domain, hosting & SSL', 'Delivery in 2–3 weeks'],
      highlight: false,
    },
    {
      icon: '🚀',
      name: isEs ? 'MVP / Proyecto' : 'MVP / Project',
      slug: 'desarrollo-de-mvp',
      price: isEs ? 'Desde $60,000 MXN' : 'From $3,000 USD',
      description: isEs
        ? 'Para lanzar tu producto al mercado rápido y validar con usuarios reales.'
        : 'To launch your product to market fast and validate with real users.',
      features: isEs
        ? ['Producto funcional en 6–8 semanas', 'Auth, pagos y admin incluidos', 'Arquitectura que escala sin reescribir', 'Soporte primer mes incluido']
        : ['Functional product in 6–8 weeks', 'Auth, payments & admin included', 'Architecture that scales without rewriting', 'First month support included'],
      highlight: true,
    },
    {
      icon: '💻',
      name: isEs ? 'Software a Medida' : 'Custom Software',
      slug: 'software-a-medida',
      price: isEs ? 'Desde $150,000 MXN' : 'From $8,000 USD',
      description: isEs
        ? 'Plataformas complejas, SaaS y sistemas empresariales sin compromisos.'
        : 'Complex platforms, SaaS and enterprise systems without compromises.',
      features: isEs
        ? ['Arquitectura a tu medida', 'IA integrada donde aplique', 'Código 100% tuyo, sin licencias', 'Roadmap y equipo dedicado']
        : ['Architecture tailored to you', 'AI integrated where applicable', '100% your code, no licenses', 'Dedicated roadmap & team'],
      highlight: false,
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary-foreground">
            {isEs ? 'Referencia de precios' : 'Pricing reference'}
          </h2>
          <p className="text-primary-foreground/75 text-lg max-w-2xl mx-auto">
            {isEs
              ? 'Precios orientativos según el tipo de proyecto. Cada propuesta tiene precio fijo — sin cobros sorpresa al final.'
              : 'Indicative prices by project type. Every proposal has a fixed price — no surprise charges at the end.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.slug}
              className={`relative rounded-2xl border p-8 flex flex-col gap-6 ${
                tier.highlight
                  ? 'border-transparent bg-background shadow-2xl shadow-black/20'
                  : 'border-white/80 bg-primary-foreground/10'
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-white/80">
                    {isEs ? '⭐ Más popular' : '⭐ Most popular'}
                  </span>
                </div>
              )}

              <div>
                <div className="text-3xl mb-3">{tier.icon}</div>
                <h3 className={`text-xl font-bold mb-1 ${tier.highlight ? 'text-foreground' : 'text-primary-foreground'}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm leading-relaxed ${tier.highlight ? 'text-muted-foreground' : 'text-primary-foreground/75'}`}>
                  {tier.description}
                </p>
              </div>

              <div className={`text-3xl font-black ${tier.highlight ? 'text-primary' : 'text-primary-foreground'}`}>
                {tier.price}
              </div>

              <ul className="space-y-2.5">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${tier.highlight ? 'text-primary' : 'text-primary-foreground'}`} />
                    <span className={`text-sm ${tier.highlight ? 'text-muted-foreground' : 'text-primary-foreground/85'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href={`/${lang}/services/${tier.slug}`}
                className={`mt-auto inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition-colors ${
                  tier.highlight
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-background text-foreground hover:bg-muted'
                }`}
              >
                {isEs ? 'Saber más' : 'Learn more'}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-primary-foreground/60 mt-10">
          {isEs
            ? '* Los precios son referencias orientativas. Cada proyecto recibe una propuesta con precio fijo en 48 horas.'
            : '* Prices are indicative references. Every project receives a fixed-price proposal within 48 hours.'}
        </p>
      </div>
    </section>
  )
}
