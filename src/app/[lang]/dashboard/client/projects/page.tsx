import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyAction,
} from "@/components/ui/empty"
import { PanelsTopLeft, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Project } from "@/types/database"

export default async function ClientProjectsPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

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

  // Obtener proyectos de la empresa del usuario
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', company?.id || '')
    .order('created_at', { ascending: false })

  const projectsList = projects || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.client.nav.myProjects}</h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'View your projects' : 'Visualiza tus proyectos'}
        </p>
      </div>
      {projectsList.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <PanelsTopLeft className="size-12" />
            </EmptyMedia>
            <EmptyTitle>{dict.dashboard.empty.myProjects.title}</EmptyTitle>
            <EmptyDescription>
              {dict.dashboard.empty.myProjects.description}{' '}
              <Link 
                href={`/${lang}/dashboard/client/quotations/new`}
                className="text-primary hover:underline font-medium"
              >
                {lang === 'en' ? 'here' : 'aquí'}
              </Link>
              .
            </EmptyDescription>
          </EmptyHeader>
          <EmptyAction>
            <Button asChild>
              <Link href={`/${lang}/dashboard/client/quotations/new`}>
                {lang === 'en' ? 'Create Quotation' : 'Crear Cotización'}
              </Link>
            </Button>
          </EmptyAction>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsList.map((project: Project) => {
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

            return (
              <Link key={project.id} href={`/${lang}/dashboard/client/projects/${project.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {project.image_url && (
                    <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={project.image_url}
                        alt={title || 'Project'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-1">{title}</CardTitle>
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
                      <CardDescription className="line-clamp-2">
                        {description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {project.project_url && (
                        <div className="flex items-center gap-1">
                          <ExternalLink className="h-4 w-4" />
                          <span>{lang === 'en' ? 'Live Site' : 'Sitio en Vivo'}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

