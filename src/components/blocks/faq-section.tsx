'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Dictionary } from '@/app/[lang]/dictionaries'

interface FaqSectionProps {
  dict: Dictionary
  lang: string
}

export function FaqSection({ lang }: FaqSectionProps) {
  const isEs = lang === 'es'
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = isEs
    ? [
        {
          q: '¿Cuánto cuesta mi proyecto?',
          a: 'Cada proyecto recibe una propuesta con precio fijo en un máximo de 48 horas. No cobramos por hora ni hay sorpresas al final: sabes exactamente cuánto vas a pagar antes de empezar.',
        },
        {
          q: '¿Cuánto tardan en entregar?',
          a: 'Depende del alcance: una landing page en 1 semana, una página web profesional en 2–3 semanas y un MVP funcional en 6–8 semanas. En la propuesta te damos una fecha de entrega concreta.',
        },
        {
          q: '¿El código es mío?',
          a: 'Sí, el 100% del código es tuyo. Sin licencias recurrentes ni dependencias atadas a nosotros. Te entregamos todo y puedes llevártelo cuando quieras.',
        },
        {
          q: '¿Dan soporte y mantenimiento después de entregar?',
          a: 'Sí. Todos los proyectos incluyen soporte tras la entrega y ofrecemos planes de mantenimiento continuo para que tu plataforma siga creciendo y actualizada.',
        },
        {
          q: '¿Trabajan con empresas fuera de Guadalajara o de México?',
          a: 'Por supuesto. Trabajamos de forma remota con clientes en todo México y el extranjero. La comunicación es constante y tienes visibilidad del avance en todo momento.',
        },
        {
          q: '¿Cómo empiezo?',
          a: 'Agenda una llamada gratis. Platicamos tu idea, resolvemos tus dudas y, si encajamos, te enviamos una propuesta con precio fijo. Sin compromiso.',
        },
      ]
    : [
        {
          q: 'How much will my project cost?',
          a: 'Every project gets a fixed-price proposal within 48 hours. We don’t charge by the hour and there are no surprises at the end: you know exactly what you’ll pay before we start.',
        },
        {
          q: 'How long does delivery take?',
          a: 'It depends on scope: a landing page in 1 week, a professional website in 2–3 weeks, and a functional MVP in 6–8 weeks. The proposal includes a concrete delivery date.',
        },
        {
          q: 'Do I own the code?',
          a: 'Yes, 100% of the code is yours. No recurring licenses, no lock-in. We hand everything over and you can take it with you whenever you want.',
        },
        {
          q: 'Do you offer support and maintenance after delivery?',
          a: 'Yes. Every project includes post-delivery support, and we offer ongoing maintenance plans so your platform keeps growing and stays up to date.',
        },
        {
          q: 'Do you work with companies outside Guadalajara or Mexico?',
          a: 'Absolutely. We work remotely with clients across Mexico and abroad. Communication is constant and you have visibility into progress at all times.',
        },
        {
          q: 'How do I get started?',
          a: 'Book a free call. We’ll talk through your idea, answer your questions, and if we’re a good fit, send you a fixed-price proposal. No commitment.',
        },
      ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">
            {isEs ? 'Preguntas frecuentes' : 'Frequently asked questions'}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {isEs
              ? 'Lo que la mayoría de nuestros clientes quiere saber antes de empezar.'
              : 'What most of our clients want to know before getting started.'}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            return (
              <div
                key={i}
                className={`rounded-2xl border bg-card transition-all duration-300 ${
                  isOpen ? 'border-primary/40 shadow-lg shadow-primary/5' : 'border-border hover:border-primary/30'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left cursor-pointer"
                >
                  <span className="text-base md:text-lg font-semibold text-card-foreground">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
