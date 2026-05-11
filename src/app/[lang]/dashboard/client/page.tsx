import { getDictionary, hasLocale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, ArrowRight, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function ClientDashboardPage({ params }: {
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

  // Obtener el nombre completo del usuario
  const fullName = user.user_metadata?.full_name ||
                   (user.user_metadata?.first_name && user.user_metadata?.last_name
                     ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                     : user.email?.split('@')[0] || user.email)

  // Obtener la empresa del usuario
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Obtener proyectos del usuario
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', company?.id || '')
    .order('created_at', { ascending: false })
    .limit(3)

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.client.title}</h1>
        <p className="text-muted-foreground">
          {dict.dashboard.common.welcome}, {fullName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">
              {dict.dashboard.client.nav.myProjects}
            </h3>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">{projects?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {lang === 'en' ? 'Active projects' : 'Proyectos activos'}
            </p>
          </div>
        </div>

      </div>

      {/* Recent Projects */}
      {projects && projects.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{lang === 'en' ? 'Recent Projects' : 'Proyectos Recientes'}</h2>
                <p className="text-sm text-muted-foreground">
                  {lang === 'en' ? 'Your latest projects' : 'Tus últimos proyectos'}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${lang}/dashboard/client/projects`}>
                  {lang === 'en' ? 'View All' : 'Ver Todos'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <div className="space-y-4">
              {projects.map((project) => {
                const title = lang === 'es' ? (project.title_es || project.title) : (project.title_en || project.title)
                const description = lang === 'es' ? (project.description_es || project.description) : (project.description_en || project.description)

                return (
                  <Link
                    key={project.id}
                    href={`/${lang}/dashboard/client/projects/${project.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">{title || '-'}</h3>
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
                        <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
                      )}
                      {project.end_date && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {lang === 'en' ? 'Delivery:' : 'Entrega:'}{' '}
                            {new Date(project.end_date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

