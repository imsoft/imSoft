'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Mail, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { avisoDeCupo, resumenDeLote, type CupoDeHoy, type ResultadoLote } from '@/lib/envio-lote'

interface Props {
  lang: string
  elegidos: Array<{ id: string; nombre: string }>
  limpiar: () => void
  /** Tope diario de correos y cuanto queda hoy. */
  cupo?: CupoDeHoy
}

/**
 * Barra que aparece al marcar contactos en la tabla: prepara el borrador personalizado de
 * cada uno, de uno en uno (la IA escribe el gancho de cada negocio), y lleva a Prospeccion
 * para revisarlos y enviarlos. No envia nada por si sola.
 */
export function CorreosEnLote({ lang, elegidos, limpiar, cupo }: Props) {
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
    router.refresh()
  }

  if (progreso) {
    // El que se esta escribiendo cuenta como medio paso: la barra avanza desde el primero.
    const pct = Math.round(((progreso.hechos + 0.5) / progreso.total) * 100)
    return (
      <div className="mb-3 overflow-hidden rounded-lg border border-primary/30 bg-primary/5" role="status" aria-live="polite">
        <div className="flex flex-wrap items-center gap-3 p-3 text-sm">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium tabular-nums">
              {es ? `Escribiendo ${progreso.hechos + 1} de ${progreso.total}` : `Writing ${progreso.hechos + 1} of ${progreso.total}`}
              <span className="ml-0.5 inline-flex w-5 justify-start" aria-hidden>
                <span className="animate-bounce [animation-delay:0ms]">.</span>
                <span className="animate-bounce [animation-delay:150ms]">.</span>
                <span className="animate-bounce [animation-delay:300ms]">.</span>
              </span>
            </p>
            <p className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-primary" aria-hidden />
              <span className="truncate">{es ? `La IA está escribiendo el correo de ${progreso.actual}` : `AI is writing the email for ${progreso.actual}`}</span>
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums text-primary">{pct}%</span>
          <Button size="sm" variant="outline" onClick={() => { cancelar.current = true }}>{es ? 'Detener' : 'Stop'}</Button>
        </div>
        <div className="h-1.5 w-full bg-primary/15" role="progressbar" aria-valuemin={0} aria-valuemax={progreso.total} aria-valuenow={progreso.hechos}>
          <div className="relative h-full overflow-hidden rounded-r-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }}>
            <div className="absolute inset-0 animate-pulse bg-white/40" />
          </div>
        </div>
      </div>
    )
  }

  const aviso = cupo ? avisoDeCupo(elegidos.length, cupo) : null
  return (
    <div className="mb-3 rounded-lg border bg-muted/40 p-3 text-sm" role="status">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium tabular-nums">{elegidos.length} {es ? (elegidos.length === 1 ? 'contacto elegido' : 'contactos elegidos') : 'selected'}</span>
        <span className="min-w-0 flex-1 text-muted-foreground">{es ? 'Se escribe un correo personalizado para cada uno. Los revisas antes de enviar.' : 'A personalized email is written for each. You review before sending.'}</span>
        <Button size="sm" onClick={preparar}><Mail className="mr-2 h-4 w-4" />{es ? `Preparar ${elegidos.length} ${elegidos.length === 1 ? 'correo' : 'correos'}` : `Prepare ${elegidos.length}`}</Button>
        <Button size="sm" variant="ghost" onClick={limpiar} aria-label={es ? 'Quitar selección' : 'Clear selection'}><X className="h-4 w-4" /></Button>
      </div>
      {cupo && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums ${cupo.caben === 0 ? 'border-destructive/40 bg-destructive/10 text-destructive' : aviso ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-background'}`}>
            {es ? `Límite de hoy: ${cupo.enviadosHoy} de ${cupo.tope} enviados` : `Today's limit: ${cupo.enviadosHoy} of ${cupo.tope} sent`}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {cupo.enEspera > 0 && (es ? `${cupo.enEspera} ${cupo.enEspera === 1 ? 'borrador en espera' : 'borradores en espera'} · ` : `${cupo.enEspera} drafts waiting · `)}
            {es ? (cupo.caben === 0 ? 'no cabe ninguno más hoy' : `${cupo.caben === 1 ? 'cabe 1 más' : `caben ${cupo.caben} más`} hoy`) : `${cupo.caben} more fit today`}
          </span>
          {aviso && <span className={`text-xs font-medium ${cupo.caben === 0 ? 'text-destructive' : 'text-amber-700 dark:text-amber-400'}`}>{es ? aviso : `You selected ${elegidos.length}; ${cupo.caben} fit today. The rest stay as drafts.`}</span>}
        </div>
      )}
    </div>
  )
}
