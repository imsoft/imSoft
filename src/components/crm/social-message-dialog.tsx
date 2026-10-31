'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Copy, ExternalLink, MessageCircle, RefreshCw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { channelsOf, capStatus, CHANNEL_LABEL, SOCIAL_DISCARD_REASONS, CHANNEL_DAILY_CAP, type Channel, type ChannelCounts, type SocialDiscardReason } from '@/lib/social-message'
import type { SocialLink } from '@/types/database'

export interface MessageContact {
  id: string
  name: string
  social_links?: SocialLink[] | null
  instagram_url?: string | null
  phone?: string | null
}

interface Props {
  contact: MessageContact
  lang: string
  open: boolean
  onClose: () => void
  /** Channel the dialog opens with; otherwise the contact's first available one. */
  initialChannel?: Channel | null
}

/**
 * Prospecting message for a social network: generated with the same hook as the email,
 * copied or opened in the network, and "Ya lo envié" logs it in the history and changes the status.
 */
export function SocialMessageDialog({ contact, lang, open, onClose, initialChannel }: Props) {
  const es = lang !== 'en'
  const router = useRouter()
  const [text, setText] = useState('')
  const [channel, setChannel] = useState<Channel | null>(null)
  const [busy, setBusy] = useState<'generate' | 'sent' | 'discard' | null>(null)
  const [counts, setCounts] = useState<ChannelCounts | null>(null)
  const [force, setForce] = useState(false)
  const channels = useMemo(() => channelsOf(contact, text), [contact, text])
  const current = channels.find((c) => c.channel === channel) ?? null

  useEffect(() => {
    if (!open) return
    const available = channelsOf(contact).map((c) => c.channel)
    const first = (initialChannel && available.includes(initialChannel) ? initialChannel : available[0]) ?? null
    // Deferred: set the initial channel after opening, not during render.
    const t = setTimeout(() => { setChannel(first); setText('') }, 0)
    return () => clearTimeout(t)
  }, [open, contact, initialChannel])

  // How many went out today on each network, to stay under the daily cap.
  useEffect(() => {
    if (!open) return
    let alive = true
    fetch('/api/outreach/mensaje/conteo')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (alive && j?.today) { setCounts(j.today); setForce(false) } })
      .catch(() => {})
    return () => { alive = false }
  }, [open])

  useEffect(() => {
    if (!open || !channel) return
    let alive = true
    // Deferred: generation starts after render, not inside the effect.
    const t = setTimeout(() => {
      setBusy('generate')
      fetch('/api/outreach/mensaje', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: contact.id, channel }) })
        .then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || r.statusText); return j })
        .then((j) => { if (alive) setText(j.text) })
        .catch((err) => toast.error(err instanceof Error ? err.message : String(err)))
        .finally(() => { if (alive) setBusy(null) })
    }, 0)
    return () => { alive = false; clearTimeout(t) }
  }, [open, channel, contact.id])

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(es ? 'Mensaje copiado. Pégalo en el chat.' : 'Message copied.')
    } catch {
      toast.error(es ? 'No se pudo copiar' : 'Could not copy')
    }
  }

  async function markSent() {
    if (!channel) return
    setBusy('sent')
    try {
      const r = await fetch('/api/outreach/mensaje/enviado', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: contact.id, channel, text }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      const sentSoFar = (counts?.[channel] ?? 0) + 1
      toast.success(es ? `Registrado · van ${sentSoFar} de ${CHANNEL_DAILY_CAP[channel]} hoy por ${CHANNEL_LABEL[channel]}` : `Logged · ${sentSoFar} of ${CHANNEL_DAILY_CAP[channel]} today on ${CHANNEL_LABEL[channel]}`)
      onClose()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(null)
    }
  }

  /** The contact data is no good for writing to them: leaves the queue without counting as sent. */
  async function discard(reason: SocialDiscardReason) {
    setBusy('discard')
    try {
      const r = await fetch('/api/outreach/mensaje/descartar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: contact.id, reason }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      toast.success(es ? 'Descartado de la cola de redes' : 'Removed from the social queue')
      onClose()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(null)
    }
  }

  const sentToday = channel && counts ? counts[channel] : 0
  const cap = channel ? capStatus(sentToday, channel) : 'ok'
  const blocked = cap === 'reached' && !force

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{es ? 'Mensaje para redes' : 'Social media message'} · {contact.name}</DialogTitle>
        </DialogHeader>
        {channels.length === 0 ? (
          <p className="text-sm text-muted-foreground">{es ? 'Este contacto no tiene redes ni teléfono registrados. Agrégalos en su ficha para escribirle.' : 'This contact has no social media or phone on file.'}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">{es ? 'Canal' : 'Channel'}</span>
              <Select value={channel ?? undefined} onValueChange={(v) => setChannel(v as Channel)}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {channels.map((c) => <SelectItem key={c.channel} value={c.channel}>{CHANNEL_LABEL[c.channel]}</SelectItem>)}
                </SelectContent>
              </Select>
              {busy === 'generate' && <span className="flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" />{es ? 'Escribiendo con IA…' : 'Writing with AI…'}</span>}
            </div>
            {channel && counts && (
              <div className={`rounded-md border p-3 text-sm ${cap === 'reached' ? 'border-destructive/50 bg-destructive/10 text-destructive' : cap === 'near' ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-muted/40 text-muted-foreground'}`}>
                <p className="font-medium tabular-nums">{es ? `Hoy llevas ${sentToday} de ${CHANNEL_DAILY_CAP[channel]} por ${CHANNEL_LABEL[channel]}` : `Today: ${sentToday} of ${CHANNEL_DAILY_CAP[channel]} on ${CHANNEL_LABEL[channel]}`}</p>
                {cap === 'reached' && (
                  <p className="mt-1">
                    {es ? 'Ya llegaste al tope de hoy. Si sigues, la red puede restringir tu cuenta; mejor continúa mañana. ' : 'You reached today\'s cap. Better continue tomorrow. '}
                    {!force && <button type="button" className="underline underline-offset-4" onClick={() => setForce(true)}>{es ? 'Enviar de todos modos' : 'Send anyway'}</button>}
                  </p>
                )}
                {cap === 'near' && <p className="mt-1">{es ? 'Estás cerca del tope de hoy.' : 'You are close to today\'s cap.'}</p>}
                {cap === 'ok' && <p className="mt-1 text-xs">{es ? 'Solo cuenta los que marcas con "Ya lo envié".' : 'Only counts messages marked as sent.'}</p>}
              </div>
            )}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              className="w-full rounded-md border bg-background p-3 text-sm leading-relaxed"
              style={{ fieldSizing: 'fixed' } as React.CSSProperties}
              placeholder={es ? 'Aquí aparece el mensaje…' : 'The message appears here…'}
            />
            <p className="text-xs text-muted-foreground">{text.length} {es ? 'caracteres' : 'characters'} · {es ? 'Edítalo si quieres antes de copiarlo.' : 'Edit it before copying if you like.'}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copy} disabled={!text || busy !== null || blocked}><Copy className="mr-2 h-4 w-4" />{es ? 'Copiar mensaje' : 'Copy message'}</Button>
              {current?.url && !blocked && (
                <Button variant="outline" asChild>
                  <a href={current.url} target="_blank" rel="noopener noreferrer">
                    {channel === 'whatsapp' ? <MessageCircle className="mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                    {channel === 'whatsapp' ? (es ? 'Abrir WhatsApp con el mensaje' : 'Open WhatsApp with the message') : `${es ? 'Abrir' : 'Open'} ${CHANNEL_LABEL[channel!]}`}
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={markSent} disabled={!text || busy !== null} title={es ? 'Lo registra en el historial del contacto y lo pasa a calificación' : 'Logs it and moves the contact to qualification'}>
                <Check className="mr-2 h-4 w-4" />{es ? 'Ya lo envié' : 'Already sent'}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" disabled={busy === 'sent' || busy === 'discard'} title={es ? 'Sácalo de la cola sin contarlo como enviado' : 'Remove it from the queue without counting it as sent'}>
                    <X className="mr-2 h-4 w-4" />{es ? 'Descartar' : 'Skip'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(Object.keys(SOCIAL_DISCARD_REASONS) as SocialDiscardReason[]).map((m) => (
                    <DropdownMenuItem key={m} onSelect={() => discard(m)}>{SOCIAL_DISCARD_REASONS[m]}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
