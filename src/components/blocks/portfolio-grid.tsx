'use client'

import SpotlightCard from "@/components/ui/spotlight-card"
import Image from "next/image"
import Link from "next/link"
import type { PortfolioSectionProps } from '@/types/components'
import type { PortfolioCard } from '@/lib/portfolio-card'
import { CheckCircle2 } from 'lucide-react'
import { ScrollReveal } from "@/components/animations/scroll-reveal"

export function PortfolioGrid({ dict, lang, projects = [] }: PortfolioSectionProps) {
  // Proyectos de ejemplo solo si la base de datos no devolvio nada.
  const displayProjects: PortfolioCard[] = projects.length > 0 ? projects : [
    {
      id: '1',
      slug: '1',
      title: "E-Commerce Platform",
      description: "Modern e-commerce solution with advanced features",
      challenge: null,
      results: [],
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
      client: null,
      year: null,
    },
    {
      id: '2',
      slug: '2',
      title: "Mobile Banking App",
      description: "Secure mobile banking application for iOS and Android",
      challenge: null,
      results: [],
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
      client: null,
      year: null,
    },
    {
      id: '3',
      slug: '3',
      title: "Enterprise Dashboard",
      description: "Analytics dashboard for enterprise management",
      challenge: null,
      results: [],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      client: null,
      year: null,
    }
  ]
  const isEs = lang !== 'en'

  return (
    <section className="py-16 md:py-24 bg-background overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <ScrollReveal className="text-center mb-12" direction="up">
          {/* h1 de /portfolio: este componente solo se usa en esa pagina */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {dict.portfolio.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.portfolio.subtitle}
          </p>
        </ScrollReveal>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((project, i) => {
            const cardContent = (
              <div className="flex flex-col h-full">
                <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-card-foreground">
                  {project.title}
                </h3>
                <p className="text-muted-foreground">
                  {project.description}
                </p>
                {project.challenge && (
                  <p className="mt-4 text-sm text-muted-foreground/90 leading-relaxed">
                    <span className="font-semibold text-card-foreground">
                      {isEs ? 'El reto: ' : 'The challenge: '}
                    </span>
                    {project.challenge}
                  </p>
                )}
                {project.results.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm" aria-label={isEs ? 'Resultados' : 'Results'}>
                    {project.results.map((result) => (
                      <li key={result} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{result}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="grow" />
                {(project.client || project.year) && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    {[project.client, project.year].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            )

            const detailSlug = project.slug

            return (
              <ScrollReveal key={project.id} direction="up" delay={i * 0.1}>
                <SpotlightCard
                  className="custom-spotlight-card h-full bg-card cursor-pointer"
                  spotlightColor="rgba(0, 229, 255, 0.2)"
                >
                  <Link href={`/${lang}/portfolio/${detailSlug}`} className="block h-full">
                    {cardContent}
                  </Link>
                </SpotlightCard>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
