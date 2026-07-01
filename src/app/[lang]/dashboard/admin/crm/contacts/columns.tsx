'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, Mail, Copy, Check, Globe, Phone, Link as LinkIcon, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'
import type { Contact, SocialLink } from '@/types/database'
import { useState } from 'react'
import { toast } from 'sonner'

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

function EmailCell({
  email,
  invalidEmails,
  lang,
}: {
  email: string
  invalidEmails?: string[]
  lang: string
}) {
  const [copied, setCopied] = useState(false)
  const isInvalid = Array.isArray(invalidEmails) && invalidEmails.some(
    (e) => e.toLowerCase() === email.toLowerCase()
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      toast.success(lang === 'en' ? 'Email copied to clipboard' : 'Correo copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error(lang === 'en' ? 'Failed to copy' : 'Error al copiar')
    }
  }

  return (
    <div className="flex min-w-0 max-w-[min(20rem,50vw)] items-center gap-2">
      {isInvalid ? (
        <span title={lang === 'en' ? 'Email no longer exists / Bounced' : 'El correo no existe / Rebotado'}>
          <AlertTriangle className="size-4 shrink-0 text-red-500 animate-pulse" />
        </span>
      ) : (
        <Mail className="size-4 shrink-0 text-muted-foreground" />
      )}
      <span
        className={`min-w-0 truncate text-sm ${
          isInvalid ? 'text-red-500 line-through opacity-70' : 'text-foreground'
        }`}
        title={
          email +
          (isInvalid
            ? ` (${lang === 'en' ? 'No longer exists / Bounced' : 'No existe / Rebotado'})`
            : '')
        }
      >
        {email}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={handleCopy}
        title={lang === 'en' ? 'Copy email' : 'Copiar correo'}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}

function SocialsCell({ socials, instagram, lang }: { socials: SocialLink[] | null | undefined; instagram: string | null | undefined; lang: string }) {
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

  if (Array.isArray(socials)) {
    allSocials.push(...socials)
  }

  const hasPlatform = (platform: SocialLink['platform']) => allSocials.some(s => s.platform === platform)

  if (instagram && !hasPlatform('instagram')) {
    allSocials.push({ platform: 'instagram', url: instagram })
  }

  if (allSocials.length === 0) {
    return <span className="text-sm text-muted-foreground">-</span>
  }

  return (
    <div className="flex items-center gap-1.5">
      {allSocials.map((link, idx) => {
        const PlatformIcon = getPlatformIcon(link.platform)
        const url = getSocialLinkUrl(link)
        const label = getPlatformLabel(link.platform)

        return (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${label}: ${link.url}`}
            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border"
          >
            <PlatformIcon className="size-4 shrink-0" />
          </a>
        )
      })}
    </div>
  )
}

function DescriptionCell({ description, lang }: { description: string | null | undefined; lang: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!description) return

    try {
      await navigator.clipboard.writeText(description)
      setCopied(true)
      toast.success(lang === 'en' ? 'Description copied to clipboard' : 'Descripción copiada al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error(lang === 'en' ? 'Failed to copy' : 'Error al copiar')
    }
  }

  if (!description) {
    return <span className="text-sm text-muted-foreground">-</span>
  }

  // Truncar a 100 caracteres
  const maxLength = 100
  const truncated = description.length > maxLength
    ? description.substring(0, maxLength) + '...'
    : description

  return (
    <div className="flex items-center gap-2 max-w-[300px]">
      <span className="text-sm truncate" title={description}>
        {truncated}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0"
        onClick={handleCopy}
        title={lang === 'en' ? 'Copy description' : 'Copiar descripción'}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  )
}

interface ColumnsProps {
  lang: string
  onDelete: (id: string) => void
  isDeleting?: string | null
}

export function createColumns({ lang, onDelete, isDeleting }: ColumnsProps): ColumnDef<Contact>[] {
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

  const statusColors: Record<string, string> = {
    no_contact: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    qualification: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    negotiation: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
    closed_won: 'bg-green-500/10 text-green-700 dark:text-green-400',
    closed_lost: 'bg-red-500/10 text-red-700 dark:text-red-400',
  }

  return [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3 h-8"
          >
            {lang === 'en' ? 'Name' : 'Nombre'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const contact = row.original
        const name = contact.first_name || contact.last_name
          ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
          : null

        return (
          <div>
            {name ? (
              <p className="font-medium">{name}</p>
            ) : (
              <p className="font-medium text-muted-foreground italic">
                {lang === 'en' ? 'No name' : 'Sin nombre'}
              </p>
            )}
            {contact.job_title && (
              <p className="text-sm text-muted-foreground">{contact.job_title}</p>
            )}
          </div>
        )
      },
      sortingFn: (rowA, rowB) => {
        const nameA = `${rowA.original.first_name || ''} ${rowA.original.last_name || ''}`.trim()
        const nameB = `${rowB.original.first_name || ''} ${rowB.original.last_name || ''}`.trim()
        return nameA.localeCompare(nameB)
      },
      filterFn: (row, id, value) => {
        if (!value) return true
        const name = `${row.original.first_name || ''} ${row.original.last_name || ''}`.trim().toLowerCase()
        return name.includes((value as string).toLowerCase())
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3 h-8"
          >
            {lang === 'en' ? 'Email' : 'Correo'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return (
          <EmailCell
            email={row.original.email}
            invalidEmails={row.original.invalid_emails}
            lang={lang}
          />
        )
      },
      filterFn: (row, _id, value) => {
        if (!value) return true
        const email = row.original.email?.toLowerCase() || ''
        return email.includes((value as string).toLowerCase())
      },
    },
    {
      accessorKey: 'company',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-3 h-8"
          >
            {lang === 'en' ? 'Company' : 'Empresa'}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const company = row.original.company || '-'
        return (
          <span className="block max-w-[min(14rem,35vw)] truncate text-sm" title={company !== '-' ? company : undefined}>
            {company}
          </span>
        )
      },
      filterFn: (row, id, value) => {
        if (!value) return true
        const company = row.original.company?.toLowerCase() || ''
        return company.includes((value as string).toLowerCase())
      },
    },
    {
      accessorKey: 'notes',
      header: lang === 'en' ? 'Company Description' : 'Descripción de Empresa',
      cell: ({ row }) => {
        return <DescriptionCell description={row.original.notes} lang={lang} />
      },
    },
    {
      id: 'socials',
      header: lang === 'en' ? 'Social Media' : 'Redes Sociales',
      cell: ({ row }) => {
        return (
          <SocialsCell
            socials={row.original.social_links}
            instagram={row.original.instagram_url}
            lang={lang}
          />
        )
      },
    },
    {
      accessorKey: 'status',
      header: lang === 'en' ? 'Status' : 'Estado',
      cell: ({ row }) => {
        const status = row.original.status
        return (
          <Badge className={statusColors[status] || ''}>
            {getStatusLabel(status)}
          </Badge>
        )
      },
      filterFn: (row, _id, value) => {
        if (!value || value === 'all') return true
        return row.original.status === value
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const contact = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">{lang === 'en' ? 'Open menu' : 'Abrir menú'}</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{lang === 'en' ? 'Actions' : 'Acciones'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/dashboard/admin/crm/contacts/${contact.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  {lang === 'en' ? 'View' : 'Ver'}
                </Link>
              </DropdownMenuItem>
              {contact.email && contact.status !== 'no_contact' && (
                <DropdownMenuItem asChild>
                  <Link href={`/${lang}/dashboard/admin/crm/contacts/${contact.id}/send-email`}>
                    <Mail className="mr-2 h-4 w-4" />
                    {lang === 'en' ? 'Send Email' : 'Enviar Correo'}
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href={`/${lang}/dashboard/admin/crm/contacts/${contact.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  {lang === 'en' ? 'Edit' : 'Editar'}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(contact.id)}
                disabled={isDeleting === contact.id}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {lang === 'en' ? 'Delete' : 'Eliminar'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
