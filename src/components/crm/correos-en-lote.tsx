'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Mail, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resumenDeLote, type ResultadoLote } from '@/lib/envio-lote'

interface Props {
  lang: string
  elegidos: Array<{ id: string; nombre: string }>
  limpiar: () => void
}

/**
 * Barra que aparece al marcar contactos en la tabla: prepara el borrador personalizado de
 * cada uno, de uno en uno (la IA escribe el gancho de cada negocio), y lleva a Prospeccion
 * para revisarlos y enviarlos. No envia nada por si sola.
 */
export function CorreosEnLote({ lang, elegidos, limpiar }: Props) {
  const es = lang !== 'en'
  const router = useRouter()
  const [progreso, setProgreso] = useState<{ hechos: number; total: number; actual: string } | null>(null)
  const cancelar = useRef(false)

  if (elegidos.length === 0 && !progreso) return null

  async function preparar() {
    const lista = [...elegidos]
    const r: ResultadoLote = { listos: 0, yaTenian: 0, errores: [] }
    cancelar.current = false
    for (let i = 0; i < lista.length; i++) {
      if (cancelar.current) break
      setProgreso({ hechos: i, total: lista.length, actual: lista[i].nombre })
      try {
        const res = await fetch('/api/outreach/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: lista[i].id }) })
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j.error || res.statusText)
        if (j.existente) r.yaTenian += 1
        else r.listos += 1
      } catch (err) {
        r.errores.push(`${lista[i].nombre}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    setProgreso(null)
    limpiar()
    const hayBorradores = r.listos + r.yaTenian > 0
    const opciones = {
      description: r.errores.length ? r.errores.slice(0, 6).join('\n') + (r.errores.length > 6 ? `\n…y ${r.errores.length - 6} más` : '') : undefined,
      duration: 20_000,
      action: hayBorradores ? { label: es ? 'Revisar y enviar' : 'Review and send', onClick: () => router.push(`/${lang}/dashboard/admin/crm/prospeccion`) } : undefined,
    }
    if (hayBorradores) toast.success(resumenDeLote(r), opciones)
    else toast.error(resumenDeLote(r), opciones)
  }

  return (
    <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3 text-sm" role="status">
      {progreso ? (
        <>
          <span className="font-medium tabular-nums">{es ? `Escribiendo ${progreso.hechos + 1} de ${progreso.total}` : `Writing ${progreso.hechos + 1} of ${progreso.total}`}</span>
          <span className="min-w-0 flex-1 truncate text-muted-foreground">{progreso.actual}</span>
          <Button size="sm" variant="outline" onClick={() => { cancelar.current = true }}>{es ? 'Detener' : 'Stop'}</Button>
        </>
      ) : (
        <>
          <span className="font-medium tabular-nums">{elegidos.length} {es ? (elegidos.length === 1 ? 'contacto elegido' : 'contactos elegidos') : 'selected'}</span>
          <span className="min-w-0 flex-1 text-muted-foreground">{es ? 'Se escribe un correo personalizado para cada uno. Los revisas antes de enviar.' : 'A personalized email is written for each. You review before sending.'}</span>
          <Button size="sm" onClick={preparar}><Mail className="mr-2 h-4 w-4" />{es ? `Preparar ${elegidos.length} ${elegidos.length === 1 ? 'correo' : 'correos'}` : `Prepare ${elegidos.length}`}</Button>
          <Button size="sm" variant="ghost" onClick={limpiar} aria-label={es ? 'Quitar selección' : 'Clear selection'}><X className="h-4 w-4" /></Button>
        </>
      )}
    </div>
  )
}
