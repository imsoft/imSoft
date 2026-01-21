'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, Mail, Phone, Copy, Check } from 'lucide-react'
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
import type { Contact } from '@/types/database'
import { formatPhoneNumber } from '@/lib/utils/format-phone'
import { useState } from 'react'
import { toast } from 'sonner'

function EmailCell({ email, lang }: { email: string; lang: string }) {
  const [copied, setCopied] = useState(false)

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
    <div className="flex items-center gap-2">
      <Mail className="size-4 text-muted-foreground" />
      <span className="text-sm">{email}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 flex-shrink-0"
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
        className="h-6 w-6 flex-shrink-0"
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
        return <EmailCell email={row.original.email} lang={lang} />
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
        return <span className="text-sm">{row.original.company || '-'}</span>
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
      accessorKey: 'contact_type',
      header: lang === 'en' ? 'Type' : 'Tipo',
      cell: ({ row }) => {
        const type = row.original.contact_type
        return (
          <Badge className={contactTypeColors[type] || ''}>
            {getContactTypeLabel(type)}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        if (!value || value === 'all') return true
        return row.original.contact_type === value
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
      filterFn: (row, id, value) => {
        if (!value || value === 'all') return true
        return row.original.status === value
      },
    },
    {
      accessorKey: 'phone',
      header: lang === 'en' ? 'Contact' : 'Contacto',
      cell: ({ row }) => {
        const contact = row.original
        return contact.phone ? (
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-muted-foreground" />
            <span className="text-sm">{formatPhoneNumber(contact.phone)}</span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">-</span>
        )
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
