'use client'

import CardSwap, { Card } from "@/components/ui/card-swap"
import Image from "next/image"
import type { PortfolioSectionProps } from '@/types/components'
import { useState, useEffect } from 'react'
import { ScrollReveal } from "@/components/animations/scroll-reveal"

export function PortfolioSection({ dict, lang, projects = [] }: PortfolioSectionProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    // Usar matchMedia en lugar de resize listener: más eficiente, sin polling
    const mql = window.matchMedia('(min-width: 1024px)')
    const onChange = () => setIsDesktop(mql.matches)
    mql.addEventListener('change', onChange)
    setIsDesktop(mql.matches)          // valor inicial real
    return () => mql.removeEventListener('change', onChange)
  }, [])
  // Usar proyectos de la prop o proyectos de ejemplo si está vacío
  const displayProjects = projects.length > 0 ? projects : [
    {
      id: '1',
      title: "E-Commerce Platform",
      description: "Modern e-commerce solution with advanced features",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop"
    },
    {
      id: '2',
      title: "Mobile Banking App",
      description: "Secure mobile banking application for iOS and Android",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop"
    },
    {
      id: '3',
      title: "Enterprise Dashboard",
      description: "Analytics dashboard for enterprise management",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-background overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Título arriba solo en móvil */}
        <ScrollReveal className="text-center mb-8 lg:hidden" direction="up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            {dict.portfolio.title}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.portfolio.subtitle}
          </p>
        </ScrollReveal>

        {/* Grid de 2 columnas en desktop, solo cards en móvil */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Texto a la izquierda - solo en desktop */}
          <ScrollReveal className="hidden lg:block" direction="left">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {dict.portfolio.title}
            </h2>
            <p className="text-lg text-muted-foreground">
              {dict.portfolio.subtitle}
            </p>
          </ScrollReveal>

          {/* Cards apiladas */}
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

