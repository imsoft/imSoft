import { getDictionary, hasLocale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export default async function AdminDashboardPage({ params }: {
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

  // Obtener estadísticas del dashboard
  const [portfolioCount, contactMessagesCount, contactsCount, blogCount, projectsCount, quotationsCount] = await Promise.all([
    supabase.from('portfolio').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('blog').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('quotations').select('*', { count: 'exact', head: true }),
  ])

  const stats = {
    portfolio: portfolioCount.count || 0,
    contactMessages: contactMessagesCount.count || 0,
    contacts: contactsCount.count || 0,
    blog: blogCount.count || 0,
    projects: projectsCount.count || 0,
    quotations: quotationsCount.count || 0,
  }

  // Obtener proyectos recientes (últimos 5)
  const { data: recentProjects = [] } = await supabase
    .from('projects')
    .select(`
      id,
      title_es,
      title_en,
      status,
      created_at,
      companies (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Obtener cotizaciones recientes (últimas 5)
  const { data: recentQuotations = [] } = await supabase
    .from('quotations')
    .select(`
      id,
      client_name,
      client_company,
      total,
      status,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Helper para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Helper para obtener badge de estado de proyecto
  const getProjectStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
      planning: { label: lang === 'en' ? 'Planning' : 'Planeación', variant: 'secondary' },
      in_progress: { label: lang === 'en' ? 'In Progress' : 'En Progreso', variant: 'default' },
      completed: { label: lang === 'en' ? 'Completed' : 'Completado', variant: 'outline' },
      on_hold: { label: lang === 'en' ? 'On Hold' : 'En Espera', variant: 'destructive' },
    }
    return statusMap[status] || { label: status, variant: 'outline' as const }
  }

  // Helper para obtener badge de estado de cotización
  const getQuotationStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
      pending: { label: lang === 'en' ? 'Pending' : 'Pendiente', variant: 'secondary' },
      approved: { label: lang === 'en' ? 'Approved' : 'Aprobada', variant: 'default' },
      rejected: { label: lang === 'en' ? 'Rejected' : 'Rechazada', variant: 'destructive' },
      converted: { label: lang === 'en' ? 'Converted' : 'Convertida', variant: 'outline' },
    }
    return statusMap[status] || { label: status, variant: 'outline' as const }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.admin.title}</h1>
        <p className="text-muted-foreground">
          {dict.dashboard.common.welcome}, {fullName}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-white p-6">
          <div className="text-2xl font-bold">{stats.projects}</div>
          <p className="text-sm text-muted-foreground">
            {lang === 'en' ? 'Active Projects' : 'Proyectos Activos'}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <div className="text-2xl font-bold">{stats.quotations}</div>
          <p className="text-sm text-muted-foreground">
            {lang === 'en' ? 'Quotations' : 'Cotizaciones'}
          </p>
        </div>
        <div className="rounded-lg border bg-white p-6">
          <div className="text-2xl font-bold">{stats.contacts}</div>
          <p className="text-sm text-muted-foreground">
            {lang === 'en' ? 'CRM Contacts' : 'Contactos CRM'}
          </p>
        </div>
      </div>

      {/* Proyectos y Cotizaciones Recientes */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Proyectos Recientes */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{lang === 'en' ? 'Recent Projects' : 'Proyectos Recientes'}</CardTitle>
                <CardDescription>
                  {lang === 'en' ? 'Latest 5 projects' : 'Últimos 5 proyectos'}
                </CardDescription>
              </div>
              <Link
                href={`/${lang}/dashboard/admin/projects`}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {lang === 'en' ? 'View all' : 'Ver todos'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!recentProjects || recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {lang === 'en' ? 'No projects yet' : 'Aún no hay proyectos'}
              </p>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project: any) => {
                  const title = lang === 'en' ? project.title_en : project.title_es
                  const statusBadge = getProjectStatusBadge(project.status)
                  return (
                    <Link
                      key={project.id}
                      href={`/${lang}/dashboard/admin/projects/${project.id}/edit`}
                      className="block rounded-lg border bg-white p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {project.companies?.name || (lang === 'en' ? 'No company' : 'Sin empresa')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(project.created_at)}
                          </p>
                        </div>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cotizaciones Recientes */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{lang === 'en' ? 'Recent Quotations' : 'Cotizaciones Recientes'}</CardTitle>
                <CardDescription>
                  {lang === 'en' ? 'Latest 5 quotations' : 'Últimas 5 cotizaciones'}
                </CardDescription>
              </div>
              <Link
                href={`/${lang}/dashboard/admin/quotations`}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {lang === 'en' ? 'View all' : 'Ver todas'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!recentQuotations || recentQuotations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {lang === 'en' ? 'No quotations yet' : 'Aún no hay cotizaciones'}
              </p>
            ) : (
              <div className="space-y-4">
                {recentQuotations.map((quotation: any) => {
                  const statusBadge = getQuotationStatusBadge(quotation.status)
                  return (
                    <Link
                      key={quotation.id}
                      href={`/${lang}/dashboard/admin/quotations/${quotation.id}`}
                      className="block rounded-lg border bg-white p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{quotation.client_name}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {quotation.client_company || (lang === 'en' ? 'No company' : 'Sin empresa')}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-sm font-semibold text-primary">
                              ${Number(quotation.total).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(quotation.created_at)}
                            </p>
                          </div>
                        </div>
                        <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

