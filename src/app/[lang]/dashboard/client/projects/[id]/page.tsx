import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ArrowLeft, Globe, GitBranch } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Project } from "@/types/database"
import { CommitsTimeline } from "@/components/projects/commits-timeline"
import { TaskProgress } from "@/components/projects/task-progress"
import { ProjectCountdown } from "@/components/projects/project-countdown"
import { ProjectPaymentsViewer } from "@/components/projects/project-payments-viewer"

export default async function ClientProjectDetailPage({ params }: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Obtener la empresa del usuario
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Obtener el proyecto
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('company_id', company?.id || '')
    .single()

  if (!project) {
    notFound()
  }

  const title = lang === 'en' ? (project.title_en || project.title) : (project.title_es || project.title)
  const description = lang === 'en' ? (project.description_en || project.description) : (project.description_es || project.description)

  const statusColors = {
    'planning': 'bg-blue-500',
    'in-progress': 'bg-yellow-500',
    'completed': 'bg-green-500',
    'on-hold': 'bg-orange-500',
    'cancelled': 'bg-red-500',
  }

  const statusLabels = {
    'planning': lang === 'en' ? 'Planning' : 'Planificación',
    'in-progress': lang === 'en' ? 'In Progress' : 'En Progreso',
    'completed': lang === 'en' ? 'Completed' : 'Completado',
    'on-hold': lang === 'en' ? 'On Hold' : 'En Pausa',
    'cancelled': lang === 'en' ? 'Cancelled' : 'Cancelado',
  }

  const projectTypeLabels: Record<string, { es: string; en: string }> = {
    'web-development': { es: 'Desarrollo Web', en: 'Web Development' },
    'mobile-app': { es: 'Aplicación Móvil', en: 'Mobile App' },
    'ecommerce': { es: 'E-commerce', en: 'E-commerce' },
    'landing-page': { es: 'Página de Aterrizaje', en: 'Landing Page' },
    'web-app': { es: 'Aplicación Web', en: 'Web Application' },
    'portfolio': { es: 'Sitio Web Portafolio', en: 'Portfolio Website' },
    'cms': { es: 'Sistema de Gestión de Contenidos', en: 'Content Management System' },
    'api': { es: 'Desarrollo de API', en: 'API Development' },
  }

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link href={`/${lang}/dashboard/client/projects`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{title}</h1>
            {project.status && (
              <Badge
                variant="outline"
                className={`${statusColors[project.status as keyof typeof statusColors] || 'bg-gray-500'} text-white border-0`}
              >
                {statusLabels[project.status as keyof typeof statusLabels] || project.status}
              </Badge>
            )}
          </div>
          {description && (
            <p className="text-muted-foreground mt-1">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Project image */}
        {project.image_url && (
          <Card>
            <CardContent className="p-0">
              <div className="relative w-full h-96 overflow-hidden rounded-lg">
                <Image
                  src={project.image_url}
                  alt={title || 'Project'}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Countdown */}
        {project.end_date && (
          <ProjectCountdown endDate={project.end_date} lang={lang} />
        )}

        {/* Task progress */}
        <TaskProgress projectId={id} lang={lang} />

        {/* Project links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {lang === 'en' ? 'Project Links' : 'Enlaces del Proyecto'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.project_url && (
              <a
                href={project.project_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>{lang === 'en' ? 'Visit Live Site' : 'Visitar Sitio en Vivo'}</span>
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            )}
            {project.github_enabled && project.github_repo_url && (
              <a
                href={project.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
              >
                <GitBranch className="h-4 w-4" />
                <span>{lang === 'en' ? 'View Repository' : 'Ver Repositorio'}</span>
                <ExternalLink className="h-3 w-3 ml-auto" />
              </a>
            )}
            {!project.project_url && !project.github_repo_url && (
              <p className="text-sm text-muted-foreground">
                {lang === 'en' ? 'No links available' : 'No hay enlaces disponibles'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Project info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {lang === 'en' ? 'Project Information' : 'Información del Proyecto'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.project_type && (
                <div>
                  <p className="text-sm font-semibold mb-1">{lang === 'en' ? 'Type' : 'Tipo'}</p>
                  <p className="text-sm text-muted-foreground">
                    {projectTypeLabels[project.project_type]?.[lang] || project.project_type.replace('-', ' ')}
                  </p>
                </div>
              )}
              {project.start_date && (
                <div>
                  <p className="text-sm font-semibold mb-1">{lang === 'en' ? 'Start Date' : 'Fecha de Inicio'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.start_date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {project.end_date && (
                <div>
                  <p className="text-sm font-semibold mb-1">{lang === 'en' ? 'End Date' : 'Fecha de Entrega'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.end_date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold mb-1">{lang === 'en' ? 'Created' : 'Creado'}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(project.created_at || '').toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              {project.updated_at && (
                <div>
                  <p className="text-sm font-semibold mb-1">{lang === 'en' ? 'Last Updated' : 'Última Actualización'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(project.updated_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payments Section */}
        {(project.total_price || project.total_price === 0) && (
          <Card>
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Payments' : 'Pagos'}</CardTitle>
              <CardDescription>
                {lang === 'en' 
                  ? 'View payment history and status for this project'
                  : 'Ver historial y estado de pagos para este proyecto'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectPaymentsViewer 
                projectId={id} 
                projectCurrency={project.currency || 'MXN'}
                projectTotalPrice={project.total_price}
                lang={lang as 'es' | 'en'}
              />
            </CardContent>
          </Card>
        )}

        {/* GitHub commits timeline */}
        {project.github_enabled && project.github_owner && project.github_repo_name && (
          <CommitsTimeline
            owner={project.github_owner}
            repo={project.github_repo_name}
            lang={lang}
          />
        )}
      </div>
    </div>
  )
}
