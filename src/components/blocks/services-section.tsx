import TiltedCard from "@/components/ui/tilted-card"
import type { ServicesSectionProps } from '@/types/components'
import type { Service } from '@/types/database'
import Link from 'next/link'

interface ServicesSectionClientProps extends ServicesSectionProps {
  services: Service[]
}

export function ServicesSection({ dict, lang, services }: ServicesSectionClientProps) {
  const displayServices = services.map((service) => ({
    id: service.id,
    slug: service.slug || '',
    title: lang === 'en'
      ? (service.title_en || service.title || '')
      : (service.title_es || service.title || ''),
    imageSrc: service.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    altText: lang === 'en'
      ? (service.title_en || service.title || '')
      : (service.title_es || service.title || '')
  }))

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
          {displayServices.map((service) => (
            <Link
              key={service.id}
              href={`/${lang}/services/${service.slug}`}
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

