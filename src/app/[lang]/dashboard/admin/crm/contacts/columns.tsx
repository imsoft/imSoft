'use client'

import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Eye, Edit, Trash2, Mail, Phone } from 'lucide-react'
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
        const contact = row.original
        return (
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-muted-foreground" />
            <span className="text-sm">{contact.email}</span>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        const email = row.original.email?.toLowerCase() || ''
        const name = `${row.original.first_name || ''} ${row.original.last_name || ''}`.trim().toLowerCase()
        const company = row.original.company?.toLowerCase() || ''
        const searchValue = (value as string)?.toLowerCase() || ''
        return email.includes(searchValue) || name.includes(searchValue) || company.includes(searchValue)
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
