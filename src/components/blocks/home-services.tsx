import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import Image from '@/components/ui/image'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/animations/scroll-reveal'
import { SERVICIOS_PRINCIPALES, casoIlustrado, serviciosDeMarketing, serviciosSecundarios } from '@/lib/servicios-principales'
import type { Service } from '@/types/database'

interface HomeServicesProps {
  lang: string
  services: Service[]
  portfolio: Array<{ slug?: string | null; image_url?: string | null }>
  title: string
  subtitle: string
}

const WHATSAPP = '523325365558'

/**
 * Servicios en la portada: cinco principales con problema, entregables, precio y un caso
 * real del portafolio, y el resto en una lista compacta. La pagina /services sigue usando
 * la cuadricula completa (ServicesSection).
 */
export function HomeServices({ lang, services, portfolio, title, subtitle }: HomeServicesProps) {
  const es = lang !== 'en'
  const l = es ? 'es' : 'en'
  const secundarios = serviciosSecundarios(services, lang)
  const marketing = serviciosDeMarketing(services, lang)
  const whatsapp = (servicio: string) =>
    `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(es
      ? `Hola imSoft, me interesa ${servicio.toLowerCase()} para mi negocio. ¿Podemos agendar la llamada gratuita?`
      : `Hi imSoft, I'm interested in ${servicio.toLowerCase()} for my business. Can we schedule the free call?`)}`

  return (
    <section id="services" className="py-16 md:py-24 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal className="text-center mb-12" direction="up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-primary-foreground/75 max-w-2xl mx-auto">{subtitle}</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICIOS_PRINCIPALES.map((s, i) => {
            const caso = casoIlustrado(s, portfolio)
            const titulo = s.titulo[l]
            return (
              <ScrollReveal key={s.slug} direction="up" delay={i * 0.08} className="h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-2xl bg-background text-foreground shadow-lg">
                  {caso ? (
                    <Link href={`/${lang}/portfolio/${caso.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-muted" aria-label={`${es ? 'Caso' : 'Case'}: ${caso.nombre}`}>
                      <Image src={caso.imagen} alt={`${caso.nombre} · ${titulo}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover object-top transition-transform duration-500 hover:scale-105" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground">
                        {es ? 'Caso real' : 'Real case'}: {caso.nombre}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-background px-8 text-center">
                      <p className="text-2xl font-bold leading-tight text-primary">
                        {es ? 'Tu marca en el celular de tus clientes' : 'Your brand on your customers’ phones'}
                      </p>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div>
                      <h3 className="text-xl font-bold">{titulo}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{s.problema[l]}</p>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {s.entregables[l].map((e) => (
                        <li key={e} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                      <p className="text-sm font-semibold">
                        {s.desde ? s.desde[l] : es ? 'Precio fijo en 24 horas' : 'Fixed price in 24 hours'}
                      </p>
                      <Link href={`/${lang}/services/${s.slug}`} className="text-sm font-medium text-primary hover:underline">
                        {es ? 'Ver detalles' : 'See details'}
                      </Link>
                    </div>
                    <Button asChild className="w-full rounded-xl">
                      <a href={whatsapp(titulo)} target="_blank" rel="noopener noreferrer">
                        {es ? 'Agenda una llamada gratis' : 'Book a free call'} <ArrowRight className="ml-1 size-4" aria-hidden />
                      </a>
                    </Button>
                  </div>
                </article>
              </ScrollReveal>
            )
          })}

          <ScrollReveal direction="up" delay={0.4} className="h-full">
            <div className="flex h-full flex-col justify-center rounded-2xl bg-background p-6 text-foreground shadow-lg">
              <h3 className="text-xl font-bold">{es ? 'También hacemos' : 'We also do'}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {es ? 'Casi siempre como parte de un proyecto de los de arriba.' : 'Usually as part of one of the projects above.'}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {secundarios.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/${lang}/services/${s.slug}`} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-sm text-foreground transition-colors hover:bg-primary hover:text-primary-foreground">
                      {s.icono && <span aria-hidden>{s.icono}</span>}{s.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
              {marketing.length > 0 && (
                <p className="mt-5 text-sm text-muted-foreground">
                  {es ? 'Y marketing digital: ' : 'And digital marketing: '}
                  {marketing.map((m, i) => (
                    <span key={m.slug}>
                      {i > 0 && ', '}
                      <Link href={`/${lang}/services/${m.slug}`} className="underline-offset-2 hover:underline">{m.titulo.toLowerCase()}</Link>
                    </span>
                  ))}.
                </p>
              )}
              <Link href={`/${lang}/services`} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                {es ? 'Ver todos los servicios' : 'See all services'} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
