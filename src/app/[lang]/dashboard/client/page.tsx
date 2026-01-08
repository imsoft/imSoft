import { getDictionary, hasLocale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FolderKanban, FileText, ArrowRight, Calendar } from 'lucide-react'
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

  // Obtener cotizaciones del usuario
  const { data: quotations } = await supabase
    .from('quotations')
    .select('*, services(id, title_es, title_en)')
    .eq('user_id', user.id)
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

  const quotationStatusColors = {
    pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    approved: 'bg-green-500/10 text-green-700 dark:text-green-400',
    rejected: 'bg-red-500/10 text-red-700 dark:text-red-400',
    converted: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  }

  const quotationStatusLabels = {
    pending: { es: 'Pendiente', en: 'Pending' },
    approved: { es: 'Aprobada', en: 'Approved' },
    rejected: { es: 'Rechazada', en: 'Rejected' },
    converted: { es: 'Convertida', en: 'Converted' },
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
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
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

        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">
              {lang === 'en' ? 'Quotations' : 'Cotizaciones'}
            </h3>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-bold">{quotations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {lang === 'en' ? 'Total quotations' : 'Total de cotizaciones'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      {projects && projects.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
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

      {/* Recent Quotations */}
      {quotations && quotations.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{lang === 'en' ? 'Recent Quotations' : 'Cotizaciones Recientes'}</h2>
                <p className="text-sm text-muted-foreground">
                  {lang === 'en' ? 'Your latest quotations' : 'Tus últimas cotizaciones'}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${lang}/dashboard/client/quotations`}>
                  {lang === 'en' ? 'View All' : 'Ver Todas'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <div className="space-y-4">
              {quotations.map((quotation) => {
                const service = quotation.services as any
                const serviceName = lang === 'es'
                  ? service?.title_es || service?.title
                  : service?.title_en || service?.title

                return (
                  <Link
                    key={quotation.id}
                    href={`/${lang}/dashboard/client/quotations/${quotation.id}`}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-foreground">
                          {lang === 'en' 
                            ? `Quotation for ${quotation.client_name || 'Client'}`
                            : `Cotización para ${quotation.client_name || 'Cliente'}`}
                        </h3>
                        <Badge variant="outline" className={quotationStatusColors[quotation.status as keyof typeof quotationStatusColors]}>
                          {quotationStatusLabels[quotation.status as keyof typeof quotationStatusLabels][lang]}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{serviceName || '-'}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          }).format(quotation.total)}
                        </span>
                        <span>
                          {new Date(quotation.created_at || '').toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
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

