'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, Copy, ExternalLink, MessageCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { canalesDe, estadoDelTope, ETIQUETA_CANAL, TOPE_DIARIO_CANAL, type Canal, type ConteoPorCanal } from '@/lib/mensaje-red'
import type { SocialLink } from '@/types/database'

export interface ContactoParaMensaje {
  id: string
  nombre: string
  social_links?: SocialLink[] | null
  instagram_url?: string | null
  phone?: string | null
}

interface Props {
  contacto: ContactoParaMensaje
  lang: string
  abierto: boolean
  onClose: () => void
}

/**
 * Mensaje de prospeccion para una red social: se genera con el mismo gancho del correo,
 * se copia o se abre la red, y "Ya lo envie" lo deja en el historial y cambia el estado.
 */
export function MensajeRedDialog({ contacto, lang, abierto, onClose }: Props) {
  const es = lang !== 'en'
  const router = useRouter()
  const [texto, setTexto] = useState('')
  const [canal, setCanal] = useState<Canal | null>(null)
  const [ocupado, setOcupado] = useState<'generar' | 'enviado' | null>(null)
  const [conteo, setConteo] = useState<ConteoPorCanal | null>(null)
  const [forzar, setForzar] = useState(false)
  const canales = useMemo(() => canalesDe(contacto, texto), [contacto, texto])
  const actual = canales.find((c) => c.canal === canal) ?? null

  useEffect(() => {
    if (!abierto) return
    const primero = canalesDe(contacto)[0]?.canal ?? null
    // Diferido: fijar el canal inicial tras abrir, no dentro del render.
    const t = setTimeout(() => { setCanal(primero); setTexto('') }, 0)
    return () => clearTimeout(t)
  }, [abierto, contacto])

  // Cuantos van hoy por cada red, para no pasarse del tope diario.
  useEffect(() => {
    if (!abierto) return
    let vivo = true
    fetch('/api/outreach/mensaje/conteo')
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (vivo && j?.hoy) { setConteo(j.hoy); setForzar(false) } })
      .catch(() => {})
    return () => { vivo = false }
  }, [abierto])

  useEffect(() => {
    if (!abierto || !canal) return
    let vivo = true
    // Diferido: la generacion arranca tras el render, no dentro del efecto.
    const t = setTimeout(() => {
      setOcupado('generar')
      fetch('/api/outreach/mensaje', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: contacto.id, canal }) })
        .then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || r.statusText); return j })
        .then((j) => { if (vivo) setTexto(j.texto) })
        .catch((err) => toast.error(err instanceof Error ? err.message : String(err)))
        .finally(() => { if (vivo) setOcupado(null) })
    }, 0)
    return () => { vivo = false; clearTimeout(t) }
  }, [abierto, canal, contacto.id])

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      toast.success(es ? 'Mensaje copiado. Pégalo en el chat.' : 'Message copied.')
    } catch {
      toast.error(es ? 'No se pudo copiar' : 'Could not copy')
    }
  }

  async function yaEnviado() {
    if (!canal) return
    setOcupado('enviado')
    try {
      const r = await fetch('/api/outreach/mensaje/enviado', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId: contacto.id, canal, texto }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      const van = (conteo?.[canal] ?? 0) + 1
      toast.success(es ? `Registrado · van ${van} de ${TOPE_DIARIO_CANAL[canal]} hoy por ${ETIQUETA_CANAL[canal]}` : `Logged · ${van} of ${TOPE_DIARIO_CANAL[canal]} today on ${ETIQUETA_CANAL[canal]}`)
      onClose()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setOcupado(null)
    }
  }

  const enviadosHoy = canal && conteo ? conteo[canal] : 0
  const tope = canal ? estadoDelTope(enviadosHoy, canal) : 'bien'
  const frenado = tope === 'tope' && !forzar

  return (
    <Dialog open={abierto} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{es ? 'Mensaje para redes' : 'Social media message'} · {contacto.nombre}</DialogTitle>
        </DialogHeader>
        {canales.length === 0 ? (
          <p className="text-sm text-muted-foreground">{es ? 'Este contacto no tiene redes ni teléfono registrados. Agrégalos en su ficha para escribirle.' : 'This contact has no social media or phone on file.'}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">{es ? 'Canal' : 'Channel'}</span>
              <Select value={canal ?? undefined} onValueChange={(v) => setCanal(v as Canal)}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {canales.map((c) => <SelectItem key={c.canal} value={c.canal}>{ETIQUETA_CANAL[c.canal]}</SelectItem>)}
                </SelectContent>
              </Select>
              {ocupado === 'generar' && <span className="flex items-center gap-2 text-sm text-muted-foreground"><RefreshCw className="h-4 w-4 animate-spin" />{es ? 'Escribiendo con IA…' : 'Writing with AI…'}</span>}
            </div>
            {canal && conteo && (
              <div className={`rounded-md border p-3 text-sm ${tope === 'tope' ? 'border-destructive/50 bg-destructive/10 text-destructive' : tope === 'cerca' ? 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400' : 'bg-muted/40 text-muted-foreground'}`}>
                <p className="font-medium tabular-nums">{es ? `Hoy llevas ${enviadosHoy} de ${TOPE_DIARIO_CANAL[canal]} por ${ETIQUETA_CANAL[canal]}` : `Today: ${enviadosHoy} of ${TOPE_DIARIO_CANAL[canal]} on ${ETIQUETA_CANAL[canal]}`}</p>
                {tope === 'tope' && (
                  <p className="mt-1">
                    {es ? 'Ya llegaste al tope de hoy. Si sigues, la red puede restringir tu cuenta; mejor continúa mañana. ' : 'You reached today\'s cap. Better continue tomorrow. '}
                    {!forzar && <button type="button" className="underline underline-offset-4" onClick={() => setForzar(true)}>{es ? 'Enviar de todos modos' : 'Send anyway'}</button>}
                  </p>
                )}
                {tope === 'cerca' && <p className="mt-1">{es ? 'Estás cerca del tope de hoy.' : 'You are close to today\'s cap.'}</p>}
                {tope === 'bien' && <p className="mt-1 text-xs">{es ? 'Solo cuenta los que marcas con "Ya lo envié".' : 'Only counts messages marked as sent.'}</p>}
              </div>
            )}
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={9}
              className="w-full rounded-md border bg-background p-3 text-sm leading-relaxed"
              style={{ fieldSizing: 'fixed' } as React.CSSProperties}
              placeholder={es ? 'Aquí aparece el mensaje…' : 'The message appears here…'}
            />
            <p className="text-xs text-muted-foreground">{texto.length} {es ? 'caracteres' : 'characters'} · {es ? 'Edítalo si quieres antes de copiarlo.' : 'Edit it before copying if you like.'}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copiar} disabled={!texto || ocupado !== null || frenado}><Copy className="mr-2 h-4 w-4" />{es ? 'Copiar mensaje' : 'Copy message'}</Button>
              {actual?.url && !frenado && (
                <Button variant="outline" asChild>
                  <a href={actual.url} target="_blank" rel="noopener noreferrer">
                    {canal === 'whatsapp' ? <MessageCircle className="mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                    {canal === 'whatsapp' ? (es ? 'Abrir WhatsApp con el mensaje' : 'Open WhatsApp with the message') : `${es ? 'Abrir' : 'Open'} ${ETIQUETA_CANAL[canal!]}`}
                  </a>
                </Button>
              )}
              <Button variant="outline" onClick={yaEnviado} disabled={!texto || ocupado !== null} title={es ? 'Lo registra en el historial del contacto y lo pasa a calificación' : 'Logs it and moves the contact to qualification'}>
                <Check className="mr-2 h-4 w-4" />{es ? 'Ya lo envié' : 'Already sent'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
