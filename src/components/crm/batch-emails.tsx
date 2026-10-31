'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Mail, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { quotaWarning, batchSummary, type DailyQuota, type BatchResult } from '@/lib/batch-send'

interface Props {
  lang: string
  selected: Array<{ id: string; name: string }>
  clear: () => void
  /** Daily email cap and how much is left today. */
  quota?: DailyQuota
}

/**
 * Bar that shows up when contacts are checked in the table: prepares each one's
 * personalized draft, one at a time (the AI writes each business's hook), and links to
 * Prospecting to review and send them. It never sends anything by itself.
 */
export function BatchEmails({ lang, selected, clear, quota }: Props) {
  const es = lang !== 'en'
  const router = useRouter()
  const [progress, setProgress] = useState<{ done: number; total: number; current: string } | null>(null)
  const cancel = useRef(false)

  if (selected.length === 0 && !progress) return null

  async function prepare() {
    const list = [...selected]
    const r: BatchResult = { ready: 0, alreadyHad: 0, errors: [] }
    cancel.current = false
    for (let i = 0; i < list.length; i++) {
      if (cancel.current) break
      setProgress({ done: i, total: list.length, current: list[i].name })
      try {
        const res = await fetch('/api/outreach/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: list[i].id }) })
        const j = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(j.error || res.statusText)
        if (j.existing) r.alreadyHad += 1
        else r.ready += 1
      } catch (err) {
        r.errors.push(`${list[i].name}: ${err instanceof Error ? err.message : String(err)}`)
      }
    }
    setProgress(null)
    clear()
    const hasDrafts = r.ready + r.alreadyHad > 0
    const options = {
      description: r.errors.length ? r.errors.slice(0, 6).join('\n') + (r.errors.length > 6 ? `\n…y ${r.errors.length - 6} más` : '') : undefined,
      duration: 20_000,
      action: hasDrafts ? { label: es ? 'Revisar y enviar' : 'Review and send', onClick: () => router.push(`/${lang}/dashboard/admin/crm/prospeccion`) } : undefined,
    }
    if (hasDrafts) toast.success(batchSummary(r), options)
    else toast.error(batchSummary(r), options)
    router.refresh()
  }

  if (progress) {
    // The one being written counts as half a step: the bar moves from the first one.
    const pct = Math.round(((progress.done + 0.5) / progress.total) * 100)
    return (
      <div className="mb-3 overflow-hidden rounded-lg border border-primary/30 bg-primary/5" role="status" aria-live="polite">
        <div className="flex flex-wrap items-center gap-3 p-3 text-sm">
          <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium tabular-nums">
              {es ? `Escribiendo ${progress.done + 1} de ${progress.total}` : `Writing ${progress.done + 1} of ${progress.total}`}
              <span className="ml-0.5 inline-flex w-5 justify-start" aria-hidden>
                <span className="animate-bounce [animation-delay:0ms]">.</span>
                <span className="animate-bounce [animation-delay:150ms]">.</span>
                <span className="animate-bounce [animation-delay:300ms]">.</span>
              </span>
            </p>
            <p className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 shrink-0 animate-pulse text-primary" aria-hidden />
              <span className="truncate">{es ? `La IA está escribiendo el correo de ${progress.current}` : `AI is writing the email for ${progress.current}`}</span>
            </p>
          </div>
          <span className="text-sm font-semibold tabular-nums text-primary">{pct}%</span>
          <Button size="sm" variant="outline" onClick={() => { cancel.current = true }}>{es ? 'Detener' : 'Stop'}</Button>
        </div>
        <div className="h-1.5 w-full bg-primary/15" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done}>
          <div className="relative h-full overflow-hidden rounded-r-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }}>
            <div className="absolute inset-0 animate-pulse bg-white/40" />
          </div>
        </div>
      </div>
    )
  }

  const warning = quota ? quotaWarning(selected.length, quota) : null
  return (
    <div className="mb-3 rounded-lg border bg-muted/40 p-3 text-sm" role="status">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-medium tabular-nums">{selected.length} {es ? (selected.length === 1 ? 'contacto elegido' : 'contactos elegidos') : 'selected'}</span>
        <span className="min-w-0 flex-1 text-muted-foreground">{es ? 'Se escribe un correo personalizado para cada uno. Los revisas antes de enviar.' : 'A personalized email is written for each. You review before sending.'}</span>
        <Button size="sm" onClick={prepare}><Mail className="mr-2 h-4 w-4" />{es ? `Preparar ${selected.length} ${selected.length === 1 ? 'correo' : 'correos'}` : `Prepare ${selected.length}`}</Button>
        <Button size="sm" variant="ghost" onClick={clear} aria-label={es ? 'Quitar selección' : 'Clear selection'}><X className="h-4 w-4" /></Button>
      </div>
      {quota && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 border-t pt-2">
          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums ${quota.fits === 0 ? 'border-destructive/40 bg-destructive/10 text-destructive' : warning ? 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-background'}`}>
            {es ? `Límite de hoy: ${quota.sentToday} de ${quota.cap} enviados` : `Today's limit: ${quota.sentToday} of ${quota.cap} sent`}
          </span>
          <span className="text-xs text-muted-foreground tabular-nums">
            {quota.pending > 0 && (es ? `${quota.pending} ${quota.pending === 1 ? 'borrador en espera' : 'borradores en espera'} · ` : `${quota.pending} drafts waiting · `)}
            {es ? (quota.fits === 0 ? 'no cabe ninguno más hoy' : `${quota.fits === 1 ? 'cabe 1 más' : `caben ${quota.fits} más`} hoy`) : `${quota.fits} more fit today`}
          </span>
          {warning && <span className={`text-xs font-medium ${quota.fits === 0 ? 'text-destructive' : 'text-amber-700 dark:text-amber-400'}`}>{es ? warning : `You selected ${selected.length}; ${quota.fits} fit today. The rest stay as drafts.`}</span>}
        </div>
      )}
    </div>
  )
}
