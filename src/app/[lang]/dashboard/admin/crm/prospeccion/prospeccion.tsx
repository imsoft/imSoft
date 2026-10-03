'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check, ChevronLeft, PartyPopper, ChevronRight, Copy, Eye, Loader2, Mail, RefreshCw, Send, Sparkles, X } from 'lucide-react'
import { cuerpoDe } from '@/lib/outreach'
import { celebracionDeEnvio, minutosDeLote, pausaEntreEnvios, type Celebracion } from '@/lib/envio-lote'
import { Confetti } from '@/components/documents/confetti'
import { CANALES, ETIQUETA_CANAL, estadoDelTope, type Canal, type ConteoPorCanal } from '@/lib/mensaje-red'

export interface FilaOutreach {
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
  gancho: string | null
  nombre: string
  empresa: string
  email: string
}

interface Props {
  lang: string
  gmail: { email: string } | null
  gmailConfigurado: boolean
  campana: { hoy: string; enviadosHoy: number; tope: number; restanHoy: number; diasDesdePrimerEnvio: number }
  /** Mensajes por redes registrados con "Ya lo envié": hoy, ultimos 7 dias y tope diario. */
  redes: { hoy: ConteoPorCanal; semana: ConteoPorCanal; topes: Record<Canal, number> }
  filas: FilaOutreach[]
  sinContactar: number
}

const PASO = { 1: 'Primer correo', 2: 'Seguimiento 1', 3: 'Seguimiento 2' }

export function Prospeccion({ lang, gmail, gmailConfigurado, campana, redes, filas, sinContactar }: Props) {
  const es = lang !== 'en'
  const router = useRouter()
  const sp = useSearchParams()
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [abierto, setAbierto] = useState<FilaOutreach | null>(null)
  const [subject, setSubject] = useState('')
  const [cuerpo, setCuerpo] = useState('')

  useEffect(() => {
    const id = sp.get('abrir')
    const f = id ? filas.find((x) => x.id === id) : null
    if (!f) return
    // Diferido: abrir el dialogo tras el render, no dentro del efecto.
    const t = setTimeout(() => {
      setAbierto(f)
      setSubject(f.subject)
      setCuerpo(cuerpoDe(f.text))
      router.replace(`/${lang}/dashboard/admin/crm/prospeccion`)
    }, 0)
    return () => clearTimeout(t)
  }, [sp, filas, lang, router])

  useEffect(() => {
    const g = sp.get('gmail')
    if (g === 'ok') toast.success(es ? `Gmail conectado: ${sp.get('email')}` : `Gmail connected: ${sp.get('email')}`)
    if (g === 'error') toast.error(`Gmail: ${sp.get('motivo')}`)
  }, [sp, es])

  const hoy = campana.hoy
  /**
   * Correos que ya salieron en el envio en lote en curso. Durante el lote NO se pide la
   * pagina de nuevo al servidor: si en ese momento hay una version nueva del sitio, Next
   * recarga la pestaña entera y el lote se corta (paso el 30-sep-2026 tras el primer envio).
   */
  const [yaSalieron, setYaSalieron] = useState<Set<string>>(new Set())
  const salieronSinRefrescar = useMemo(() => filas.filter((f) => f.status === 'draft' && yaSalieron.has(f.id)).length, [filas, yaSalieron])
  const borradores = useMemo(() => filas.filter((f) => f.status === 'draft' && !yaSalieron.has(f.id)), [filas, yaSalieron])
  /** Lo que queda del tope de hoy, descontando lo que ya salio en el lote en curso. */
  const restan = Math.max(0, campana.restanHoy - salieronSinRefrescar)
  const deHoy = borradores.filter((f) => f.scheduled_for <= hoy)
  const futuros = borradores.filter((f) => f.scheduled_for > hoy)
  const enCurso = filas.filter((f) => f.status === 'sent')
  const respondieron = filas.filter((f) => f.status === 'replied')

  async function llamar(ruta: string, clave: string, body?: unknown) {
    setOcupado(clave)
    try {
      const r = await fetch(ruta, { method: body === undefined ? 'POST' : 'POST', headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      router.refresh()
      return j
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
      return null
    } finally {
      setOcupado(null)
    }
  }

  async function generar() {
    const j = await llamar('/api/outreach/drafts', 'drafts', { limite: Math.max(campana.restanHoy, 5) })
    if (!j) return
    if (j.sinCandidatos) toast.info(es ? 'No hay prospectos sin contactar con correo.' : 'No uncontacted prospects with email.')
    else toast.success(es ? `${j.creados} borradores listos para revisar.` : `${j.creados} drafts ready to review.`)
    if (j.errores?.length) toast.error(j.errores.join('\n'))
  }

  /**
   * Al abrir Prospeccion se buscan solos los rebotes, las respuestas y los seguimientos
   * que ya tocan, como mucho cada 3 horas. Antes dependia de acordarse de pulsar el boton
   * y los rebotes se quedaban dias sin registrar (8 de 16 el 3-oct-2026).
   */
  const autoSync = useRef(false)
  useEffect(() => {
    if (autoSync.current || !gmail) return
    autoSync.current = true
    let ultima = 0
    try { ultima = Number(window.localStorage.getItem('imsoft-outreach-sync') ?? 0) } catch { /* sin almacenamiento */ }
    if (Date.now() - ultima < 3 * 3_600_000) return
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/api/outreach/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) return
        try { window.localStorage.setItem('imsoft-outreach-sync', String(Date.now())) } catch { /* sin almacenamiento */ }
        const novedades = (j.respondieron ?? 0) + (j.rebotaron ?? 0) + (j.seguimientosCreados ?? 0)
        if (novedades === 0) return
        if (j.respondieron) toast.success(es ? `${j.respondieron} ${j.respondieron === 1 ? 'prospecto respondió' : 'prospectos respondieron'}` : `${j.respondieron} replied`, { duration: 15_000 })
        toast.info(es ? `Revisión automática: ${j.rebotaron ?? 0} rebotaron · ${j.seguimientosCreados ?? 0} seguimientos listos` : `Auto check: ${j.rebotaron ?? 0} bounced · ${j.seguimientosCreados ?? 0} follow-ups ready`)
        router.refresh()
      } catch { /* se intentara la proxima vez */ }
    }, 1500)
    return () => clearTimeout(t)
  }, [gmail, es, router])

  async function sincronizar() {
    const j = await llamar('/api/outreach/sync', 'sync', {})
    if (!j) return
    try { window.localStorage.setItem('imsoft-outreach-sync', String(Date.now())) } catch { /* sin almacenamiento */ }
    toast.success(es ? `${j.respondieron} respondieron · ${j.rebotaron ?? 0} rebotaron · ${j.seguimientosCreados} seguimientos nuevos · ${j.cerrados} cerrados` : `${j.respondieron} replied · ${j.seguimientosCreados} new follow-ups · ${j.cerrados} closed`)
    if (j.errores?.length) toast.error(j.errores.join('\n'))
  }

  async function enviar(f: FilaOutreach) {
    const j = await llamar(`/api/outreach/${f.id}/send`, `send-${f.id}`, {})
    if (j) toast.success(es ? `Enviado a ${f.empresa || f.email}${j.siguiente ? ` · seguimiento el ${j.siguiente}` : ''}` : `Sent to ${f.empresa || f.email}`)
    if (abierto?.id === f.id) setAbierto(null)
    if (j) {
      const enviadosHoy = campana.enviadosHoy + salieronSinRefrescar + 1
      const c = celebracionDeEnvio({ enviados: 1, total: 1, errores: 0, detenido: false, enviadosHoy, tope: campana.tope })
      if (c) setFiesta({ ...c, enviadosHoy })
    }
  }

  /** El correo salio por otro camino (copiado a Gmail, WhatsApp...). */
  async function yaEnviado(f: FilaOutreach) {
    const j = await llamar(`/api/outreach/${f.id}/manual`, `manual-${f.id}`, {})
    if (j) toast.success(es ? `Registrado como enviado · ${f.empresa || f.email} pasa a calificación${j.siguiente ? ` · seguimiento el ${j.siguiente}` : ''}` : `Marked as sent · ${f.empresa || f.email} moved to qualification`)
    if (abierto?.id === f.id) setAbierto(null)
  }

  // ----- Envio en lote: uno por uno, con pausa entre cada correo -----
  const [confirmarLote, setConfirmarLote] = useState(false)
  const [lote, setLote] = useState<{ i: number; total: number; actual: string; espera: number; pausa: number; enviados: number; errores: string[] } | null>(null)
  const detener = useRef(false)
  /** Festejo al completar el limite del dia o un lote entero. */
  const [fiesta, setFiesta] = useState<(Celebracion & { enviadosHoy: number }) | null>(null)
  /** Revision antes de enviar: que correo se esta viendo y cuales se dejan fuera de este envio. */
  const [previa, setPrevia] = useState(0)
  const [fuera, setFuera] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!lote) return
    const avisar = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [lote])

  async function enviarTodos() {
    setConfirmarLote(false)
    // Foto de la lista al empezar: la pagina se refresca tras cada envio.
    const lista = filas.filter((f) => f.status === 'draft' && f.scheduled_for <= campana.hoy && !fuera.has(f.id) && !yaSalieron.has(f.id)).slice(0, restan)
    if (lista.length === 0) return
    const yaHoy = campana.enviadosHoy + salieronSinRefrescar
    detener.current = false
    setOcupado('lote')
    let enviados = 0
    const errores: string[] = []
    for (let i = 0; i < lista.length; i++) {
      if (detener.current) break
      const f = lista[i]
      setLote({ i, total: lista.length, actual: f.empresa || f.email, espera: 0, pausa: 0, enviados, errores })
      try {
        const r = await fetch(`/api/outreach/${f.id}/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.error || r.statusText)
        enviados += 1
        setYaSalieron((prev) => new Set(prev).add(f.id))
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errores.push(`${f.empresa || f.email}: ${msg}`)
        // Tope del dia o Gmail desconectado: seguir solo daria el mismo error en cada uno.
        if (/tope de hoy|Gmail/i.test(msg)) break
      }
      if (i < lista.length - 1 && !detener.current) {
        const pausa = pausaEntreEnvios()
        const hasta = Date.now() + pausa
        while (Date.now() < hasta && !detener.current) {
          setLote({ i, total: lista.length, actual: lista[i + 1].empresa || lista[i + 1].email, espera: Math.ceil((hasta - Date.now()) / 1000), pausa: Math.round(pausa / 1000), enviados, errores })
          await new Promise((ok) => setTimeout(ok, 1000))
        }
      }
    }
    setLote(null)
    setOcupado(null)
    router.refresh()
    const texto = es ? `${enviados} de ${lista.length} ${lista.length === 1 ? 'correo enviado' : 'correos enviados'}${detener.current ? ' (detenido)' : ''}` : `${enviados} of ${lista.length} emails sent`
    const enviadosHoy = yaHoy + enviados
    const c = celebracionDeEnvio({ enviados, total: lista.length, errores: errores.length, detenido: detener.current, enviadosHoy, tope: campana.tope })
    if (c) setFiesta({ ...c, enviadosHoy })
    if (errores.length) toast.error(texto, { description: errores.slice(0, 5).join('\n'), duration: 20_000 })
    else if (!c) toast.success(texto)
  }

  async function saltar(f: FilaOutreach) {
    if (await llamar(`/api/outreach/${f.id}/skip`, `skip-${f.id}`, {})) toast.success(es ? 'Descartado' : 'Skipped')
    if (abierto?.id === f.id) setAbierto(null)
  }

  async function copiar(valor: string, msg: string) {
    try {
      await navigator.clipboard.writeText(valor)
      toast.success(msg)
    } catch {
      toast.error(es ? 'No se pudo copiar' : 'Could not copy')
    }
  }

  /** Copia el correo con formato (HTML + texto): al pegarlo en Gmail conserva el diseño. */
  async function copiarConFormato(html: string, text: string) {
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      })
      await navigator.clipboard.write([item])
      toast.success(es ? 'Correo copiado con formato. Pégalo en un mensaje nuevo de Gmail.' : 'Email copied with formatting. Paste it into a new Gmail message.')
    } catch {
      await copiar(text, es ? 'Copiado como texto (el navegador no permite copiar con formato)' : 'Copied as plain text')
    }
  }

  function abrir(f: FilaOutreach) {
    setAbierto(f)
    setSubject(f.subject)
    setCuerpo(cuerpoDe(f.text))
  }

  async function guardar() {
    if (!abierto) return
    setOcupado('save')
    try {
      const r = await fetch(`/api/outreach/${abierto.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, cuerpo }) })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      setAbierto({ ...abierto, subject: j.subject, html: j.html, text: j.text })
      toast.success(es ? 'Guardado' : 'Saved')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setOcupado(null)
    }
  }

  const puedeEnviar = Boolean(gmail) && restan > 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Gmail</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {gmail ? (
              <>
                <p className="font-medium">{gmail.email}</p>
                <Button variant="outline" size="sm" disabled={ocupado === 'disc'} onClick={async () => { if (await llamar('/api/gmail/disconnect', 'disc', {})) toast.success(es ? 'Gmail desconectado' : 'Gmail disconnected') }}>{es ? 'Desconectar' : 'Disconnect'}</Button>
              </>
            ) : gmailConfigurado ? (
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
            <p className="text-3xl font-bold tabular-nums">{campana.enviadosHoy + salieronSinRefrescar} <span className="text-base font-normal text-muted-foreground">/ {campana.tope}</span></p>
            <p className="text-sm text-muted-foreground">{es ? `Tope de la rampa (día ${campana.diasDesdePrimerEnvio + 1} de la campaña). Reparte los envíos a lo largo del día.` : `Ramp cap (campaign day ${campana.diasDesdePrimerEnvio + 1}). Spread sends through the day.`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{es ? 'Mensajes por redes hoy' : 'Social messages today'}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {CANALES.filter((c) => c === 'whatsapp' || c === 'instagram' || redes.semana[c] > 0).map((c) => {
              const e = estadoDelTope(redes.hoy[c], c)
              return (
                <p key={c} className="flex justify-between gap-3">
                  <span>{ETIQUETA_CANAL[c]}</span>
                  <span className={`font-medium tabular-nums ${e === 'tope' ? 'text-destructive' : e === 'cerca' ? 'text-amber-600' : ''}`}>{redes.hoy[c]} / {redes.topes[c]}</span>
                </p>
              )
            })}
            <p className="pt-1 text-xs text-muted-foreground">{es ? `Últimos 7 días: ${CANALES.reduce((n, c) => n + redes.semana[c], 0)}. Cuenta los marcados con "Ya lo envié".` : `Last 7 days: ${CANALES.reduce((n, c) => n + redes.semana[c], 0)}. Counts messages marked as sent.`}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{es ? 'Embudo' : 'Funnel'}</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1">
            <p>{sinContactar} {es ? 'sin contactar (con correo)' : 'uncontacted (with email)'}</p>
            <p>{enCurso.length} {es ? 'correos esperando respuesta' : 'emails awaiting reply'}</p>
            <p>{respondieron.length} {es ? 'respondieron' : 'replied'}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={generar} disabled={ocupado !== null || sinContactar === 0}><Sparkles className="mr-2 h-4 w-4" />{ocupado === 'drafts' ? (es ? 'Generando…' : 'Generating…') : es ? 'Generar borradores' : 'Generate drafts'}</Button>
        <Button variant="outline" onClick={sincronizar} disabled={ocupado !== null || !gmail}><RefreshCw className="mr-2 h-4 w-4" />{ocupado === 'sync' ? (es ? 'Sincronizando…' : 'Syncing…') : es ? 'Buscar respuestas y seguimientos' : 'Check replies and follow-ups'}</Button>
        {deHoy.length > 1 && (
          <Button variant="outline" onClick={() => { setPrevia(0); setFuera(new Set()); setConfirmarLote(true) }} disabled={ocupado !== null || !puedeEnviar}><Send className="mr-2 h-4 w-4" />{es ? `Enviar todos (${Math.min(deHoy.length, restan)})` : `Send all (${Math.min(deHoy.length, restan)})`}</Button>
        )}
      </div>

      {lote && (
        <div className="overflow-hidden rounded-lg border border-primary/30 bg-primary/5" role="status" aria-live="polite">
          <div className="flex flex-wrap items-center gap-3 p-4 text-sm">
            {lote.espera > 0 ? <Send className="h-5 w-5 shrink-0 animate-pulse text-primary" aria-hidden /> : <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden />}
            <div className="min-w-0 flex-1">
              <p className="font-semibold tabular-nums">
                {lote.espera > 0
                  ? (es ? `${lote.enviados} de ${lote.total} enviados` : `${lote.enviados} of ${lote.total} sent`)
                  : (es ? `Enviando ${lote.i + 1} de ${lote.total}` : `Sending ${lote.i + 1} of ${lote.total}`)}
                {lote.espera === 0 && (
                  <span className="ml-0.5 inline-flex w-5 justify-start" aria-hidden>
                    <span className="animate-bounce [animation-delay:0ms]">.</span>
                    <span className="animate-bounce [animation-delay:150ms]">.</span>
                    <span className="animate-bounce [animation-delay:300ms]">.</span>
                  </span>
                )}
              </p>
              <p className="truncate text-muted-foreground">
                {lote.espera > 0
                  ? (es ? `Siguiente: ${lote.actual}, en ${lote.espera} s` : `Next: ${lote.actual}, in ${lote.espera}s`)
                  : (es ? `Saliendo por Gmail a ${lote.actual}` : `Going out through Gmail to ${lote.actual}`)}
                {lote.errores.length > 0 && <span className="text-destructive">{es ? ` · ${lote.errores.length} con error` : ` · ${lote.errores.length} failed`}</span>}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">{es ? 'No cierres esta pestaña.' : 'Keep this tab open.'}</span>
            <span className="text-sm font-semibold tabular-nums text-primary">{Math.round((lote.enviados / lote.total) * 100)}%</span>
            <Button size="sm" variant="outline" onClick={() => { detener.current = true }}>{es ? 'Detener' : 'Stop'}</Button>
          </div>
          {/* Avance del lote */}
          <div className="h-1.5 w-full bg-primary/15" role="progressbar" aria-valuemin={0} aria-valuemax={lote.total} aria-valuenow={lote.enviados}>
            <div className="relative h-full overflow-hidden rounded-r-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${Math.max(3, Math.round(((lote.enviados + (lote.espera > 0 ? 0 : 0.5)) / lote.total) * 100))}%` }}>
              <div className="absolute inset-0 animate-pulse bg-white/40" />
            </div>
          </div>
          {/* Cuenta regresiva de la pausa entre dos correos */}
          {lote.espera > 0 && lote.pausa > 0 && (
            <div className="h-0.5 w-full bg-transparent">
              <div className="h-full bg-primary/40 transition-[width] duration-1000 ease-linear" style={{ width: `${Math.round((lote.espera / lote.pausa) * 100)}%` }} />
            </div>
          )}
        </div>
      )}

      <Cola titulo={es ? `Para enviar hoy (${deHoy.length})` : `To send today (${deHoy.length})`} filas={deHoy} vacio={es ? 'Nada pendiente. Genera borradores o sincroniza para ver seguimientos.' : 'Nothing pending.'} abrir={abrir} enviar={enviar} saltar={saltar} ocupado={ocupado} puedeEnviar={puedeEnviar} es={es} />
      {futuros.length > 0 && <Cola titulo={es ? `Programados (${futuros.length})` : `Scheduled (${futuros.length})`} filas={futuros} vacio="" abrir={abrir} enviar={enviar} saltar={saltar} ocupado={ocupado} puedeEnviar={puedeEnviar} es={es} />}
      <Cola titulo={es ? `Enviados, esperando respuesta (${enCurso.length})` : `Sent, awaiting reply (${enCurso.length})`} filas={enCurso} vacio={es ? 'Todavía no hay envíos.' : 'No sends yet.'} abrir={abrir} enviar={enviar} saltar={saltar} ocupado={ocupado} puedeEnviar={false} es={es} />
      {respondieron.length > 0 && <Cola titulo={es ? `Respondieron (${respondieron.length})` : `Replied (${respondieron.length})`} filas={respondieron} vacio="" abrir={abrir} enviar={enviar} saltar={saltar} ocupado={ocupado} puedeEnviar={false} es={es} />}

      <Dialog open={abierto !== null} onOpenChange={(o) => !o && setAbierto(null)}>
        <DialogContent className="sm:max-w-6xl max-h-[92vh] overflow-y-auto">
          {abierto && (
            <>
              <DialogHeader>
                <DialogTitle>{PASO[abierto.step]} · {abierto.empresa || abierto.nombre} <span className="font-normal text-muted-foreground">&lt;{abierto.email}&gt;</span></DialogTitle>
              </DialogHeader>
              {(() => {
                const esBorrador = abierto.status === 'draft'
                const sucio = esBorrador && (subject !== abierto.subject || cuerpo !== cuerpoDe(abierto.text))
                const htmlPreview = abierto.html
                return (
                  <div className="min-w-0 space-y-4">
                    {/* Fila 1: asunto a lo ancho */}
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="w-16 shrink-0 text-xs font-medium text-muted-foreground">{es ? 'Asunto' : 'Subject'}</label>
                      {esBorrador ? (
                        <Input className="min-w-0 flex-1" value={subject} onChange={(e) => setSubject(e.target.value)} />
                      ) : (
                        <p className="min-w-0 flex-1 text-sm">{abierto.subject}</p>
                      )}
                      <Button size="sm" variant="outline" onClick={() => copiar(esBorrador ? subject : abierto.subject, es ? 'Asunto copiado' : 'Subject copied')}><Copy className="mr-1 h-3.5 w-3.5" />{es ? 'Copiar asunto' : 'Copy subject'}</Button>
                      <Button size="sm" variant="outline" onClick={() => copiarConFormato(htmlPreview, abierto.text)}><Copy className="mr-1 h-3.5 w-3.5" />{es ? 'Copiar para pegar en Gmail' : 'Copy for Gmail'}</Button>
                    </div>

                    {/* Fila 2: cuerpo y vista previa a la par */}
                    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div className="flex min-w-0 flex-col gap-2">
                        <label className="text-xs font-medium text-muted-foreground">{es ? 'Mensaje (el botón de WhatsApp y la línea legal se agregan solos; sin firma)' : 'Message (WhatsApp button and legal line are added automatically; no signature)'}</label>
                        {esBorrador ? (
                          <textarea
                            className="h-[60vh] w-full min-w-0 resize-none rounded-md border-2 border-border/90 bg-transparent px-3 py-2 text-sm leading-relaxed shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            style={{ fieldSizing: 'fixed' } as React.CSSProperties}
                            value={cuerpo}
                            onChange={(e) => setCuerpo(e.target.value)}
                          />
                        ) : (
                          <pre className="h-[60vh] min-w-0 overflow-auto whitespace-pre-wrap break-words rounded-md border bg-muted/30 p-3 font-sans text-sm leading-relaxed">{cuerpoDe(abierto.text)}</pre>
                        )}
                        {!esBorrador && <p className="text-xs text-muted-foreground">{es ? 'Enviado: ' : 'Sent: '}{abierto.sent_at ? new Date(abierto.sent_at).toLocaleString(es ? 'es-MX' : 'en-US') : '—'} ({abierto.sent_via})</p>}
                      </div>
                      <div className="flex min-w-0 flex-col gap-2">
                        <label className="text-xs font-medium text-muted-foreground">{es ? 'Vista previa' : 'Preview'}</label>
                        <iframe title="preview" className="h-[60vh] w-full min-w-0 rounded-md border bg-white" sandbox="" srcDoc={htmlPreview} />
                      </div>
                    </div>

                    {esBorrador && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={guardar} disabled={ocupado !== null}>{ocupado === 'save' ? (es ? 'Guardando…' : 'Saving…') : es ? 'Guardar cambios' : 'Save changes'}</Button>
                        <Button onClick={() => enviar(abierto)} disabled={ocupado !== null || !puedeEnviar || sucio}><Send className="mr-2 h-4 w-4" />{es ? 'Enviar por Gmail' : 'Send via Gmail'}</Button>
                        <Button variant="outline" onClick={() => yaEnviado(abierto)} disabled={ocupado !== null || sucio} title={es ? 'Si lo copiaste y lo mandaste tú desde Gmail o WhatsApp' : 'If you copied it and sent it yourself'}><Check className="mr-2 h-4 w-4" />{es ? 'Ya lo envié' : 'Already sent'}</Button>
                        <Button variant="ghost" onClick={() => saltar(abierto)} disabled={ocupado !== null}><X className="mr-2 h-4 w-4" />{es ? 'Descartar' : 'Skip'}</Button>
                        {sucio && <p className="text-xs text-muted-foreground">{es ? 'Guarda los cambios para actualizar la vista previa y poder enviar.' : 'Save your changes to refresh the preview and send.'}</p>}
                        {!sucio && <p className="w-full text-xs text-muted-foreground">{es ? 'Enviar por Gmail o "Ya lo envié" registran el correo en el CRM, pasan al prospecto a calificación y agendan el seguimiento.' : 'Both buttons log the email in the CRM, move the prospect to qualification and schedule the follow-up.'}</p>}
                      </div>
                    )}
                  </div>
                )
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={fiesta !== null} onOpenChange={(o) => { if (!o) setFiesta(null) }}>
        <DialogContent className="sm:max-w-md text-center">
          {fiesta && (
            <>
              <Confetti delayMs={150} />
              <div className="mx-auto mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <PartyPopper className="h-8 w-8 text-primary" aria-hidden />
              </div>
              <DialogHeader className="items-center text-center sm:text-center">
                <DialogTitle className="text-2xl">{es ? fiesta.titulo : fiesta.tipo === 'meta' ? 'Daily goal reached!' : 'Emails sent!'}</DialogTitle>
                <DialogDescription className="text-center">{es ? fiesta.texto : `${fiesta.enviadosHoy} of ${campana.tope} emails went out today.`}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-2xl font-bold tabular-nums">{fiesta.enviadosHoy}<span className="text-base font-normal text-muted-foreground"> / {campana.tope}</span></p>
                  <p className="text-muted-foreground">{es ? 'enviados hoy' : 'sent today'}</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-2xl font-bold tabular-nums">{enCurso.length}</p>
                  <p className="text-muted-foreground">{es ? 'esperando respuesta' : 'awaiting reply'}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {fiesta.tipo === 'meta'
                  ? (es ? 'Mañana se renueva tu límite. Los seguimientos se preparan solos cuando les toca.' : 'Your limit renews tomorrow.')
                  : (es ? `Hoy todavía caben ${Math.max(0, campana.tope - fiesta.enviadosHoy)} más.` : `${Math.max(0, campana.tope - fiesta.enviadosHoy)} more fit today.`)}
              </p>
              <DialogFooter className="sm:justify-center">
                <Button onClick={() => setFiesta(null)}>{es ? '¡Listo!' : 'Done!'}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmarLote} onOpenChange={setConfirmarLote}>
        <DialogContent className="sm:max-w-3xl">
          {(() => {
            const candidatos = deHoy.slice(0, restan + fuera.size).filter((f, i, all) => all.indexOf(f) === i)
            const aEnviar = candidatos.filter((f) => !fuera.has(f.id)).slice(0, restan)
            const idx = Math.min(previa, Math.max(0, candidatos.length - 1))
            const f = candidatos[idx]
            const excluido = f ? fuera.has(f.id) : false
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{es ? `Revisar y enviar ${aEnviar.length} ${aEnviar.length === 1 ? 'correo' : 'correos'}` : `Review and send ${aEnviar.length}`}</DialogTitle>
                  <DialogDescription>
                    {es
                      ? `Así van a salir. Cada uno se envía por Gmail con 20 a 45 segundos de pausa; tarda ${minutosDeLote(aEnviar.length) === 1 ? 'cerca de un minuto' : `unos ${minutosDeLote(aEnviar.length)} minutos`} y necesita esta pestaña abierta.`
                      : `This is how they will go out, 20 to 45 seconds apart, about ${minutosDeLote(aEnviar.length)} minutes. Keep this tab open.`}
                  </DialogDescription>
                </DialogHeader>
                {f && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setPrevia(Math.max(0, idx - 1))} disabled={idx === 0} aria-label={es ? 'Correo anterior' : 'Previous email'}><ChevronLeft className="h-4 w-4" /></Button>
                      <span className="text-sm font-medium tabular-nums">{idx + 1} {es ? 'de' : 'of'} {candidatos.length}</span>
                      <Button size="sm" variant="outline" onClick={() => setPrevia(Math.min(candidatos.length - 1, idx + 1))} disabled={idx >= candidatos.length - 1} aria-label={es ? 'Correo siguiente' : 'Next email'}><ChevronRight className="h-4 w-4" /></Button>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className={`truncate font-medium ${excluido ? 'text-muted-foreground line-through' : ''}`}>{f.empresa || '—'} <span className="font-normal text-muted-foreground">&lt;{f.email}&gt;</span></p>
                      </div>
                      <Button size="sm" variant={excluido ? 'default' : 'ghost'} onClick={() => setFuera((s) => { const n = new Set(s); if (n.has(f.id)) n.delete(f.id); else n.add(f.id); return n })}>
                        {excluido ? (es ? 'Volver a incluir' : 'Include again') : (es ? 'Dejar fuera de este envío' : 'Leave out')}
                      </Button>
                    </div>
                    <p className="truncate text-sm"><span className="text-muted-foreground">{es ? 'Asunto: ' : 'Subject: '}</span>{f.subject}</p>
                    <iframe title={es ? 'Vista previa del correo' : 'Email preview'} className={`h-[48vh] w-full rounded-md border bg-white ${excluido ? 'opacity-40' : ''}`} sandbox="" srcDoc={f.html} />
                    <p className="text-xs text-muted-foreground">{es ? 'Para corregir el texto, cierra esta ventana y abre el correo desde la lista. Un correo dejado fuera se queda como borrador.' : 'To edit the text, close this window and open the email from the list.'}</p>
                  </div>
                )}
                {deHoy.length > restan && <p className="text-sm text-amber-600">{es ? `Hoy solo caben ${restan} por el tope diario; los demás quedan para mañana.` : `Only ${restan} fit in today's cap.`}</p>}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmarLote(false)}>{es ? 'Todavía no' : 'Not yet'}</Button>
                  <Button onClick={enviarTodos} disabled={aEnviar.length === 0}><Send className="mr-2 h-4 w-4" />{es ? `Enviar ${aEnviar.length}` : `Send ${aEnviar.length}`}</Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Cola({ titulo, filas, vacio, abrir, enviar, saltar, ocupado, puedeEnviar, es }: { titulo: string; filas: FilaOutreach[]; vacio: string; abrir: (f: FilaOutreach) => void; enviar: (f: FilaOutreach) => void; saltar: (f: FilaOutreach) => void; ocupado: string | null; puedeEnviar: boolean; es: boolean }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      {filas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{vacio}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-3 text-left">{es ? 'Empresa' : 'Company'}</th>
                <th className="p-3 text-left">{es ? 'Contacto' : 'Contact'}</th>
                <th className="p-3 text-left">{es ? 'Paso' : 'Step'}</th>
                <th className="p-3 text-left">{es ? 'Asunto' : 'Subject'}</th>
                <th className="p-3 text-left">{es ? 'Fecha' : 'Date'}</th>
                <th className="p-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium"><button className="underline underline-offset-4" onClick={() => abrir(f)}>{f.empresa || '—'}</button></td>
                  <td className="p-3">{f.nombre}<div className="text-xs text-muted-foreground">{f.email}</div></td>
                  <td className="p-3"><Badge variant={f.step === 1 ? 'default' : 'secondary'}>{PASO[f.step]}</Badge></td>
                  <td className="p-3 max-w-[280px] truncate">{f.subject}</td>
                  <td className="p-3 whitespace-nowrap">{f.status === 'draft' ? f.scheduled_for : f.sent_at?.slice(0, 10)}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button size="sm" variant="ghost" onClick={() => abrir(f)} title={es ? 'Ver el correo' : 'View email'}><Eye className="mr-1 h-3.5 w-3.5" />{es ? 'Ver' : 'View'}</Button>
                    {f.status === 'draft' && (
                      <>
                        <Button size="sm" onClick={() => enviar(f)} disabled={ocupado !== null || !puedeEnviar}><Send className="mr-1 h-3.5 w-3.5" />{ocupado === `send-${f.id}` ? '…' : es ? 'Enviar' : 'Send'}</Button>
                        <Button size="sm" variant="ghost" onClick={() => saltar(f)} disabled={ocupado !== null}><X className="h-3.5 w-3.5" /></Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
