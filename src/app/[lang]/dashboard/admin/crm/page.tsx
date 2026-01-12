import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users, DollarSign, TrendingUp, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function CRMPage({ params }: {
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

  // Verificar que el usuario sea admin
  if (user.user_metadata?.role !== 'admin') {
    redirect(`/${lang}/dashboard/client`)
  }

  // Obtener estadísticas del CRM
  const { count: totalContacts } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })

  const { count: activeLeads } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('contact_type', 'lead')
    .eq('status', 'active')

  const { count: totalDeals } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })

  const { count: wonDeals } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('stage', 'closed_won')

  // Calcular pipeline value
  const { data: activeDealsData } = await supabase
    .from('deals')
    .select('value')
    .not('stage', 'in', '(closed_won,closed_lost)')

  const pipelineValue = activeDealsData?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0

  // Calcular revenue del mes
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: wonDealsThisMonth } = await supabase
    .from('deals')
    .select('value')
    .eq('stage', 'closed_won')
    .gte('actual_close_date', startOfMonth.toISOString())

  const monthlyRevenue = wonDealsThisMonth?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0

  // Obtener actividades recientes
  const { data: recentActivities } = await supabase
    .from('activities')
    .select(`
      *,
      contacts (
        first_name,
        last_name,
        company
      ),
      deals (
        title
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Obtener deals recientes
  const { data: recentDeals } = await supabase
    .from('deals')
    .select(`
      *,
      contacts (
        first_name,
        last_name,
        company
      ),
      services (
        title_es,
        title_en
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {lang === 'en' ? 'CRM Dashboard' : 'Panel CRM'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en'
              ? 'Manage contacts, deals, and sales pipeline'
              : 'Gestiona contactos, negocios y pipeline de ventas'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/${lang}/dashboard/admin/crm/contacts`}>
              <Users className="mr-1.5 size-4" />
              {lang === 'en' ? 'Contacts' : 'Contactos'}
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/${lang}/dashboard/admin/crm/deals`}>
              <DollarSign className="mr-1.5 size-4" />
              {lang === 'en' ? 'Deals' : 'Negocios'}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/crm/contacts/new`}>
              <Plus className="mr-1.5 size-4" />
              {lang === 'en' ? 'New Contact' : 'Nuevo Contacto'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Total Contacts' : 'Total Contactos'}
              </p>
              <p className="text-2xl font-bold">{totalContacts || 0}</p>
            </div>
            <Users className="size-8 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {activeLeads || 0} {lang === 'en' ? 'active leads' : 'leads activos'}
          </p>
        </Card>

        <Card className="p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Pipeline Value' : 'Valor Pipeline'}
              </p>
              <p className="text-2xl font-bold">{formatCurrency(pipelineValue)}</p>
            </div>
            <TrendingUp className="size-8 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {totalDeals || 0} {lang === 'en' ? 'active deals' : 'negocios activos'}
          </p>
        </Card>

        <Card className="p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Monthly Revenue' : 'Ingresos Mensuales'}
              </p>
              <p className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</p>
            </div>
            <DollarSign className="size-8 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-MX', { month: 'long' }).format(new Date())}
          </p>
        </Card>

        <Card className="p-6 bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Won Deals' : 'Negocios Ganados'}
              </p>
              <p className="text-2xl font-bold">{wonDeals || 0}</p>
            </div>
            <CheckCircle2 className="size-8 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {lang === 'en' ? 'All time' : 'Todos los tiempos'}
          </p>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Deals */}
        <Card className="p-6 bg-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {lang === 'en' ? 'Recent Deals' : 'Negocios Recientes'}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${lang}/dashboard/admin/crm/deals`}>
                {lang === 'en' ? 'View All' : 'Ver Todos'}
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {recentDeals && recentDeals.length > 0 ? (
              recentDeals.map((deal: any) => (
                <div key={deal.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium">{deal.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {deal.contacts?.first_name} {deal.contacts?.last_name}
                      {deal.contacts?.company && ` - ${deal.contacts.company}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {deal.services ? (lang === 'en' ? deal.services.title_en : deal.services.title_es) : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(deal.value)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{deal.stage.replace('_', ' ')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                {lang === 'en' ? 'No deals yet' : 'No hay negocios todavía'}
              </p>
            )}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6 bg-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {lang === 'en' ? 'Recent Activities' : 'Actividades Recientes'}
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${lang}/dashboard/admin/crm/activities`}>
                {lang === 'en' ? 'View All' : 'Ver Todas'}
              </Link>
            </Button>
          </div>
          <div className="space-y-4">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium capitalize">{activity.activity_type}: {activity.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.contacts?.first_name} {activity.contacts?.last_name}
                      {activity.contacts?.company && ` - ${activity.contacts.company}`}
                    </p>
                    {activity.deals && (
                      <p className="text-xs text-muted-foreground">
                        {lang === 'en' ? 'Deal' : 'Negocio'}: {activity.deals.title}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                {lang === 'en' ? 'No activities yet' : 'No hay actividades todavía'}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
