import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  FolderKanban,
  Briefcase,
  FileText,
  MessageSquare,
  PanelsTopLeft,
  TrendingUp,
  Calendar,
  Languages
} from 'lucide-react'

export default async function AdminAnalyticsPage({ params }: {
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

  // Obtener todas las métricas del sistema
  const [
    usersData,
    projectsData,
    servicesData,
    portfolioData,
    blogData,
    testimonialsData,
    translationData,
  ] = await Promise.all([
    // Usuarios (solo clientes, excluyendo admins)
    (async () => {
      try {
        const supabaseAdmin = createAdminClient()
        const { data } = await supabaseAdmin.auth.admin.listUsers()
        const clients = (data?.users || []).filter(
          u => u.user_metadata?.role !== 'admin'
        )
        return { count: clients.length, data: clients }
      } catch {
        return { count: 0, data: [] }
      }
    })(),
    // Proyectos
    supabase.from('projects').select('*', { count: 'exact' }),
    // Servicios
    supabase.from('services').select('*', { count: 'exact' }),
    // Portfolio
    supabase.from('portfolio').select('*', { count: 'exact' }),
    // Blog
    supabase.from('blog').select('*', { count: 'exact' }),
    // Testimonials
    supabase.from('testimonials').select('*', { count: 'exact' }),
    // Translation logs del mes actual
    (async () => {
      const firstDayOfMonth = new Date()
      firstDayOfMonth.setDate(1)
      firstDayOfMonth.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('translation_logs')
        .select('characters_count')
        .gte('created_at', firstDayOfMonth.toISOString())

      if (error) {
        console.error('Error fetching translation logs:', error)
        return { totalCharacters: 0, translationCount: 0 }
      }

      const totalCharacters = (data || []).reduce((sum, log) => sum + log.characters_count, 0)
      const translationCount = (data || []).length

      return { totalCharacters, translationCount }
    })(),
  ])

  const totalUsers = usersData.count
  const totalProjects = projectsData.count || 0
  const totalServices = servicesData.count || 0
  const totalPortfolio = portfolioData.count || 0
  const totalBlog = blogData.count || 0
  const totalTestimonials = testimonialsData.count || 0
  const totalTranslationCharacters = translationData.totalCharacters
  const totalTranslations = translationData.translationCount

  // Límite mensual de Google Cloud Translation API (gratis: 500,000 caracteres/mes)
  const MONTHLY_LIMIT = 500000
  const usagePercentage = (totalTranslationCharacters / MONTHLY_LIMIT) * 100

  // Estadísticas de proyectos por estado
  const projects = projectsData.data || []
  const projectsByStatus = {
    planning: projects.filter((p: any) => p.status === 'planning').length,
    'in-progress': projects.filter((p: any) => p.status === 'in-progress').length,
    'on-hold': projects.filter((p: any) => p.status === 'on-hold').length,
    completed: projects.filter((p: any) => p.status === 'completed').length,
    cancelled: projects.filter((p: any) => p.status === 'cancelled').length,
  }

  // Actividad reciente (últimos 7 días)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const recentProjects = projects.filter((p: any) => {
    if (!p.created_at) return false
    return new Date(p.created_at) >= sevenDaysAgo
  }).length

  const recentUsers = usersData.data.filter((u: any) => {
    if (!u.created_at) return false
    return new Date(u.created_at) >= sevenDaysAgo
  }).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.analytics}</h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'System analytics and metrics' : 'Analíticas y métricas del sistema'}
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.dashboard.admin.nav.users}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {recentUsers > 0 
                ? `+${recentUsers} ${lang === 'en' ? 'this week' : 'esta semana'}`
                : lang === 'en' ? 'No new users this week' : 'Sin nuevos usuarios esta semana'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.dashboard.admin.nav.projects}
            </CardTitle>
            <PanelsTopLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {recentProjects > 0
                ? `+${recentProjects} ${lang === 'en' ? 'this week' : 'esta semana'}`
                : lang === 'en' ? 'No new projects this week' : 'Sin nuevos proyectos esta semana'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.dashboard.admin.nav.services}
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalServices}</div>
            <p className="text-xs text-muted-foreground">
              {lang === 'en' ? 'Total services' : 'Total de servicios'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.dashboard.admin.nav.portfolio}
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPortfolio}</div>
            <p className="text-xs text-muted-foreground">
              {lang === 'en' ? 'Portfolio items' : 'Elementos del portafolio'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.dashboard.admin.nav.blog}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBlog}</div>
            <p className="text-xs text-muted-foreground">
              {lang === 'en' ? 'Blog posts' : 'Publicaciones del blog'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.dashboard.admin.nav.testimonials}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTestimonials}</div>
            <p className="text-xs text-muted-foreground">
              {lang === 'en' ? 'Testimonials' : 'Testimonios'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {lang === 'en' ? 'Translation Usage' : 'Uso de Traducción'}
            </CardTitle>
            <Languages className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTranslationCharacters.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === 'en'
                ? `${totalTranslations} translations this month`
                : `${totalTranslations} traducciones este mes`
              }
            </p>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">
                  {lang === 'en' ? 'Monthly limit' : 'Límite mensual'}
                </span>
                <span className="font-medium">
                  {usagePercentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    usagePercentage >= 90
                      ? 'bg-destructive'
                      : usagePercentage >= 70
                      ? 'bg-yellow-500'
                      : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(MONTHLY_LIMIT - totalTranslationCharacters).toLocaleString()} {lang === 'en' ? 'characters remaining' : 'caracteres restantes'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas de proyectos por estado */}
      {totalProjects > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {lang === 'en' ? 'Projects by Status' : 'Proyectos por Estado'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {lang === 'en' ? 'Planning' : 'Planificación'}
                </div>
                <div className="text-2xl font-bold">{projectsByStatus.planning}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {lang === 'en' ? 'In Progress' : 'En Progreso'}
                </div>
                <div className="text-2xl font-bold">{projectsByStatus['in-progress']}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {lang === 'en' ? 'On Hold' : 'En Pausa'}
                </div>
                <div className="text-2xl font-bold">{projectsByStatus['on-hold']}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {lang === 'en' ? 'Completed' : 'Completados'}
                </div>
                <div className="text-2xl font-bold">{projectsByStatus.completed}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {lang === 'en' ? 'Cancelled' : 'Cancelados'}
                </div>
                <div className="text-2xl font-bold">{projectsByStatus.cancelled}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {lang === 'en' ? 'Activity Summary' : 'Resumen de Actividad'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {lang === 'en' ? 'Total Content Items' : 'Total de Elementos de Contenido'}
              </span>
              <span className="text-lg font-semibold">
                {totalServices + totalPortfolio + totalBlog + totalTestimonials}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {lang === 'en' ? 'Active Projects' : 'Proyectos Activos'}
              </span>
              <span className="text-lg font-semibold">
                {projectsByStatus['in-progress'] + projectsByStatus.planning}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {lang === 'en' ? 'Completed Projects' : 'Proyectos Completados'}
              </span>
              <span className="text-lg font-semibold">
                {projectsByStatus.completed}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
