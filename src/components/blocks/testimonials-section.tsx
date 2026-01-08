import SpotlightCard from "@/components/ui/spotlight-card"
import type { Locale } from '@/app/[lang]/dictionaries'
import Image from 'next/image'
import { Building2 } from 'lucide-react'

import type { TestimonialsSectionProps } from '@/types/components'

export function TestimonialsSection({ dict, lang, testimonials = [] }: TestimonialsSectionProps) {

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {dict.testimonials.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.testimonials.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => {
            const content = lang === 'en' 
              ? (testimonial.content_en || testimonial.content || '')
              : (testimonial.content_es || testimonial.content || '')
            const companyName = testimonial.company || '-'
            const companyLogo = testimonial.company_logo_url

            return (
              <SpotlightCard
                key={testimonial.id}
                className="custom-spotlight-card"
                spotlightColor="rgba(0, 229, 255, 0.2)"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                      {companyLogo ? (
                        <Image
                          src={companyLogo}
                          alt={companyName}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-muted">
                          <Building2 className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-card-foreground">
                        {companyName}
                      </h3>
                    </div>
                  </div>
                  <p className="text-card-foreground flex-grow">
                    "{content}"
                  </p>
                </div>
              </SpotlightCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}

