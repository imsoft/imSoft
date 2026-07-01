import { hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, ExternalLink, Globe, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'
import { formatPhoneNumber } from '@/lib/utils/format-phone'
import { SocialLink } from '@/types/database'

// Local SVG brand icons to avoid compilation issues due to lucide-react versions
const Instagram = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const Linkedin = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const Facebook = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const Youtube = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
)

const Twitter = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

const Tiktok = (props: React.HTMLAttributes<SVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

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
      no_contact: { en: 'No Contact', es: 'Sin Contacto' },
      qualification: { en: 'Prospecting', es: 'Prospección' },
      negotiation: { en: 'Negotiation', es: 'Negociación' },
      closed_won: { en: 'Won', es: 'Ganado' },
      closed_lost: { en: 'Lost', es: 'Perdido' },
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
    no_contact: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    qualification: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    negotiation: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    closed_won: 'bg-green-500/10 text-green-700 dark:text-green-400',
    closed_lost: 'bg-red-500/10 text-red-700 dark:text-red-400',
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
        <div className="flex gap-2">
          {contact.email && contact.status !== 'no_contact' && (
            <Button variant="outline" asChild>
              <Link href={`/${lang}/dashboard/admin/crm/contacts/${id}/send-email`}>
                <Mail className="mr-2 h-4 w-4" />
                {lang === 'en' ? 'Send Email' : 'Enviar Email'}
              </Link>
            </Button>
          )}
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/crm/contacts/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              {lang === 'en' ? 'Edit' : 'Editar'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card className="p-6">
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

          {(contact.phone || (Array.isArray(contact.additional_phones) && contact.additional_phones.length > 0)) && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {lang === 'en' ? 'Phones' : 'Teléfonos'}
              </p>
              <div className="space-y-1.5">
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <a href={`tel:${contact.phone}`} className="hover:underline font-medium text-foreground">
                      {formatPhoneNumber(contact.phone)}
                    </a>
                  </div>
                )}
                {Array.isArray(contact.additional_phones) && contact.additional_phones.map((phone: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground opacity-60" />
                    <a href={`tel:${phone}`} className="hover:underline font-medium text-foreground">
                      {formatPhoneNumber(phone)}
                    </a>
                  </div>
                ))}
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
        <Card className="p-6">
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

      {/* Links & Socials */}
      {(() => {
        const getSocialLinkUrl = (link: SocialLink) => {
          const url = link.url
          if (url.startsWith('http://') || url.startsWith('https://')) return url

          switch (link.platform) {
            case 'instagram':
              return `https://instagram.com/${url}`
            case 'tiktok':
              return `https://tiktok.com/@${url}`
            case 'linkedin':
              return `https://linkedin.com/in/${url}`
            case 'facebook':
              return `https://facebook.com/${url}`
            case 'twitter':
              return `https://x.com/${url}`
            case 'youtube':
              return `https://youtube.com/@${url}`
            case 'whatsapp':
              return `https://wa.me/${url}`
            case 'website':
            default:
              return `https://${url}`
          }
        }

        const getPlatformIcon = (platform: SocialLink['platform']) => {
          switch (platform) {
            case 'instagram': return Instagram
            case 'linkedin': return Linkedin
            case 'facebook': return Facebook
            case 'youtube': return Youtube
            case 'twitter': return Twitter
            case 'tiktok': return Tiktok
            case 'whatsapp': return Phone
            case 'website': return Globe
            default: return LinkIcon
          }
        }

        const getPlatformLabel = (platform: SocialLink['platform']) => {
          const labels: Record<string, string> = {
            instagram: 'Instagram',
            tiktok: 'TikTok',
            facebook: 'Facebook',
            linkedin: 'LinkedIn',
            twitter: 'X (Twitter)',
            youtube: 'YouTube',
            whatsapp: 'WhatsApp',
            website: lang === 'en' ? 'Website' : 'Sitio Web',
          }
          return labels[platform] || platform
        }

        const allSocials: SocialLink[] = []

        if (Array.isArray(contact.social_links)) {
          allSocials.push(...contact.social_links)
        }

        const hasPlatform = (platform: SocialLink['platform']) => allSocials.some(s => s.platform === platform)

        if (contact.instagram_url && !hasPlatform('instagram')) {
          allSocials.push({ platform: 'instagram', url: contact.instagram_url })
        }
        if (contact.linkedin_url && !hasPlatform('linkedin')) {
          allSocials.push({ platform: 'linkedin', url: contact.linkedin_url })
        }
        if (contact.website_url && !hasPlatform('website')) {
          allSocials.push({ platform: 'website', url: contact.website_url })
        }

        if (allSocials.length === 0) return null

        return (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {lang === 'en' ? 'Links & Social Media' : 'Enlaces y Redes Sociales'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allSocials.map((link, idx) => {
                const PlatformIcon = getPlatformIcon(link.platform)
                const url = getSocialLinkUrl(link)
                const label = getPlatformLabel(link.platform)
                const displayVal = link.platform === 'instagram' || link.platform === 'tiktok' || link.platform === 'twitter'
                  ? `@${link.url.replace(/^@+/, '')}`
                  : link.url

                return (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/50 hover:shadow-sm transition-all group"
                  >
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <PlatformIcon className="size-4 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-medium text-foreground truncate flex items-center gap-1 group-hover:text-primary transition-colors">
                        {displayVal}
                        <ExternalLink className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                    </div>
                  </a>
                )
              })}
            </div>
          </Card>
        )
      })()}

      {/* Notes */}
      {contact.notes && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Notes' : 'Notas'}
          </h2>
          <p className="whitespace-pre-wrap text-foreground">{contact.notes}</p>
        </Card>
      )}

      {/* Metadata */}
      <Card className="p-6">
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
