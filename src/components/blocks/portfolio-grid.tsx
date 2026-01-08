'use client'

import SpotlightCard from "@/components/ui/spotlight-card"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { PortfolioSectionProps } from '@/types/components'

export function PortfolioGrid({ dict, lang, projects = [] }: PortfolioSectionProps) {
  // Usar proyectos de la prop o proyectos de ejemplo si está vacío
  const displayProjects = projects.length > 0 ? projects : [
    {
      id: '1',
      title: "E-Commerce Platform",
      description: "Modern e-commerce solution with advanced features",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop",
      project_url: undefined
    },
    {
      id: '2',
      title: "Mobile Banking App",
      description: "Secure mobile banking application for iOS and Android",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop",
      project_url: undefined
    },
    {
      id: '3',
      title: "Enterprise Dashboard",
      description: "Analytics dashboard for enterprise management",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
      project_url: undefined
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-background overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {dict.portfolio.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {dict.portfolio.subtitle}
          </p>
        </div>

        {/* Grid de proyectos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((project) => {
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
                <p className="text-muted-foreground flex-grow">
                  {project.description}
                </p>
              </div>
            )

            return (
              <SpotlightCard
                key={project.id}
                className={cn(
                  "custom-spotlight-card h-full bg-white dark:bg-gray-900",
                  project.project_url && "cursor-pointer"
                )}
                spotlightColor="rgba(0, 229, 255, 0.2)"
              >
                {project.project_url ? (
                  <Link
                    href={project.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  cardContent
                )}
              </SpotlightCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
