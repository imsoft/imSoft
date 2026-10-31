'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check, ChevronLeft, PartyPopper, ChevronRight, Copy, Eye, Loader2, Mail, RefreshCw, Send, Sparkles, X } from 'lucide-react'
import { bodyOf } from '@/lib/outreach'
import { sendCelebration, GMAIL_RATE_LIMIT_WAIT_MS, isGmailRateLimit, batchMinutes, pauseBetweenSends, GMAIL_RATE_LIMIT_RETRIES, type Celebration } from '@/lib/batch-send'
import { Confetti } from '@/components/documents/confetti'
import { CHANNELS, CHANNEL_LABEL, capStatus, type Channel, type ChannelCounts, type QueueRow } from '@/lib/social-message'
import { SocialQueue } from '@/components/crm/social-queue'

export interface OutreachRow {
  id: string
  contact_id: string
  step: 1 | 2 | 3
  status: 'draft' | 'sent' | 'replied' | 'closed' | 'skipped'
  subject: string
  html: string
  text: string
  scheduled_for: string
  sent_at: string | null
  sent_via: string | null
  hook: string | null
  name: string
  company: string
  email: string
}

interface Props {
  lang: string
  gmail: { email: string } | null
  gmailConfigured: boolean
  campaign: { today: string; sentToday: number; cap: number; remainingToday: number; daysSinceFirstSend: number }
  /** Social messages logged with "Ya lo envié": today, last 7 days and daily cap. */
  social: { today: ChannelCounts; week: ChannelCounts; caps: Record<Channel, number> }
  rows: OutreachRow[]
  uncontacted: number
  /** Uncontacted prospects with WhatsApp or Instagram, ready to be messaged. */
  queue: { rows: QueueRow[]; total: number }
}

const STEP_LABEL = { 1: 'Primer correo', 2: 'Seguimiento 1', 3: 'Seguimiento 2' }

export function Prospecting({ lang, gmail, gmailConfigured, campaign, social, rows, uncontacted, queue }: Props) {
  const es = lang !== 'en'
  const router = useRouter()
  const sp = useSearchParams()
  const [busy, setBusy] = useState<string | null>(null)
  const [open, setOpen] = useState<OutreachRow | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  useEffect(() => {
    const id = sp.get('abrir')
    const f = id ? rows.find((x) => x.id === id) : null
    if (!f) return
    // Deferred: open the dialog after render, not inside the effect.
    const t = setTimeout(() => {
      setOpen(f)
      setSubject(f.subject)
      setBody(bodyOf(f.text))
      router.replace(`/${lang}/dashboard/admin/crm/prospeccion`)
    }, 0)
    return () => clearTimeout(t)
  }, [sp, rows, lang, router])

  useEffect(() => {
    const g = sp.get('gmail')
    if (g === 'ok') toast.success(es ? `Gmail conectado: ${sp.get('email')}` : `Gmail connected: ${sp.get('email')}`)
    if (g === 'error') toast.error(`Gmail: ${sp.get('motivo')}`)
  }, [sp, es])

  const today = campaign.today
  /**
   * Emails that already went out in the running batch. During the batch the page is NOT
   * requested from the server again: if a new version of the site is live at that moment,
   * Next reloads the whole tab and the batch stops (happened on 2026-09-30 after the first send).
   */
  const [alreadySent, setAlreadySent] = useState<Set<string>>(new Set())
  const sentWithoutRefresh = useMemo(() => rows.filter((f) => f.status === 'draft' && alreadySent.has(f.id)).length, [rows, alreadySent])
  const drafts = useMemo(() => rows.filter((f) => f.status === 'draft' && !alreadySent.has(f.id)), [rows, alreadySent])
  /** What is left of today's cap, minus what already went out in the running batch. */
  const remaining = Math.max(0, campaign.remainingToday - sentWithoutRefresh)
  const dueToday = drafts.filter((f) => f.scheduled_for <= today)
  /** Emails picked by hand for the batch send (cap: what is left today). Empty = the first ones in the list. */
  const [selection, setSelection] = useState<Set<string>>(new Set())
  const selectedRows = useMemo(() => dueToday.filter((f) => selection.has(f.id)), [dueToday, selection])
  /** What goes into the batch: the selection if any, otherwise the list in order. */
  const forBatch = selectedRows.length > 0 ? selectedRows : dueToday
  function toggleSelection(id: string) {
    setSelection((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else if (n.size < remaining) n.add(id)
      else toast.info(es ? `Hoy solo caben ${remaining}. Quita uno para elegir otro.` : `Only ${remaining} fit today. Unselect one first.`)
      return n
    })
  }
  function selectFirst() {
    setSelection(new Set(dueToday.slice(0, remaining).map((f) => f.id)))
  }
  const upcoming = drafts.filter((f) => f.scheduled_for > today)
  const awaitingReply = rows.filter((f) => f.status === 'sent')
  const replied = rows.filter((f) => f.status === 'replied')

  async function call(route: string, key: string, body?: unknown) {
    setBusy(key)
    try {
      const r = await fetch(route, { method: body === undefined ? 'POST' : 'POST', headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      router.refresh()
      return j
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setBusy(null)
    }
  }

  async function generate() {
    const j = await call('/api/outreach/drafts', 'drafts', { limit: Math.max(campaign.remainingToday, 5) })
    if (!j) return
    if (j.noCandidates) toast.info(es ? 'No hay prospectos sin contactar con correo.' : 'No uncontacted prospects with email.')
    else toast.success(es ? `${j.created} borradores listos para revisar.` : `${j.created} drafts ready to review.`)
    if (j.errors?.length) toast.error(j.errors.join('\n'))
  }

  /**
   * Opening Prospecting checks for bounces, replies and due follow-ups on its own, at most
   * every 3 hours. It used to depend on remembering to press the button, and bounces went
   * unrecorded for days (8 of 16 on 2026-10-03).
   */
  const autoSync = useRef(false)
  /**
   * Automatic check in progress. A batch waits for it to finish before sending: both
   * spend the per-minute limit of the same Gmail account.
   */
  const syncInProgress = useRef<Promise<void> | null>(null)
  const batchInProgress = useRef(false)
  useEffect(() => {
    if (autoSync.current || !gmail) return
    autoSync.current = true
    let last = 0
    try { last = Number(window.localStorage.getItem('imsoft-outreach-sync') ?? 0) } catch { /* no storage */ }
    if (Date.now() - last < 3 * 3_600_000) return
    const t = setTimeout(() => {
      if (batchInProgress.current) return
      // Marked at the start, not the end: if another tab opens or the page reloads while it
      // runs, a second check doesn't start on top (several piled up on 2026-10-22).
      try { window.localStorage.setItem('imsoft-outreach-sync', String(Date.now())) } catch { /* no storage */ }
      syncInProgress.current = (async () => {
      try {
        const r = await fetch('/api/outreach/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) {
          // Failure: release the mark so the next visit tries again.
          try { window.localStorage.setItem('imsoft-outreach-sync', String(last)) } catch { /* no storage */ }
          return
        }
        const news = (j.replied ?? 0) + (j.bounced ?? 0) + (j.followUpsCreated ?? 0)
        if (news === 0) return
        if (j.replied) toast.success(es ? `${j.replied} ${j.replied === 1 ? 'prospecto respondió' : 'prospectos respondieron'}` : `${j.replied} replied`, { duration: 15_000 })
        toast.info(es ? `Revisión automática: ${j.bounced ?? 0} rebotaron · ${j.followUpsCreated ?? 0} seguimientos listos` : `Auto check: ${j.bounced ?? 0} bounced · ${j.followUpsCreated ?? 0} follow-ups ready`)
        router.refresh()
      } catch { /* will be retried next time */ } finally {
        syncInProgress.current = null
      }
      })()
    }, 1500)
    return () => clearTimeout(t)
  }, [gmail, es, router])

  async function sync() {
    const j = await call('/api/outreach/sync', 'sync', {})
    if (!j) return
    try { window.localStorage.setItem('imsoft-outreach-sync', String(Date.now())) } catch { /* no storage */ }
    toast.success(es ? `${j.replied} respondieron · ${j.bounced ?? 0} rebotaron · ${j.followUpsCreated} seguimientos nuevos · ${j.closed} cerrados` : `${j.replied} replied · ${j.followUpsCreated} new follow-ups · ${j.closed} closed`)
    if (j.errors?.length) toast.error(j.errors.join('\n'))
  }

  async function send(f: OutreachRow) {
    const j = await call(`/api/outreach/${f.id}/send`, `send-${f.id}`, {})
    if (j) toast.success(es ? `Enviado a ${f.company || f.email}${j.next ? ` · seguimiento el ${j.next}` : ''}` : `Sent to ${f.company || f.email}`)
    if (open?.id === f.id) setOpen(null)
    if (j) {
      const sentToday = campaign.sentToday + sentWithoutRefresh + 1
      const c = sendCelebration({ sent: 1, total: 1, errors: 0, stopped: false, sentToday, cap: campaign.cap })
      if (c) setParty({ ...c, sentToday })
    }
  }

  /** The email went out another way (copied to Gmail, WhatsApp...). */
  async function markSent(f: OutreachRow) {
    const j = await call(`/api/outreach/${f.id}/manual`, `manual-${f.id}`, {})
    if (j) toast.success(es ? `Registrado como enviado · ${f.company || f.email} pasa a calificación${j.next ? ` · seguimiento el ${j.next}` : ''}` : `Marked as sent · ${f.company || f.email} moved to qualification`)
    if (open?.id === f.id) setOpen(null)
  }

  // ----- Batch send: one by one, with a pause between emails -----
  const [confirmBatch, setConfirmBatch] = useState(false)
  const [batch, setBatch] = useState<{ i: number; total: number; current: string; wait: number; pause: number; sent: number; errors: string[]; rateLimited?: boolean; note?: string } | null>(null)
  const stop = useRef(false)
  /** Celebration when the daily limit or a whole batch is completed. */
  const [party, setParty] = useState<(Celebration & { sentToday: number }) | null>(null)
  /** Review before sending: which email is being viewed and which are left out of this send. */
  const [previewIndex, setPreviewIndex] = useState(0)
  const [excluded, setExcluded] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!batch) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [batch])

  async function sendAll() {
    setConfirmBatch(false)
    // Snapshot of the list at the start: the page refreshes after each send.
    const picked = selection.size > 0 ? selection : null
    const list = rows.filter((f) => f.status === 'draft' && f.scheduled_for <= campaign.today && !excluded.has(f.id) && !alreadySent.has(f.id) && (!picked || picked.has(f.id))).slice(0, remaining)
    if (list.length === 0) return
    const sentBefore = campaign.sentToday + sentWithoutRefresh
    stop.current = false
    batchInProgress.current = true
    setBusy('batch')
    let sent = 0
    const errors: string[] = []
    // If the automatic check is still running, wait for it to finish before sending.
    if (syncInProgress.current) {
      setBatch({ i: 0, total: list.length, current: list[0].company || list[0].email, wait: 0, pause: 0, sent, errors, note: es ? 'Esperando a que termine la revisión de respuestas para no chocar con el límite de Gmail' : 'Waiting for the reply check to finish' })
      await syncInProgress.current.catch(() => {})
    }
    /** Visible wait (in seconds) before the next attempt or the next email. */
    const waitFor = async (ms: number, i: number, current: string, rateLimited: boolean) => {
      const until = Date.now() + ms
      while (Date.now() < until && !stop.current) {
        setBatch({ i, total: list.length, current, wait: Math.ceil((until - Date.now()) / 1000), pause: Math.round(ms / 1000), sent, errors, rateLimited })
        await new Promise((ok) => setTimeout(ok, 1000))
      }
    }
    for (let i = 0; i < list.length; i++) {
      if (stop.current) break
      const f = list[i]
      let abort = false
      // On Gmail's per-minute limit, wait and retry the same email.
      for (let attempt = 0; attempt <= GMAIL_RATE_LIMIT_RETRIES && !stop.current; attempt++) {
        setBatch({ i, total: list.length, current: f.company || f.email, wait: 0, pause: 0, sent, errors })
        try {
          const r = await fetch(`/api/outreach/${f.id}/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
          const j = await r.json().catch(() => ({}))
          if (!r.ok) throw new Error(j.error || r.statusText)
          sent += 1
          setAlreadySent((prev) => new Set(prev).add(f.id))
          break
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err)
          if (isGmailRateLimit(msg) && attempt < GMAIL_RATE_LIMIT_RETRIES) {
            await waitFor(GMAIL_RATE_LIMIT_WAIT_MS, i, f.company || f.email, true)
            continue
          }
          errors.push(`${f.company || f.email}: ${msg}`)
          // Daily cap or Gmail disconnected: going on would just repeat the error for each one.
          if (/tope de hoy|Gmail/i.test(msg)) abort = true
          break
        }
      }
      if (abort) break
      if (i < list.length - 1 && !stop.current) {
        const pause = pauseBetweenSends()
        const until = Date.now() + pause
        while (Date.now() < until && !stop.current) {
          setBatch({ i, total: list.length, current: list[i + 1].company || list[i + 1].email, wait: Math.ceil((until - Date.now()) / 1000), pause: Math.round(pause / 1000), sent, errors })
          await new Promise((ok) => setTimeout(ok, 1000))
        }
      }
    }
    setBatch(null)
    setBusy(null)
    batchInProgress.current = false
    setSelection(new Set())
    router.refresh()
    const text = es ? `${sent} de ${list.length} ${list.length === 1 ? 'correo enviado' : 'correos enviados'}${stop.current ? ' (detenido)' : ''}` : `${sent} of ${list.length} emails sent`
    const sentToday = sentBefore + sent
    const c = sendCelebration({ sent, total: list.length, errors: errors.length, stopped: stop.current, sentToday, cap: campaign.cap })
    if (c) setParty({ ...c, sentToday })
    if (errors.length) toast.error(text, { description: errors.slice(0, 5).join('\n'), duration: 20_000 })
    else if (!c) toast.success(text)
  }

  async function skip(f: OutreachRow) {
    if (await call(`/api/outreach/${f.id}/skip`, `skip-${f.id}`, {})) toast.success(es ? 'Descartado' : 'Skipped')
    if (open?.id === f.id) setOpen(null)
  }

  async function copy(value: string, msg: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(msg)
    } catch {
      toast.error(es ? 'No se pudo copiar' : 'Could not copy')
    }
  }

  /** Copies the email with formatting (HTML + text): pasted into Gmail it keeps the design. */
  async function copyWithFormatting(html: string, text: string) {
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      })
      await navigator.clipboard.write([item])
      toast.success(es ? 'Correo copiado con formato. Pégalo en un mensaje nuevo de Gmail.' : 'Email copied with formatting. Paste it into a new Gmail message.')
    } catch {
      await copy(text, es ? 'Copiado como texto (el navegador no permite copiar con formato)' : 'Copied as plain text')
    }
  }

  function openRow(f: OutreachRow) {
    setOpen(f)
    setSubject(f.subject)
    setBody(bodyOf(f.text))
  }

  async function save() {
    if (!open) return
    setBusy('save')
    try {
      const r = await fetch(`/api/outreach/${open.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, body }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      setOpen({ ...open, subject: j.subject, html: j.html, text: j.text })
      toast.success(es ? 'Guardado' : 'Saved')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(null)
    }
  }

  const canSend = Boolean(gmail) && remaining > 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Gmail</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {gmail ? (
              <>
                <p className="font-medium">{gmail.email}</p>
                <Button variant="outline" size="sm" disabled={busy === 'disc'} onClick={async () => { if (await call('/api/gmail/disconnect', 'disc', {})) toast.success(es ? 'Gmail desconectado' : 'Gmail disconnected') }}>{es ? 'Desconectar' : 'Disconnect'}</Button>
              </>
            ) : gmailConfigured ? (
              <>
                <p className="text-sm text-muted-foreground">{es ? 'Conecta la cuenta desde la que vas a mandar (contacto@imsoft.io).' : 'Connect the account you will send from.'}</p>
                <Button size="sm" onClick={() => { window.location.href = '/api/gmail/connect' }}><Mail className="mr-2 h-4 w-4" />{es ? 'Conectar Gmail' : 'Connect Gmail'}</Button>
              </>
            ) : (
              <p className="text-sm text-destructive">{es ? 'Faltan GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET en Vercel.' : 'Missing GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET.'}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{es ? 'Hoy' : 'Today'}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold tabular-nums">{campaign.sentToday + sentWithoutRefresh} <span className="text-base font-normal text-muted-foreground">/ {campaign.cap}</span></p>
            <p className="text-sm text-muted-foreground">{es ? `Tope de la rampa (día ${campaign.daysSinceFirstSend + 1} de la campaña). Reparte los envíos a lo largo del día.` : `Ramp cap (campaign day ${campaign.daysSinceFirstSend + 1}). Spread sends through the day.`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{es ? 'Mensajes por redes hoy' : 'Social messages today'}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {CHANNELS.filter((c) => c === 'whatsapp' || c === 'instagram' || social.week[c] > 0).map((c) => {
              const e = capStatus(social.today[c], c)
              return (
                <p key={c} className="flex justify-between gap-3">
                  <span>{CHANNEL_LABEL[c]}</span>
                  <span className={`font-medium tabular-nums ${e === 'reached' ? 'text-destructive' : e === 'near' ? 'text-amber-600' : ''}`}>{social.today[c]} / {social.caps[c]}</span>
                </p>
              )
            })}
            <p className="pt-1 text-xs text-muted-foreground">{es ? `Últimos 7 días: ${CHANNELS.reduce((n, c) => n + social.week[c], 0)}. Cuenta los marcados con "Ya lo envié".` : `Last 7 days: ${CHANNELS.reduce((n, c) => n + social.week[c], 0)}. Counts messages marked as sent.`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{es ? 'Embudo' : 'Funnel'}</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>{uncontacted} {es ? 'sin contactar (con correo)' : 'uncontacted (with email)'}</p>
            <p>{queue.total} {es ? 'sin contactar (con WhatsApp o Instagram)' : 'uncontacted (with WhatsApp or Instagram)'}</p>
            <p>{awaitingReply.length} {es ? 'correos esperando respuesta' : 'emails awaiting reply'}</p>
            <p>{replied.length} {es ? 'respondieron' : 'replied'}</p>
          </CardContent>
        </Card>
      </div>

      <SocialQueue lang={lang} rows={queue.rows} total={queue.total} />

      <div className="flex flex-wrap gap-2">
        <Button onClick={generate} disabled={busy !== null || uncontacted === 0}><Sparkles className="mr-2 h-4 w-4" />{busy === 'drafts' ? (es ? 'Generando…' : 'Generating…') : es ? 'Generar borradores' : 'Generate drafts'}</Button>
        <Button variant="outline" onClick={sync} disabled={busy !== null || !gmail}><RefreshCw className="mr-2 h-4 w-4" />{busy === 'sync' ? (es ? 'Sincronizando…' : 'Syncing…') : es ? 'Buscar respuestas y seguimientos' : 'Check replies and follow-ups'}</Button>
        {dueToday.length > 1 && (
          <Button variant="outline" onClick={() => { setPreviewIndex(0); setExcluded(new Set()); setConfirmBatch(true) }} disabled={busy !== null || !canSend}>
            <Send className="mr-2 h-4 w-4" />
            {selectedRows.length > 0
              ? (es ? `Enviar seleccionados (${Math.min(selectedRows.length, remaining)})` : `Send selected (${Math.min(selectedRows.length, remaining)})`)
              : (es ? `Enviar los primeros (${Math.min(dueToday.length, remaining)})` : `Send first (${Math.min(dueToday.length, remaining)})`)}
          </Button>
        )}
        {selectedRows.length > 0 && (
          <Button variant="ghost" onClick={() => setSelection(new Set())} disabled={busy !== null}><X className="mr-2 h-4 w-4" />{es ? 'Quitar selección' : 'Clear selection'}</Button>
        )}
      </div>

      {batch && (
        <div className="overflow-hidden rounded-lg border border-primary/30 bg-primary/5" role="status" aria-live="polite">
          <div className="flex flex-wrap items-center gap-3 p-4 text-sm">
            {batch.wait > 0 ? <Send className="h-5 w-5 shrink-0 animate-pulse text-primary" aria-hidden /> : <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />}
            <div className="min-w-0 flex-1">
              <p className="font-semibold tabular-nums">
                {batch.wait > 0
                  ? (es ? `${batch.sent} de ${batch.total} enviados` : `${batch.sent} of ${batch.total} sent`)
                  : (es ? `Enviando ${batch.i + 1} de ${batch.total}` : `Sending ${batch.i + 1} of ${batch.total}`)}
                {batch.wait === 0 && (
                  <span className="ml-0.5 inline-flex w-5 justify-start" aria-hidden>
                    <span className="animate-bounce [animation-delay:0ms]">.</span>
                    <span className="animate-bounce [animation-delay:150ms]">.</span>
                    <span className="animate-bounce [animation-delay:300ms]">.</span>
                  </span>
                )}
              </p>
              <p className="truncate text-muted-foreground">
                {batch.note
                  ? batch.note
                  : batch.rateLimited && batch.wait > 0
                  ? (es ? `Gmail pidió esperar un minuto · reintento con ${batch.current} en ${batch.wait} s` : `Gmail asked to wait a minute · retrying ${batch.current} in ${batch.wait}s`)
                  : batch.wait > 0
                  ? (es ? `Siguiente: ${batch.current}, en ${batch.wait} s` : `Next: ${batch.current}, in ${batch.wait}s`)
                  : (es ? `Saliendo por Gmail a ${batch.current}` : `Going out through Gmail to ${batch.current}`)}
                {batch.errors.length > 0 && <span className="text-destructive">{es ? ` · ${batch.errors.length} con error` : ` · ${batch.errors.length} failed`}</span>}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{es ? 'No cierres esta pestaña.' : 'Keep this tab open.'}</span>
            <span className="text-sm font-semibold tabular-nums text-primary">{Math.round((batch.sent / batch.total) * 100)}%</span>
            <Button size="sm" variant="outline" onClick={() => { stop.current = true }}>{es ? 'Detener' : 'Stop'}</Button>
          </div>
          {/* Batch progress */}
          <div className="h-1.5 w-full bg-primary/15" role="progressbar" aria-valuemin={0} aria-valuemax={batch.total} aria-valuenow={batch.sent}>
            <div className="relative h-full overflow-hidden rounded-r-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${Math.max(3, Math.round(((batch.sent + (batch.wait > 0 ? 0 : 0.5)) / batch.total) * 100))}%` }}>
              <div className="absolute inset-0 animate-pulse bg-white/40" />
            </div>
          </div>
          {/* Countdown of the pause between two emails */}
          {batch.wait > 0 && batch.pause > 0 && (
            <div className="h-0.5 w-full bg-transparent">
              <div className="h-full bg-primary/40 transition-[width] duration-1000 ease-linear" style={{ width: `${Math.round((batch.wait / batch.pause) * 100)}%` }} />
            </div>
          )}
        </div>
      )}

      <EmailList title={es ? `Para enviar hoy (${dueToday.length})` : `To send today (${dueToday.length})`} rows={dueToday} empty={es ? 'Nada pendiente. Genera borradores o sincroniza para ver seguimientos.' : 'Nothing pending.'} openRow={openRow} send={send} skip={skip} busy={busy} canSend={canSend} es={es}
        selection={canSend ? { ids: selection, cap: remaining, toggle: toggleSelection, first: selectFirst, clear: () => setSelection(new Set()) } : undefined} />
      {upcoming.length > 0 && <EmailList title={es ? `Programados (${upcoming.length})` : `Scheduled (${upcoming.length})`} rows={upcoming} empty="" openRow={openRow} send={send} skip={skip} busy={busy} canSend={canSend} es={es} />}
      <EmailList title={es ? `Enviados, esperando respuesta (${awaitingReply.length})` : `Sent, awaiting reply (${awaitingReply.length})`} rows={awaitingReply} empty={es ? 'Todavía no hay envíos.' : 'No sends yet.'} openRow={openRow} send={send} skip={skip} busy={busy} canSend={false} es={es} />
      {replied.length > 0 && <EmailList title={es ? `Respondieron (${replied.length})` : `Replied (${replied.length})`} rows={replied} empty="" openRow={openRow} send={send} skip={skip} busy={busy} canSend={false} es={es} />}

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-6xl max-h-[92vh] overflow-y-auto">
          {open && (
            <>
              <DialogHeader>
                <DialogTitle>{STEP_LABEL[open.step]} · {open.company || open.name} <span className="font-normal text-muted-foreground">&lt;{open.email}&gt;</span></DialogTitle>
              </DialogHeader>
              {(() => {
                const isDraft = open.status === 'draft'
                const dirty = isDraft && (subject !== open.subject || body !== bodyOf(open.text))
                const htmlPreview = open.html
                return (
                  <div className="min-w-0 space-y-4">
                    {/* Row 1: full-width subject */}
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="w-16 shrink-0 text-xs font-medium text-muted-foreground">{es ? 'Asunto' : 'Subject'}</label>
                      {isDraft ? (
                        <Input className="min-w-0 flex-1" value={subject} onChange={(e) => setSubject(e.target.value)} />
                      ) : (
                        <p className="min-w-0 flex-1 text-sm">{open.subject}</p>
                      )}
                      <Button size="sm" variant="outline" onClick={() => copy(isDraft ? subject : open.subject, es ? 'Asunto copiado' : 'Subject copied')}><Copy className="mr-1 h-3.5 w-3.5" />{es ? 'Copiar asunto' : 'Copy subject'}</Button>
                      <Button size="sm" variant="outline" onClick={() => copyWithFormatting(htmlPreview, open.text)}><Copy className="mr-1 h-3.5 w-3.5" />{es ? 'Copiar para pegar en Gmail' : 'Copy for Gmail'}</Button>
                    </div>

                    {/* Row 2: body and preview side by side */}
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div className="flex min-w-0 flex-col gap-2">
                        <label className="text-xs font-medium text-muted-foreground">{es ? 'Mensaje (el botón de WhatsApp y la línea legal se agregan solos; sin firma)' : 'Message (WhatsApp button and legal line are added automatically; no signature)'}</label>
                        {isDraft ? (
                          <textarea
                            className="h-[60vh] w-full min-w-0 resize-none rounded-md border-2 border-border/90 bg-transparent px-3 py-2 text-sm leading-relaxed shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            style={{ fieldSizing: 'fixed' } as React.CSSProperties}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                          />
                        ) : (
                          <pre className="h-[60vh] min-w-0 overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted/30 p-3 font-sans text-sm leading-relaxed">{bodyOf(open.text)}</pre>
                        )}
                        {!isDraft && <p className="text-xs text-muted-foreground">{es ? 'Enviado: ' : 'Sent: '}{open.sent_at ? new Date(open.sent_at).toLocaleString(es ? 'es-MX' : 'en-US') : '—'} ({open.sent_via})</p>}
                      </div>
                      <div className="flex min-w-0 flex-col gap-2">
                        <label className="text-xs font-medium text-muted-foreground">{es ? 'Vista previa' : 'Preview'}</label>
                        <iframe title="preview" className="h-[60vh] w-full min-w-0 rounded-md border bg-white" sandbox="" srcDoc={htmlPreview} />
                      </div>
                    </div>

                    {isDraft && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={save} disabled={busy !== null}>{busy === 'save' ? (es ? 'Guardando…' : 'Saving…') : es ? 'Guardar cambios' : 'Save changes'}</Button>
                        <Button onClick={() => send(open)} disabled={busy !== null || !canSend || dirty}><Send className="mr-2 h-4 w-4" />{es ? 'Enviar por Gmail' : 'Send via Gmail'}</Button>
                        <Button variant="outline" onClick={() => markSent(open)} disabled={busy !== null || dirty} title={es ? 'Si lo copiaste y lo mandaste tú desde Gmail o WhatsApp' : 'If you copied it and sent it yourself'}><Check className="mr-2 h-4 w-4" />{es ? 'Ya lo envié' : 'Already sent'}</Button>
                        <Button variant="ghost" onClick={() => skip(open)} disabled={busy !== null}><X className="mr-2 h-4 w-4" />{es ? 'Descartar' : 'Skip'}</Button>
                        {dirty && <p className="text-xs text-muted-foreground">{es ? 'Guarda los cambios para actualizar la vista previa y poder enviar.' : 'Save your changes to refresh the preview and send.'}</p>}
                        {!dirty && <p className="w-full text-xs text-muted-foreground">{es ? 'Enviar por Gmail o "Ya lo envié" registran el correo en el CRM, pasan al prospecto a calificación y agendan el seguimiento.' : 'Both buttons log the email in the CRM, move the prospect to qualification and schedule the follow-up.'}</p>}
                      </div>
                    )}
                  </div>
                )
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={party !== null} onOpenChange={(o) => { if (!o) setParty(null) }}>
        <DialogContent className="sm:max-w-md text-center">
          {party && (
            <>
              <Confetti delayMs={150} />
              <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <PartyPopper className="h-8 w-8 text-primary" aria-hidden />
              </div>
              <DialogHeader className="items-center text-center sm:text-center">
                <DialogTitle className="text-2xl">{es ? party.title : party.type === 'goal' ? 'Daily goal reached!' : 'Emails sent!'}</DialogTitle>
                <DialogDescription className="text-center">{es ? party.text : `${party.sentToday} of ${campaign.cap} emails went out today.`}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-2xl font-bold tabular-nums">{party.sentToday}<span className="text-base font-normal text-muted-foreground"> / {campaign.cap}</span></p>
                  <p className="text-muted-foreground">{es ? 'enviados hoy' : 'sent today'}</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-2xl font-bold tabular-nums">{awaitingReply.length}</p>
                  <p className="text-muted-foreground">{es ? 'esperando respuesta' : 'awaiting reply'}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {party.type === 'goal'
                  ? (es ? 'Mañana se renueva tu límite. Los seguimientos se preparan solos cuando les toca.' : 'Your limit renews tomorrow.')
                  : (es ? `Hoy todavía caben ${Math.max(0, campaign.cap - party.sentToday)} más.` : `${Math.max(0, campaign.cap - party.sentToday)} more fit today.`)}
              </p>
              <DialogFooter className="sm:justify-center">
                <Button onClick={() => setParty(null)}>{es ? '¡Listo!' : 'Done!'}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmBatch} onOpenChange={setConfirmBatch}>
        <DialogContent className="sm:max-w-3xl">
          {(() => {
            const candidates = forBatch.slice(0, remaining + excluded.size).filter((f, i, all) => all.indexOf(f) === i)
            const toSend = candidates.filter((f) => !excluded.has(f.id)).slice(0, remaining)
            const idx = Math.min(previewIndex, Math.max(0, candidates.length - 1))
            const f = candidates[idx]
            const isExcluded = f ? excluded.has(f.id) : false
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{es ? `Revisar y enviar ${toSend.length} ${toSend.length === 1 ? 'correo' : 'correos'}` : `Review and send ${toSend.length}`}</DialogTitle>
                  <DialogDescription>
                    {es
                      ? `Así van a salir. Cada uno se envía por Gmail con 20 a 45 segundos de pausa; tarda ${batchMinutes(toSend.length) === 1 ? 'cerca de un minuto' : `unos ${batchMinutes(toSend.length)} minutos`} y necesita esta pestaña abierta.`
                      : `This is how they will go out, 20 to 45 seconds apart, about ${batchMinutes(toSend.length)} minutes. Keep this tab open.`}
                  </DialogDescription>
                </DialogHeader>
                {f && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPreviewIndex(Math.max(0, idx - 1))} disabled={idx === 0} aria-label={es ? 'Correo anterior' : 'Previous email'}><ChevronLeft className="h-4 w-4" /></Button>
                      <span className="text-sm font-medium tabular-nums">{idx + 1} {es ? 'de' : 'of'} {candidates.length}</span>
                      <Button size="sm" variant="outline" onClick={() => setPreviewIndex(Math.min(candidates.length - 1, idx + 1))} disabled={idx >= candidates.length - 1} aria-label={es ? 'Correo siguiente' : 'Next email'}><ChevronRight className="h-4 w-4" /></Button>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className={`truncate font-medium ${isExcluded ? 'text-muted-foreground line-through' : ''}`}>{f.company || '—'} <span className="font-normal text-muted-foreground">&lt;{f.email}&gt;</span></p>
                      </div>
                      <Button size="sm" variant={isExcluded ? 'default' : 'ghost'} onClick={() => setExcluded((s) => { const n = new Set(s); if (n.has(f.id)) n.delete(f.id); else n.add(f.id); return n })}>
                        {isExcluded ? (es ? 'Volver a incluir' : 'Include again') : (es ? 'Dejar fuera de este envío' : 'Leave out')}
                      </Button>
                    </div>
                    <p className="truncate text-sm"><span className="text-muted-foreground">{es ? 'Asunto: ' : 'Subject: '}</span>{f.subject}</p>
                    <iframe title={es ? 'Vista previa del correo' : 'Email preview'} className={`h-[48vh] w-full rounded-md border bg-white ${isExcluded ? 'opacity-40' : ''}`} sandbox="" srcDoc={f.html} />
                    <p className="text-xs text-muted-foreground">{es ? 'Para corregir el texto, cierra esta ventana y abre el correo desde la lista. Un correo dejado fuera se queda como borrador.' : 'To edit the text, close this window and open the email from the list.'}</p>
                  </div>
                )}
                {forBatch.length > remaining && <p className="text-sm text-amber-600">{es ? `Hoy solo caben ${remaining} por el tope diario; los demás quedan para mañana.` : `Only ${remaining} fit in today's cap.`}</p>}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmBatch(false)}>{es ? 'Todavía no' : 'Not yet'}</Button>
                  <Button onClick={sendAll} disabled={toSend.length === 0}><Send className="mr-2 h-4 w-4" />{es ? `Enviar ${toSend.length}` : `Send ${toSend.length}`}</Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Hand-picked emails for the batch; only today's list uses it. */
interface Selection {
  ids: Set<string>
  /** How many fit today. */
  cap: number
  toggle: (id: string) => void
  first: () => void
  clear: () => void
}

function EmailList({ title, rows, empty, openRow, send, skip, busy, canSend, es, selection }: { title: string; rows: OutreachRow[]; empty: string; openRow: (f: OutreachRow) => void; send: (f: OutreachRow) => void; skip: (f: OutreachRow) => void; busy: string | null; canSend: boolean; es: boolean; selection?: Selection }) {
  const sel = selection && rows.length > 0 ? selection : undefined
  const checkedCount = sel ? rows.filter((f) => sel.ids.has(f.id)).length : 0
  const full = sel ? checkedCount >= sel.cap : false
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {sel && (
          <p className="text-sm text-muted-foreground">
            {checkedCount > 0
              ? (es ? `${checkedCount} de ${sel.cap} elegidos para el lote` : `${checkedCount} of ${sel.cap} selected`)
              : (es ? `Marca hasta ${sel.cap} para elegir cuáles salen hoy.` : `Tick up to ${sel.cap} to choose which go out today.`)}
          </p>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                {sel && (
                  <th className="w-10 p-3">
                    <Checkbox
                      checked={checkedCount === 0 ? false : full ? true : 'indeterminate'}
                      onCheckedChange={() => (checkedCount > 0 ? sel.clear() : sel.first())}
                      disabled={busy !== null}
                      aria-label={checkedCount > 0 ? (es ? 'Quitar selección' : 'Clear selection') : (es ? `Elegir los primeros ${sel.cap}` : `Select first ${sel.cap}`)}
                      title={checkedCount > 0 ? (es ? 'Quitar selección' : 'Clear selection') : (es ? `Elegir los primeros ${sel.cap}` : `Select first ${sel.cap}`)}
                    />
                  </th>
                )}
                <th className="p-3 text-left">{es ? 'Empresa' : 'Company'}</th>
                <th className="p-3 text-left">{es ? 'Contacto' : 'Contact'}</th>
                <th className="p-3 text-left">{es ? 'Paso' : 'Step'}</th>
                <th className="p-3 text-left">{es ? 'Asunto' : 'Subject'}</th>
                <th className="p-3 text-left">{es ? 'Fecha' : 'Date'}</th>
                <th className="p-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => {
                const isChecked = sel ? sel.ids.has(f.id) : false
                return (
                <tr key={f.id} className={`border-t hover:bg-muted/30 ${isChecked ? 'bg-primary/5' : ''}`}>
                  {sel && (
                    <td className="p-3">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => sel.toggle(f.id)}
                        disabled={busy !== null || (!isChecked && full)}
                        aria-label={es ? `Elegir ${f.company || f.email}` : `Select ${f.company || f.email}`}
                      />
                    </td>
                  )}
                  <td className="p-3 font-medium"><button className="underline underline-offset-4" onClick={() => openRow(f)}>{f.company || '—'}</button></td>
                  <td className="p-3">{f.name}<div className="text-xs text-muted-foreground">{f.email}</div></td>
                  <td className="p-3"><Badge variant={f.step === 1 ? 'default' : 'secondary'}>{STEP_LABEL[f.step]}</Badge></td>
                  <td className="p-3 max-w-[280px] truncate">{f.subject}</td>
                  <td className="p-3 whitespace-nowrap">{f.status === 'draft' ? f.scheduled_for : f.sent_at?.slice(0, 10)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => openRow(f)} title={es ? 'Ver el correo' : 'View email'}><Eye className="mr-1 h-3.5 w-3.5" />{es ? 'Ver' : 'View'}</Button>
                    {f.status === 'draft' && (
                      <>
                        <Button size="sm" onClick={() => send(f)} disabled={busy !== null || !canSend}><Send className="mr-1 h-3.5 w-3.5" />{busy === `send-${f.id}` ? '…' : es ? 'Enviar' : 'Send'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => skip(f)} disabled={busy !== null}><X className="h-3.5 w-3.5" /></Button>
                      </>
                    )}
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
