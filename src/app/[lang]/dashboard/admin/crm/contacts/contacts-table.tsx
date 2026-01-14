'use client'

import { Contact } from '@/types/database'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Edit, Trash2, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { formatPhoneNumber } from '@/lib/utils/format-phone'

interface ContactsTableProps {
  contacts: Contact[]
  dict: any
  lang: string
}

export function ContactsTable({ contacts, dict, lang }: ContactsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this contact?' : '¿Estás seguro de que quieres eliminar este contacto?')) {
      return
    }

    setIsDeleting(id)
    const supabase = createClient()

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting contact:', error)
      alert(lang === 'en' ? 'Error deleting contact' : 'Error al eliminar contacto')
    } else {
      router.refresh()
    }

    setIsDeleting(null)
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

  if (contacts.length === 0) {
    return (
      <Card className="p-12 bg-card">
        <div className="text-center">
          <p className="text-muted-foreground">
            {lang === 'en' ? 'No contacts yet. Create your first contact!' : '¡No hay contactos todavía. Crea tu primer contacto!'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Name' : 'Nombre'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Email' : 'Correo'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Company' : 'Empresa'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Type' : 'Tipo'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Status' : 'Estado'}
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium">
                {lang === 'en' ? 'Contact' : 'Contacto'}
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium">
                {lang === 'en' ? 'Actions' : 'Acciones'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">
                      {contact.first_name} {contact.last_name}
                    </p>
                    {contact.job_title && (
                      <p className="text-sm text-muted-foreground">{contact.job_title}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-muted-foreground" />
                    <span className="text-sm">{contact.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm">{contact.company || '-'}</span>
                </td>
                <td className="px-6 py-4">
                  <Badge className={contactTypeColors[contact.contact_type]}>
                    {getContactTypeLabel(contact.contact_type)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge className={statusColors[contact.status]}>
                    {getStatusLabel(contact.status)}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {contact.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone className="size-4 text-muted-foreground" />
                      <span className="text-sm">{formatPhoneNumber(contact.phone)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/${lang}/dashboard/admin/crm/contacts/${contact.id}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/${lang}/dashboard/admin/crm/contacts/${contact.id}/edit`}>
                        <Edit className="size-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(contact.id)}
                      disabled={isDeleting === contact.id}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
