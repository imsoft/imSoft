import Link from 'next/link'
import { Clock, Tag, Code2, ArrowRight } from 'lucide-react'
import type { Dictionary } from '@/app/[lang]/dictionaries'

interface FinalCtaSectionProps {
  dict: Dictionary
  lang: string
}

export function FinalCtaSection({ lang }: FinalCtaSectionProps) {
  const isEs = lang === 'es'

  const trust = isEs
    ? [
        { icon: Clock, text: 'Respuesta en 48 horas' },
        { icon: Tag, text: 'Precio fijo, sin sorpresas' },
        { icon: Code2, text: 'El código es 100% tuyo' },
      ]
    : [
        { icon: Clock, text: 'Reply within 48 hours' },
        { icon: Tag, text: 'Fixed price, no surprises' },
        { icon: Code2, text: 'You own 100% of the code' },
      ]

  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-primary-foreground text-balance">
          {isEs
            ? '¿Listo para transformar tu idea en software?'
            : 'Ready to turn your idea into software?'}
        </h2>
        <p className="text-primary-foreground/75 text-lg max-w-2xl mx-auto mb-10 text-balance">
          {isEs
            ? 'Agenda una llamada gratis. Sin compromiso: platicamos tu proyecto y te enviamos una propuesta con precio fijo en 48 horas.'
            : 'Book a free call. No commitment: we’ll talk through your project and send you a fixed-price proposal within 48 hours.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={`https://wa.me/523325365558?text=${encodeURIComponent(
              isEs
                ? 'Hola imSoft, estoy listo para transformar mi idea en software. ¿Podemos agendar la llamada gratis?'
                : "Hi imSoft, I'm ready to turn my idea into software. Can we schedule the free call?"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-all duration-300 hover:bg-muted hover:shadow-xl hover:shadow-black/20 hover:-translate-y-0.5"
          >
            <span className="text-nowrap">
              {isEs ? 'Agenda una llamada gratis' : 'Book a free call'}
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <Link
            href={`/${lang}/portfolio`}
            className="inline-flex items-center justify-center rounded-xl border border-primary-foreground/30 px-7 py-3.5 text-base font-semibold text-primary-foreground transition-all duration-300 hover:bg-primary-foreground/10 hover:border-primary-foreground/60"
          >
            <span className="text-nowrap">
              {isEs ? 'Ver portafolio' : 'View portfolio'}
            </span>
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trust.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-primary-foreground/85">
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
