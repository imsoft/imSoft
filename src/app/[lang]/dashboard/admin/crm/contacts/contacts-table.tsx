'use client'

import { Contact } from '@/types/database'
import { Card } from '@/components/ui/card'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DataTable } from './data-table'
import { createColumns } from './columns'
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
    <>
      <Card className="p-6 bg-white">
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
