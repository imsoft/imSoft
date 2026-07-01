import { getDictionary, hasLocale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowRight,
  FolderKanban,
  DollarSign,
  Clock,
  MailWarning,
  Users,
  Newspaper,
  LayoutGrid,
  MessageSquare,
} from 'lucide-react'

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

  // Obtener estadísticas del dashboard en paralelo
  const [
    portfolioCount,
    contactMessagesCount,
    unreadMessagesCount,
    contactsCount,
    blogCount,
    projectsCount,
    projectStatusesRes,
    paymentsRes,
    recentProjectsRes,
    recentMessagesRes,
  ] = await Promise.all([
    supabase.from('portfolio').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('blog').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('projects').select('status'),
    supabase.from('project_payments').select('amount, currency, status'),
    supabase
      .from('projects')
      .select('id, title_es, title_en, status, created_at, companies ( name )')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('contact_messages')
      .select('id, first_name, last_name, email, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const recentProjects = recentProjectsRes.data || []
  const recentMessages = recentMessagesRes.data || []

  // Desglose de proyectos por estado
  const projectStatuses = (projectStatusesRes.data || []) as { status: string }[]
  const projectsByStatus = projectStatuses.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})
  const activeProjects = projectsByStatus['in_progress'] || 0

  // Finanzas: sumar pagos por moneda y estado
  const payments = (paymentsRes.data || []) as { amount: number; currency: string | null; status: string }[]
  const money = payments.reduce<Record<string, { completed: number; pending: number }>>((acc, p) => {
    const cur = p.currency || 'MXN'
    if (!acc[cur]) acc[cur] = { completed: 0, pending: 0 }
    const amount = Number(p.amount) || 0
    if (p.status === 'completed') acc[cur].completed += amount
    else if (p.status === 'pending') acc[cur].pending += amount
    return acc
  }, {})
  const currencies = Object.keys(money)

  const stats = {
    portfolio: portfolioCount.count || 0,
    contactMessages: contactMessagesCount.count || 0,
    unreadMessages: unreadMessagesCount.count || 0,
    contacts: contactsCount.count || 0,
    blog: blogCount.count || 0,
    projects: projectsCount.count || 0,
  }

  // Helper para formatear fechas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatMoney = (amount: number, currency: string) =>
    new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount)

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

  const t = (en: string, es: string) => (lang === 'en' ? en : es)

  // Etiquetas de estado de mensaje
  const messageStatusBadge = (status: string) => {
    const map: { [key: string]: { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } } = {
      unread: { label: t('Unread', 'No leído'), variant: 'default' },
      read: { label: t('Read', 'Leído'), variant: 'secondary' },
      replied: { label: t('Replied', 'Respondido'), variant: 'outline' },
      archived: { label: t('Archived', 'Archivado'), variant: 'outline' },
    }
    return map[status] || { label: status, variant: 'outline' as const }
  }

  const projectStatusOrder = ['in_progress', 'planning', 'on_hold', 'completed']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.admin.title}</h1>
        <p className="text-muted-foreground">
          {dict.dashboard.common.welcome}, {fullName}
        </p>
      </div>

      {/* KPIs principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Proyectos */}
        <Link
          href={`/${lang}/dashboard/admin/projects`}
          className="rounded-lg border bg-white p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('Projects', 'Proyectos')}</p>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.projects}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {activeProjects} {t('in progress', 'en progreso')}
          </p>
        </Link>

        {/* Ingresos cobrados */}
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('Collected', 'Cobrado')}</p>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 space-y-0.5">
            {currencies.length === 0 ? (
              <div className="text-2xl font-bold">—</div>
            ) : (
              currencies.map((cur) => (
                <div key={cur} className="text-2xl font-bold leading-tight">
                  {formatMoney(money[cur].completed, cur)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">{cur}</span>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t('Completed payments', 'Pagos completados')}</p>
        </div>

        {/* Por cobrar */}
        <div className="rounded-lg border bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('Outstanding', 'Por cobrar')}</p>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-2 space-y-0.5">
            {currencies.length === 0 ? (
              <div className="text-2xl font-bold">—</div>
            ) : (
              currencies.map((cur) => (
                <div key={cur} className="text-2xl font-bold leading-tight">
                  {formatMoney(money[cur].pending, cur)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">{cur}</span>
                </div>
              ))
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t('Pending payments', 'Pagos pendientes')}</p>
        </div>

        {/* Mensajes sin leer */}
        <Link
          href={`/${lang}/dashboard/admin/contact-messages`}
          className="rounded-lg border bg-white p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{t('Unread messages', 'Mensajes sin leer')}</p>
            <MailWarning className={`h-4 w-4 ${stats.unreadMessages > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
          </div>
          <div className="mt-2 text-2xl font-bold">{stats.unreadMessages}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.contactMessages} {t('total', 'en total')}
          </p>
        </Link>
      </div>

      {/* Métricas secundarias */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          { href: 'crm', icon: Users, label: t('CRM Contacts', 'Contactos CRM'), value: stats.contacts },
          { href: 'blog', icon: Newspaper, label: t('Blog posts', 'Artículos de blog'), value: stats.blog },
          { href: 'portfolio', icon: LayoutGrid, label: t('Portfolio', 'Portafolio'), value: stats.portfolio },
          { href: 'contact-messages', icon: MessageSquare, label: t('Messages', 'Mensajes'), value: stats.contactMessages },
        ].map(({ href, icon: Icon, label, value }) => (
          <Link
            key={href + label}
            href={`/${lang}/dashboard/admin/${href}`}
            className="rounded-lg border bg-white p-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
          >
            <div className="rounded-md bg-primary/10 p-2">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold leading-none">{value}</div>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Desglose de proyectos por estado */}
      {stats.projects > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{t('Projects by status', 'Proyectos por estado')}</CardTitle>
            <CardDescription>
              {t('Distribution across your pipeline', 'Distribución en tu flujo de trabajo')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {projectStatusOrder.map((status) => {
                const badge = getProjectStatusBadge(status)
                const count = projectsByStatus[status] || 0
                const pct = stats.projects > 0 ? Math.round((count / stats.projects) * 100) : 0
                return (
                  <div key={status} className="rounded-lg border p-4">
                    <div className="text-2xl font-bold">{count}</div>
                    <Badge variant={badge.variant} className="mt-1">{badge.label}</Badge>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{pct}%</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Proyectos y mensajes recientes */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Proyectos Recientes */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('Recent Projects', 'Proyectos Recientes')}</CardTitle>
                <CardDescription>{t('Latest 5 projects', 'Últimos 5 proyectos')}</CardDescription>
              </div>
              <Link
                href={`/${lang}/dashboard/admin/projects`}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {t('View all', 'Ver todos')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('No projects yet', 'Aún no hay proyectos')}
              </p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project: any) => {
                  const title = lang === 'en' ? project.title_en : project.title_es
                  const statusBadge = getProjectStatusBadge(project.status)
                  return (
                    <Link
                      key={project.id}
                      href={`/${lang}/dashboard/admin/projects/${project.id}/edit`}
                      className="block rounded-lg border bg-white p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{title}</h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {project.companies?.name || t('No company', 'Sin empresa')}
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

        {/* Mensajes Recientes */}
        <Card className="bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t('Recent Messages', 'Mensajes Recientes')}</CardTitle>
                <CardDescription>{t('Latest contact form messages', 'Últimos mensajes del formulario')}</CardDescription>
              </div>
              <Link
                href={`/${lang}/dashboard/admin/contact-messages`}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {t('View all', 'Ver todos')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {t('No messages yet', 'Aún no hay mensajes')}
              </p>
            ) : (
              <div className="space-y-3">
                {recentMessages.map((msg: any) => {
                  const badge = messageStatusBadge(msg.status)
                  return (
                    <Link
                      key={msg.id}
                      href={`/${lang}/dashboard/admin/contact-messages`}
                      className="block rounded-lg border bg-white p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {msg.first_name} {msg.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{msg.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(msg.created_at)}
                          </p>
                        </div>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
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
