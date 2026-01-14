import { hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, DollarSign, Calendar, TrendingUp, User, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { SendEmailButton } from './send-email-button'

export default async function DealDetailPage({ params }: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params

  if (!hasLocale(lang)) notFound()

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Verificar que el usuario sea admin
  if (user.user_metadata?.role !== 'admin') {
    redirect(`/${lang}/dashboard/client`)
  }

  // Obtener el deal con sus relaciones
  const { data: deal, error } = await supabase
    .from('deals')
    .select(`
      *,
      contacts (
        id,
        first_name,
        last_name,
        email,
        company,
        phone
      ),
      services (
        id,
        title_en,
        title_es
      ),
      quotations:quotation_id (
        id,
        title,
        client_name,
        client_company,
        total,
        final_price,
        status,
        created_at
      )
    `)
    .eq('id', id)
    .single()

  // Obtener cotizaciones asociadas a este deal
  const { data: associatedQuotations } = await supabase
    .from('quotations')
    .select(`
      id,
      title,
      client_name,
      client_company,
      total,
      status,
      created_at
    `)
    .eq('deal_id', id)
    .order('created_at', { ascending: false })

  if (error || !deal) {
    console.error('Deal fetch error:', error)
    console.error('Deal ID:', id)
    console.error('Deal data:', deal)
    notFound()
  }

  const getStageLabel = (stage: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      no_contact: { en: 'No Contact', es: 'Sin Contacto' },
      qualification: { en: 'Prospecting', es: 'Prospección' },
      proposal: { en: 'Proposal', es: 'Propuesta' },
      negotiation: { en: 'Negotiation', es: 'Negociación' },
      closed_won: { en: 'Closed Won', es: 'Ganado' },
      closed_lost: { en: 'Closed Lost', es: 'Perdido' },
    }
    return lang === 'en' ? labels[stage]?.en || stage : labels[stage]?.es || stage
  }

  const stageColors: Record<string, string> = {
    no_contact: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    qualification: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    proposal: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    negotiation: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
    closed_won: 'bg-green-500/10 text-green-700 dark:text-green-400',
    closed_lost: 'bg-red-500/10 text-red-700 dark:text-red-400',
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${lang}/dashboard/admin/crm/deals`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{deal.title}</h1>
            <p className="text-muted-foreground">
              {lang === 'en' ? 'Deal Details' : 'Detalles del Negocio'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <SendEmailButton dealId={id} dealStage={deal.stage} lang={lang} />
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/crm/deals/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {lang === 'en' ? 'Edit' : 'Editar'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {lang === 'en' ? 'Deal Value' : 'Valor'}
              </p>
              <p className="text-2xl font-bold">{formatCurrency(deal.value)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {lang === 'en' ? 'Probability' : 'Probabilidad'}
              </p>
              <p className="text-2xl font-bold">
                {deal.probability !== null && deal.probability !== undefined
                  ? `${deal.probability}%`
                  : '-'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {lang === 'en' ? 'Expected Close' : 'Cierre Esperado'}
              </p>
              <p className="text-lg font-bold">{formatDate(deal.expected_close_date)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Deal Information */}
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4">
          {lang === 'en' ? 'Deal Information' : 'Información del Negocio'}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {lang === 'en' ? 'Deal Name' : 'Nombre del Negocio'}
            </p>
            <p className="font-medium">{deal.title}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {lang === 'en' ? 'Stage' : 'Etapa'}
            </p>
            <Badge className={stageColors[deal.stage]}>
              {getStageLabel(deal.stage)}
            </Badge>
          </div>

          {deal.description && (
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">
                {lang === 'en' ? 'Description' : 'Descripción'}
              </p>
              <p className="text-muted-foreground whitespace-pre-wrap">{deal.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Contact Information */}
      {deal.contacts && (
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            <User className="inline-block mr-2 h-5 w-5" />
            {lang === 'en' ? 'Contact Information' : 'Información de Contacto'}
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {lang === 'en' ? 'Name' : 'Nombre'}
              </p>
              <p className="font-medium">
                <Link
                  href={`/${lang}/dashboard/admin/crm/contacts/${deal.contacts.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {deal.contacts.first_name} {deal.contacts.last_name}
                </Link>
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {lang === 'en' ? 'Email' : 'Correo'}
              </p>
              <a href={`mailto:${deal.contacts.email}`} className="hover:underline">
                {deal.contacts.email}
              </a>
            </div>
            {deal.contacts.company && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {lang === 'en' ? 'Company' : 'Empresa'}
                </p>
                <p className="font-medium">{deal.contacts.company}</p>
              </div>
            )}
            {deal.contacts.phone && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  {lang === 'en' ? 'Phone' : 'Teléfono'}
                </p>
                <a href={`tel:${deal.contacts.phone}`} className="hover:underline">
                  {deal.contacts.phone}
                </a>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Service Information */}
      {deal.services && (
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            <Briefcase className="inline-block mr-2 h-5 w-5" />
            {lang === 'en' ? 'Service' : 'Servicio'}
          </h2>
          <p className="font-medium">
            {lang === 'en' ? deal.services.title_en : deal.services.title_es}
          </p>
        </Card>
      )}

      {/* Linked Quotation */}
      {deal.quotations && (
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Linked Quotation' : 'Cotización Vinculada'}
          </h2>
          <Link
            href={`/${lang}/dashboard/admin/quotations/${deal.quotations.id}`}
            className="block p-4 border-2 border-primary/20 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{deal.quotations.title || deal.quotations.client_name}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {deal.quotations.client_company || deal.quotations.client_name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(deal.quotations.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">
                  {new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                  }).format(deal.quotations.final_price || deal.quotations.total)}
                </p>
                <Badge
                  variant="outline"
                  className={
                    deal.quotations.status === 'approved'
                      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                      : deal.quotations.status === 'rejected'
                      ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                      : deal.quotations.status === 'converted'
                      ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                      : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                  }
                >
                  {deal.quotations.status === 'pending'
                    ? lang === 'en'
                      ? 'Pending'
                      : 'Pendiente'
                    : deal.quotations.status === 'approved'
                    ? lang === 'en'
                      ? 'Approved'
                      : 'Aprobada'
                    : deal.quotations.status === 'rejected'
                    ? lang === 'en'
                      ? 'Rejected'
                      : 'Rechazada'
                    : lang === 'en'
                    ? 'Converted'
                    : 'Convertida'}
                </Badge>
              </div>
            </div>
          </Link>
        </Card>
      )}

      {/* Associated Quotations */}
      {associatedQuotations && associatedQuotations.length > 0 && (
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Associated Quotations' : 'Cotizaciones Asociadas'}
          </h2>
          <div className="space-y-3">
            {associatedQuotations.map((quotation: any) => (
              <Link
                key={quotation.id}
                href={`/${lang}/dashboard/admin/quotations/${quotation.id}`}
                className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{quotation.title || quotation.client_name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {quotation.client_company || quotation.client_name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(quotation.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: 'MXN',
                      }).format(quotation.total)}
                    </p>
                    <Badge
                      variant="outline"
                      className={
                        quotation.status === 'approved'
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                          : quotation.status === 'rejected'
                          ? 'bg-red-500/10 text-red-700 dark:text-red-400'
                          : quotation.status === 'converted'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
                          : 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
                      }
                    >
                      {quotation.status === 'pending'
                        ? lang === 'en'
                          ? 'Pending'
                          : 'Pendiente'
                        : quotation.status === 'approved'
                        ? lang === 'en'
                          ? 'Approved'
                          : 'Aprobada'
                        : quotation.status === 'rejected'
                        ? lang === 'en'
                          ? 'Rejected'
                          : 'Rechazada'
                        : lang === 'en'
                        ? 'Converted'
                        : 'Convertida'}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Metadata */}
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4">
          {lang === 'en' ? 'Metadata' : 'Metadatos'}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">
              {lang === 'en' ? 'Created At' : 'Creado'}
            </p>
            <p className="font-medium">
              {new Date(deal.created_at).toLocaleString(lang === 'en' ? 'en-US' : 'es-MX')}
            </p>
          </div>
          {deal.updated_at && (
            <div>
              <p className="text-muted-foreground mb-1">
                {lang === 'en' ? 'Last Updated' : 'Última Actualización'}
              </p>
              <p className="font-medium">
                {new Date(deal.updated_at).toLocaleString(lang === 'en' ? 'en-US' : 'es-MX')}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
