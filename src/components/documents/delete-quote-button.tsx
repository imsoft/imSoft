'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

/** Delete-quote button with confirmation; an icon in the table, with text on the detail page. */
export function DeleteQuoteButton({ id, number, lang, compact = false, redirectTo }: { id: string; number: string; lang: string; compact?: boolean; redirectTo?: string }) {
  const es = lang !== 'en'
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  async function remove() {
    setBusy(true)
    try {
      const r = await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      toast.success(es ? `Cotización ${number} eliminada` : `Quote ${number} deleted`)
      setOpen(false)
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {compact ? (
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" title={es ? 'Eliminar' : 'Delete'} onClick={() => setOpen(true)}><Trash2 className="size-4" /></Button>
      ) : (
        <Button size="sm" variant="ghost" className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setOpen(true)}><Trash2 className="size-4 mr-1" />{es ? 'Eliminar' : 'Delete'}</Button>
      )}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{es ? `¿Eliminar la cotización ${number}?` : `Delete quote ${number}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {es
                ? 'Se borra la cotización y su contrato si lo tiene. El enlace público dejará de funcionar. Esto no se puede deshacer.'
                : 'The quote and its contract (if any) will be deleted and the public link will stop working. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>{es ? 'Cancelar' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction disabled={busy} onClick={(e) => { e.preventDefault(); remove() }} className="bg-destructive text-white hover:bg-destructive/90">
              {busy ? (es ? 'Eliminando…' : 'Deleting…') : es ? 'Sí, eliminar' : 'Yes, delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
