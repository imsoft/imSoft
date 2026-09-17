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

/** Boton de eliminar cotizacion con confirmacion; en la tabla va como icono, en la ficha con texto. */
export function DeleteQuoteButton({ id, folio, lang, compact = false, redirectTo }: { id: string; folio: string; lang: string; compact?: boolean; redirectTo?: string }) {
  const es = lang !== 'en'
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [ocupado, setOcupado] = useState(false)

  async function eliminar() {
    setOcupado(true)
    try {
      const r = await fetch(`/api/quotes/${id}`, { method: 'DELETE' })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      toast.success(es ? `Cotización ${folio} eliminada` : `Quote ${folio} deleted`)
      setAbierto(false)
      if (redirectTo) router.push(redirectTo)
      else router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      {compact ? (
        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" title={es ? 'Eliminar' : 'Delete'} onClick={() => setAbierto(true)}><Trash2 className="size-4" /></Button>
      ) : (
        <Button size="sm" variant="ghost" className="h-9 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setAbierto(true)}><Trash2 className="size-4 mr-1" />{es ? 'Eliminar' : 'Delete'}</Button>
      )}
      <AlertDialog open={abierto} onOpenChange={setAbierto}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{es ? `¿Eliminar la cotización ${folio}?` : `Delete quote ${folio}?`}</AlertDialogTitle>
            <AlertDialogDescription>
              {es
                ? 'Se borra la cotización y su contrato si lo tiene. El enlace público dejará de funcionar. Esto no se puede deshacer.'
                : 'The quote and its contract (if any) will be deleted and the public link will stop working. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={ocupado}>{es ? 'Cancelar' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction disabled={ocupado} onClick={(e) => { e.preventDefault(); eliminar() }} className="bg-destructive text-white hover:bg-destructive/90">
              {ocupado ? (es ? 'Eliminando…' : 'Deleting…') : es ? 'Sí, eliminar' : 'Yes, delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
