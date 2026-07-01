'use client'

import { Contact } from '@/types/database'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'
import { DataTable } from './data-table'
import { createColumns } from './columns'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyAction,
} from '@/components/ui/empty'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ContactsTableProps {
  contacts: Contact[]
  dict: any
  lang: string
}

export function ContactsTable({ contacts, dict, lang }: ContactsTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    setContactToDelete(null)
    const supabase = createClient()

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting contact:', error)
      toast.error(lang === 'en' ? 'Error deleting contact' : 'Error al eliminar contacto')
    } else {
      toast.success(lang === 'en' ? 'Contact deleted' : 'Contacto eliminado')
      router.refresh()
    }

    setIsDeleting(null)
  }

  const columns = createColumns({ lang, onDelete: setContactToDelete, isDeleting })

  if (contacts.length === 0) {
    return (
      <Card>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users className="size-12" />
            </EmptyMedia>
            <EmptyTitle>{dict.dashboard.empty.contacts.title}</EmptyTitle>
            <EmptyDescription>{dict.dashboard.empty.contacts.description}</EmptyDescription>
          </EmptyHeader>
          <EmptyAction>
            <Button asChild>
              <Link href={`/${lang}/dashboard/admin/crm/contacts/new`}>
                <Plus className="mr-1.5 size-4" />
                {lang === 'en' ? 'Create Contact' : 'Crear Contacto'}
              </Link>
            </Button>
          </EmptyAction>
        </Empty>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-6">
        <DataTable columns={columns} data={contacts} lang={lang} />
      </Card>

      <AlertDialog
        open={!!contactToDelete}
        onOpenChange={(open) => !open && setContactToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === 'en' ? 'Delete contact?' : '¿Eliminar contacto?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === 'en'
                ? 'This action cannot be undone. The contact will be permanently deleted.'
                : 'Esta acción no se puede deshacer. El contacto se eliminará de forma permanente.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {lang === 'en' ? 'Cancel' : 'Cancelar'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => contactToDelete && handleDelete(contactToDelete)}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {lang === 'en' ? 'Delete' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
