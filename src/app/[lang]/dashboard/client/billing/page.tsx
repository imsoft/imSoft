import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Receipt, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import type { ProjectPayment } from '@/types/database'

interface PaymentWithProject extends ProjectPayment {
  project_title: string
  project_currency: string
}

export default async function ClientBillingPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const isEs = lang === 'es'

  // Obtener la empresa del usuario
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  // Obtener proyectos de la empresa con sus pagos
  let payments: PaymentWithProject[] = []
  let totalInvoiced = 0

  if (company?.id) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title_es, title_en, title, total_price, currency')
      .eq('company_id', company.id)

    if (projects && projects.length > 0) {
      totalInvoiced = projects.reduce((sum, p) => sum + (p.total_price || 0), 0)

      const projectIds = projects.map((p) => p.id)
      const { data: rawPayments } = await supabase
        .from('project_payments')
        .select('*')
        .in('project_id', projectIds)
        .order('payment_date', { ascending: false })

      payments = (rawPayments || []).map((pmt) => {
        const proj = projects.find((p) => p.id === pmt.project_id)
        return {
          ...pmt,
          project_title: isEs
            ? (proj?.title_es || proj?.title || '')
            : (proj?.title_en || proj?.title || ''),
          project_currency: proj?.currency || pmt.currency || 'MXN',
        }
      })
    }
  }

  const completedPayments = payments.filter((p) => p.status === 'completed')
  const pendingPayments = payments.filter((p) => p.status === 'pending')
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)

  const formatCurrency = (amount: number, currency = 'MXN') =>
    new Intl.NumberFormat(isEs ? 'es-MX' : 'en-US', {
      style: 'currency',
      currency,
    }).format(amount)

  const statusConfig: Record<string, { label: string; className: string }> = {
    completed: {
      label: isEs ? 'Pagado' : 'Paid',
      className: 'bg-green-500/10 text-green-600 border-green-500/20',
    },
    pending: {
      label: isEs ? 'Pendiente' : 'Pending',
      className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    },
    cancelled: {
      label: isEs ? 'Cancelado' : 'Cancelled',
      className: 'bg-red-500/10 text-red-600 border-red-500/20',
    },
  }

  const methodLabels: Record<string, string> = {
    cash: isEs ? 'Efectivo' : 'Cash',
    transfer: isEs ? 'Transferencia' : 'Transfer',
    card: isEs ? 'Tarjeta' : 'Card',
    check: isEs ? 'Cheque' : 'Check',
    stripe: 'Stripe',
    other: isEs ? 'Otro' : 'Other',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.client.nav.billing}</h1>
        <p className="text-muted-foreground mt-1">
          {isEs
            ? 'Historial y estado de pagos de todos tus proyectos.'
            : 'Payment history and status for all your projects.'}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isEs ? 'Total facturado' : 'Total invoiced'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isEs ? 'Total pagado' : 'Total paid'}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalPaid)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {isEs ? 'Pendiente' : 'Pending'}
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {formatCurrency(totalPending)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payments list */}
      {payments.length === 0 ? (
        <Card className="p-14 text-center">
          <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {dict.dashboard.empty.billing?.title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {dict.dashboard.empty.billing?.description}
          </p>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isEs ? 'Historial de pagos' : 'Payment history'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium">{isEs ? 'Proyecto' : 'Project'}</th>
                    <th className="px-5 py-3 text-left font-medium">{isEs ? 'Monto' : 'Amount'}</th>
                    <th className="px-5 py-3 text-left font-medium">{isEs ? 'Método' : 'Method'}</th>
                    <th className="px-5 py-3 text-left font-medium">{isEs ? 'Fecha' : 'Date'}</th>
                    <th className="px-5 py-3 text-left font-medium">{isEs ? 'Estado' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((pmt) => {
                    const cfg = statusConfig[pmt.status] ?? statusConfig.pending
                    return (
                      <tr key={pmt.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4 font-medium">{pmt.project_title}</td>
                        <td className="px-5 py-4 font-semibold">
                          {formatCurrency(pmt.amount, pmt.project_currency)}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {methodLabels[pmt.payment_method || ''] || pmt.payment_method || '—'}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {pmt.payment_date
                            ? new Date(pmt.payment_date).toLocaleDateString(
                                isEs ? 'es-MX' : 'en-US',
                                { year: 'numeric', month: 'short', day: 'numeric' }
                              )
                            : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <Badge variant="outline" className={cfg.className}>
                            {cfg.label}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
