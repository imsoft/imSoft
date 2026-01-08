'use client'

import TiltedCard from "@/components/ui/tilted-card"
import type { Locale } from '@/app/[lang]/dictionaries'
import type { ServicesSectionProps } from '@/types/components'
import Link from 'next/link'

export function ServicesSection({ dict, lang }: ServicesSectionProps) {
  const services = [
    {
      id: 'web',
      slug: 'aplicaciones-web',
      title: dict.services.webApps.title,
      imageSrc: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      altText: 'Web Applications'
    },
    {
      id: 'mobile',
      slug: 'aplicaciones-moviles',
      title: dict.services.mobileApps.title,
      imageSrc: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
      altText: 'Mobile Applications'
    },
    {
      id: 'consulting',
      slug: 'consultoria-tecnologica',
      title: dict.services.consulting.title,
      imageSrc: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
      altText: 'Technology Consulting'
    }
  ]

  return (
    <section id="services" className="py-16 md:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {dict.services.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.services.subtitle}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/${lang}/servicios/${service.slug}`}
              className="flex flex-col items-center group cursor-pointer"
            >
              <TiltedCard
                imageSrc={service.imageSrc}
                altText={service.altText}
                captionText={service.title}
                containerHeight="300px"
                containerWidth="100%"
                imageHeight="300px"
                imageWidth="100%"
                rotateAmplitude={12}
                scaleOnHover={1.1}
                showMobileWarning={false}
                showTooltip={false}
                displayOverlayContent={true}
                overlayContent={
                  <div
                    className="px-4 py-2 inline-block m-6"
                    style={{
                      backgroundColor: 'oklch(from var(--primary) l c h / 0.8)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    <p
                      className="font-bold text-sm whitespace-nowrap"
                      style={{
                        color: 'var(--secondary-foreground)'
                      }}
                    >
                      {service.title}
                    </p>
                  </div>
                }
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

