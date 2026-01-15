'use client'

import { Contact } from '@/types/database'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DataTable } from './data-table'
import { createColumns } from './columns'

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

  const columns = createColumns({ lang, onDelete: handleDelete, isDeleting })

  if (contacts.length === 0) {
    return (
      <Card className="p-12 bg-white">
        <div className="text-center">
          <p className="text-muted-foreground">
            {lang === 'en' ? 'No contacts yet. Create your first contact!' : '¡No hay contactos todavía. Crea tu primer contacto!'}
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white">
      <DataTable columns={columns} data={contacts} lang={lang} />
    </Card>
  )
}
