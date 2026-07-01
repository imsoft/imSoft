'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Dictionary } from '@/app/[lang]/dictionaries'
import { faqs as faqData } from '@/config/faq-data'
import { ScrollReveal } from "@/components/animations/scroll-reveal"

interface FaqSectionProps {
  dict: Dictionary
  lang: string
}

export function FaqSection({ lang }: FaqSectionProps) {
  const isEs = lang === 'es'
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = faqData[isEs ? 'es' : 'en']

  return (
    <section className="py-16 md:py-24 bg-background">
      <ScrollReveal className="mx-auto max-w-3xl px-6" direction="up">
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
      </ScrollReveal>
    </section>
  )
}
