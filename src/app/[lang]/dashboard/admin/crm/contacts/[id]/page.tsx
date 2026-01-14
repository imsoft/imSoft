import { hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { formatPhoneNumber } from '@/lib/utils/format-phone'

export default async function ContactDetailPage({ params }: {
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

  // Obtener el contacto
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !contact) {
    notFound()
  }

  const getContactTypeLabel = (type: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      lead: { en: 'Lead', es: 'Lead' },
      prospect: { en: 'Prospect', es: 'Prospecto' },
      customer: { en: 'Customer', es: 'Cliente' },
      partner: { en: 'Partner', es: 'Socio' },
    }
    return lang === 'en' ? labels[type]?.en || type : labels[type]?.es || type
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      active: { en: 'Active', es: 'Activo' },
      inactive: { en: 'Inactive', es: 'Inactivo' },
      lost: { en: 'Lost', es: 'Perdido' },
    }
    return lang === 'en' ? labels[status]?.en || status : labels[status]?.es || status
  }

  const contactTypeColors: Record<string, string> = {
    lead: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    prospect: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    customer: 'bg-green-500/10 text-green-700 dark:text-green-400',
    partner: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-700 dark:text-green-400',
    inactive: 'bg-white text-gray-700 dark:text-gray-400',
    lost: 'bg-red-500/10 text-red-700 dark:text-red-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${lang}/dashboard/admin/crm/contacts`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {contact.first_name} {contact.last_name}
            </h1>
            <p className="text-muted-foreground">
              {lang === 'en' ? 'Contact Details' : 'Detalles del Contacto'}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/crm/contacts/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            {lang === 'en' ? 'Edit' : 'Editar'}
          </Link>
        </Button>
      </div>

      {/* Basic Information */}
      <Card className="p-6 bg-white">
        <h2 className="text-lg font-semibold mb-4">
          {lang === 'en' ? 'Basic Information' : 'Información Básica'}
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {lang === 'en' ? 'Full Name' : 'Nombre Completo'}
            </p>
            <p className="font-medium">
              {contact.first_name} {contact.last_name}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {lang === 'en' ? 'Email' : 'Correo'}
            </p>
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-muted-foreground" />
              <a href={`mailto:${contact.email}`} className="hover:underline">
                {contact.email}
              </a>
            </div>
          </div>

          {contact.phone && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {lang === 'en' ? 'Phone' : 'Teléfono'}
              </p>
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="hover:underline">
                  {formatPhoneNumber(contact.phone)}
                </a>
              </div>
            </div>
          )}

          {contact.company && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {lang === 'en' ? 'Company' : 'Empresa'}
              </p>
              <div className="flex items-center gap-2">
                <Briefcase className="size-4 text-muted-foreground" />
                <p className="font-medium">{contact.company}</p>
              </div>
            </div>
          )}

          {contact.job_title && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {lang === 'en' ? 'Job Title' : 'Puesto'}
              </p>
              <p className="font-medium">{contact.job_title}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {lang === 'en' ? 'Contact Type' : 'Tipo de Contacto'}
            </p>
            <Badge className={contactTypeColors[contact.contact_type]}>
              {getContactTypeLabel(contact.contact_type)}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">
              {lang === 'en' ? 'Status' : 'Estado'}
            </p>
            <Badge className={statusColors[contact.status]}>
              {getStatusLabel(contact.status)}
            </Badge>
          </div>

          {contact.source && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {lang === 'en' ? 'Source' : 'Fuente'}
              </p>
              <p className="font-medium">{contact.source}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Address */}
      {(contact.address_street || contact.address_city || contact.address_state || contact.address_country || contact.address_postal_code) && (
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            <MapPin className="inline-block mr-2 h-5 w-5" />
            {lang === 'en' ? 'Address' : 'Dirección'}
          </h2>
          <div className="space-y-2">
            {contact.address_street && <p>{contact.address_street}</p>}
            <p>
              {[contact.address_city, contact.address_state, contact.address_postal_code]
                .filter(Boolean)
                .join(', ')}
            </p>
            {contact.address_country && <p>{contact.address_country}</p>}
          </div>
        </Card>
      )}

      {/* Links */}
      {(contact.linkedin_url || contact.website_url) && (
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Links' : 'Enlaces'}
          </h2>
          <div className="flex flex-col gap-3">
            {contact.linkedin_url && (
              <a
                href={contact.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <ExternalLink className="size-4" />
                LinkedIn
              </a>
            )}
            {contact.website_url && (
              <a
                href={contact.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <ExternalLink className="size-4" />
                {lang === 'en' ? 'Website' : 'Sitio Web'}
              </a>
            )}
          </div>
        </Card>
      )}

      {/* Notes */}
      {contact.notes && (
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Notes' : 'Notas'}
          </h2>
          <p className="whitespace-pre-wrap text-muted-foreground">{contact.notes}</p>
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
              {new Date(contact.created_at).toLocaleString(lang === 'en' ? 'en-US' : 'es-MX')}
            </p>
          </div>
          {contact.updated_at && (
            <div>
              <p className="text-muted-foreground mb-1">
                {lang === 'en' ? 'Last Updated' : 'Última Actualización'}
              </p>
              <p className="font-medium">
                {new Date(contact.updated_at).toLocaleString(lang === 'en' ? 'en-US' : 'es-MX')}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
