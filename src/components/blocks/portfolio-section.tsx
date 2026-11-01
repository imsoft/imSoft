'use client'

import CardSwap, { Card } from "@/components/ui/card-swap"
import Image from "@/components/ui/image"
import type { PortfolioSectionProps } from '@/types/components'
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { useMediaQuery } from '@/hooks/use-mobile'

export function PortfolioSection({ dict, lang, projects = [] }: PortfolioSectionProps) {
  // useSyncExternalStore instead of useState + useEffect: avoids the extra render with the
  // provisional value on every load.
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // Use the projects from the prop, or sample projects if it's empty
  const displayProjects = projects.length > 0 ? projects : [
    {
      id: '1',
      slug: '1',
      challenge: null,
      results: [],
      client: null,
      year: null,
      title: "E-Commerce Platform",
      description: "Modern e-commerce solution with advanced features",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
    },
    {
      id: '2',
      slug: '2',
      challenge: null,
      results: [],
      client: null,
      year: null,
      title: "Mobile Banking App",
      description: "Secure mobile banking application for iOS and Android",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop"
    },
    {
      id: '3',
      slug: '3',
      challenge: null,
      results: [],
      client: null,
      year: null,
      title: "Enterprise Dashboard",
      description: "Analytics dashboard for enterprise management",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-background overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Title on top, mobile only */}
        <ScrollReveal className="text-center mb-8 lg:hidden" direction="up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {dict.portfolio.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.portfolio.subtitle}
          </p>
        </ScrollReveal>

        {/* 2-column grid on desktop, cards only on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Text on the left, desktop only */}
          <ScrollReveal className="hidden lg:block" direction="left">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {dict.portfolio.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {dict.portfolio.subtitle}
            </p>
          </ScrollReveal>

          {/* Stacked cards */}
          <ScrollReveal direction="right" delay={0.2} className="relative w-full overflow-visible mx-auto lg:mx-0 px-4 lg:px-0 lg:pr-32 pb-8 lg:pb-16" style={{ height: isDesktop ? '650px' : '450px', minHeight: isDesktop ? '650px' : '450px' }}>
            <CardSwap
              cardDistance={isDesktop ? 60 : 40}
              verticalDistance={isDesktop ? 70 : 50}
              delay={2000}
              pauseOnHover={false}
              width={isDesktop ? 500 : 280}
              height={isDesktop ? 400 : 350}
            >
                {displayProjects.map((project) => (
                  <Card
                    key={project.id}
                    customClass={`bg-card border-border ${isDesktop ? 'p-6' : 'p-4'} shadow-lg`}
                  >
                    <div className="h-full flex flex-col">
                      <div className="relative w-full h-40 sm:h-48 mb-3 sm:mb-4">
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="object-cover rounded-lg"
                          quality={85}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 text-card-foreground line-clamp-2">
                        {project.title}
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground grow line-clamp-3">
                        {project.description}
                      </p>
                    </div>
                  </Card>
                ))}
            </CardSwap>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

