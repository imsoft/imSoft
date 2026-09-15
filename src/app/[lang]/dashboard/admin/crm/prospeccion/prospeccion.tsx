'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Copy, Mail, RefreshCw, Send, Sparkles, X } from 'lucide-react'
import { cuerpoDe, sinFirma } from '@/lib/outreach'

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
  filas: FilaOutreach[]
  sinContactar: number
}

const PASO = { 1: 'Primer correo', 2: 'Seguimiento 1', 3: 'Seguimiento 2' }

export function Prospeccion({ lang, gmail, gmailConfigurado, campana, filas, sinContactar }: Props) {
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
  const borradores = useMemo(() => filas.filter((f) => f.status === 'draft'), [filas])
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

  async function sincronizar() {
    const j = await llamar('/api/outreach/sync', 'sync', {})
    if (!j) return
    toast.success(es ? `${j.respondieron} respondieron · ${j.seguimientosCreados} seguimientos nuevos · ${j.cerrados} cerrados` : `${j.respondieron} replied · ${j.seguimientosCreados} new follow-ups · ${j.cerrados} closed`)
    if (j.errores?.length) toast.error(j.errores.join('\n'))
  }

  async function enviar(f: FilaOutreach) {
    const j = await llamar(`/api/outreach/${f.id}/send`, `send-${f.id}`, {})
    if (j) toast.success(es ? `Enviado a ${f.empresa || f.email}${j.siguiente ? ` · seguimiento el ${j.siguiente}` : ''}` : `Sent to ${f.empresa || f.email}`)
    if (abierto?.id === f.id) setAbierto(null)
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

  const puedeEnviar = Boolean(gmail) && campana.restanHoy > 0

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
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
            <p className="text-3xl font-bold tabular-nums">{campana.enviadosHoy} <span className="text-base font-normal text-muted-foreground">/ {campana.tope}</span></p>
            <p className="text-sm text-muted-foreground">{es ? `Tope de la rampa (día ${campana.diasDesdePrimerEnvio + 1} de la campaña). Reparte los envíos a lo largo del día.` : `Ramp cap (campaign day ${campana.diasDesdePrimerEnvio + 1}). Spread sends through the day.`}</p>
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
      </div>

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
                const htmlPreview = sinFirma(abierto.html)
                return (
                  <div className="space-y-4">
                    {/* Fila 1: asunto a lo ancho */}
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="w-16 shrink-0 text-xs font-medium text-muted-foreground">{es ? 'Asunto' : 'Subject'}</label>
                      {esBorrador ? (
                        <Input className="min-w-0 flex-1" value={subject} onChange={(e) => setSubject(e.target.value)} />
                      ) : (
                        <p className="min-w-0 flex-1 text-sm">{abierto.subject}</p>
                      )}
                      <Button size="sm" variant="outline" onClick={() => copiar(esBorrador ? subject : abierto.subject, es ? 'Asunto copiado' : 'Subject copied')}><Copy className="mr-1 h-3.5 w-3.5" />{es ? 'Copiar asunto' : 'Copy subject'}</Button>
                    </div>

                    {/* Fila 2: cuerpo y vista previa a la par */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium text-muted-foreground">{es ? 'Mensaje (el botón de WhatsApp y la línea legal se agregan solos; la firma la pone tu Gmail)' : 'Message (WhatsApp button and legal line are added automatically; your Gmail adds the signature)'}</label>
                        {esBorrador ? (
                          <Textarea className="min-h-[60vh] flex-1 resize-none font-mono text-[13px] leading-relaxed" value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} />
                        ) : (
                          <pre className="min-h-[60vh] flex-1 whitespace-pre-wrap rounded-md border bg-muted/30 p-3 text-[13px] leading-relaxed">{cuerpoDe(abierto.text)}</pre>
                        )}
                        {!esBorrador && <p className="text-xs text-muted-foreground">{es ? 'Enviado: ' : 'Sent: '}{abierto.sent_at ? new Date(abierto.sent_at).toLocaleString(es ? 'es-MX' : 'en-US') : '—'} ({abierto.sent_via})</p>}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-1">
                          <p className="mr-auto text-xs font-medium text-muted-foreground">{es ? 'Vista previa' : 'Preview'}</p>
                          <Button size="sm" variant="outline" onClick={() => copiarConFormato(htmlPreview, abierto.text)}><Copy className="mr-1 h-3.5 w-3.5" />{es ? 'Copiar para pegar en Gmail' : 'Copy for Gmail'}</Button>
                        </div>
                        <iframe title="preview" className="min-h-[60vh] flex-1 w-full rounded-md border bg-white" sandbox="" srcDoc={htmlPreview} />
                      </div>
                    </div>

                    {esBorrador && (
                      <div className="flex flex-wrap items-center gap-2">
                        <Button variant="outline" onClick={guardar} disabled={ocupado !== null}>{ocupado === 'save' ? (es ? 'Guardando…' : 'Saving…') : es ? 'Guardar cambios' : 'Save changes'}</Button>
                        <Button onClick={() => enviar(abierto)} disabled={ocupado !== null || !puedeEnviar || sucio}><Send className="mr-2 h-4 w-4" />{es ? 'Enviar por Gmail' : 'Send via Gmail'}</Button>
                        <Button variant="ghost" onClick={() => saltar(abierto)} disabled={ocupado !== null}><X className="mr-2 h-4 w-4" />{es ? 'Descartar' : 'Skip'}</Button>
                        {sucio && <p className="text-xs text-muted-foreground">{es ? 'Guarda los cambios para actualizar la vista previa y poder enviar.' : 'Save your changes to refresh the preview and send.'}</p>}
                        {!sucio && abierto.gancho && <p className="ml-auto max-w-[50%] truncate text-xs text-muted-foreground" title={abierto.gancho}>{es ? 'Gancho: ' : 'Hook: '}{abierto.gancho}</p>}
                      </div>
                    )}
                  </div>
                )
              })()}
            </>
          )}
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
