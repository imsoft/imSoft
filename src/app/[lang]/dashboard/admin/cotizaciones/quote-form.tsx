'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { NumberInput } from '@/components/ui/number-input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Plus } from 'lucide-react'
import { CONDICIONES_DEFAULT } from '@/config/emisor'
import { featuresValidas, fechaVigencia, generarToken, hitosValidos, itemsDesdePrecio, mxn, plazoEntrega, precioProyecto, siguienteFolio, totales, type Hito, type QuoteTerms } from '@/lib/cotizaciones'
import type { Quote } from '@/types/quotes'
import type { AssistOutput } from '@/lib/quote-assist'
import { Sparkles, Loader2 } from 'lucide-react'

const campo = 'border-2! border-border!'
const sw = 'border-2! border-border! data-[state=unchecked]:bg-muted!'

interface ServicioLite { id: string; slug: string; title_es?: string | null; title_en?: string | null; benefits_es?: string[] | null; benefits_en?: string[] | null }
interface ContactoLite { id: string; first_name: string; last_name: string; email?: string | null; company?: string | null; address_street?: string | null; address_city?: string | null; address_state?: string | null }

export function QuoteForm({ lang, quote }: { lang: string; quote?: Quote }) {
  const es = lang !== 'en'
  const router = useRouter()
  const [guardando, setGuardando] = useState(false)
  const [contactos, setContactos] = useState<ContactoLite[]>([])
  const [servicios, setServicios] = useState<ServicioLite[]>([])
  const [servicioSel, setServicioSel] = useState('')
  const [asistente, setAsistente] = useState<AssistOutput | null>(null)
  const [pensando, setPensando] = useState(false)

  const [cliente, setCliente] = useState({
    contact_id: quote?.contact_id ?? '',
    client_name: quote?.client_name ?? '',
    client_company: quote?.client_company ?? '',
    client_email: quote?.client_email ?? '',
    client_rfc: quote?.client_rfc ?? '',
    client_address: quote?.client_address ?? '',
  })
  const [title, setTitle] = useState(quote?.title ?? '')
  const [intro, setIntro] = useState(quote?.intro ?? '')
  const [precio, setPrecio] = useState<number>(quote ? precioProyecto(quote) : 0)
  const [features, setFeatures] = useState<string[]>(quote?.features?.length ? quote.features : [''])
  const [applyIva, setApplyIva] = useState(quote?.apply_iva ?? true)
  const [hitos, setHitos] = useState<Hito[]>(quote?.payment?.hitos ?? CONDICIONES_DEFAULT.hitos.map((h) => ({ ...h })))
  const [msi, setMsi] = useState(quote?.payment?.msi ?? CONDICIONES_DEFAULT.msi)
  const [terms, setTerms] = useState<QuoteTerms>(quote?.terms ?? {
    garantia_dias: CONDICIONES_DEFAULT.garantia_dias,
    soporte: CONDICIONES_DEFAULT.soporte,
    propiedad: CONDICIONES_DEFAULT.propiedad,
    cambios_alcance: CONDICIONES_DEFAULT.cambios_alcance,
    penalizacion_dia: CONDICIONES_DEFAULT.penalizacion_dia,
    entrega_semanas: CONDICIONES_DEFAULT.entrega_semanas,
    fecha_limite: fechaVigencia(CONDICIONES_DEFAULT.entrega_semanas * 7),
  })
  const plazo = plazoEntrega({ terms, created_at: quote?.created_at ?? null })
  const [validUntil, setValidUntil] = useState(quote?.valid_until ?? fechaVigencia(CONDICIONES_DEFAULT.vigencia_dias))
  const [notes, setNotes] = useState(quote?.notes ?? '')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('contacts').select('id, first_name, last_name, email, company, address_street, address_city, address_state').order('first_name').limit(500)
      .then(({ data }) => setContactos((data ?? []) as ContactoLite[]))
    // Las caracteristicas precargadas salen de los beneficios de cada servicio (los mismos
    // que muestra el sitio): se editan en Admin → Servicios.
    supabase.from('services').select('id, slug, title_es, title_en, benefits_es, benefits_en').order('title_es')
      .then(({ data }) => setServicios((data ?? []) as ServicioLite[]))
  }, [])

  const t = useMemo(() => totales({ items: itemsDesdePrecio(title, precio), apply_iva: applyIva }), [title, precio, applyIva])
  const errorHitos = hitosValidos(hitos)
  const errorFeatures = featuresValidas(features)

  async function pedirRecomendaciones() {
    if (!title.trim()) return toast.error(es ? 'Pon primero el nombre del proyecto.' : 'Enter the project title first.')
    setPensando(true)
    try {
      const sv = servicios.find((x) => x.slug === servicioSel)
      const r = await fetch('/api/quotes/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, intro, features: features.filter((f) => f.trim()), precio, clientCompany: cliente.client_company, servicio: sv?.title_es ?? null }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      setAsistente(j as AssistOutput)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setPensando(false)
    }
  }

  function agregarCaracteristica(texto: string) {
    setFeatures((arr) => {
      const limpias = arr.map((f) => f.trim()).filter(Boolean)
      if (limpias.some((f) => f.toLowerCase() === texto.toLowerCase())) return arr
      return [...limpias, texto]
    })
    setAsistente((a) => (a ? { ...a, caracteristicas: a.caracteristicas.filter((c) => c.texto !== texto) } : a))
  }

  function precargarServicio(slug: string) {
    setServicioSel(slug)
    const sv = servicios.find((x) => x.slug === slug)
    if (!sv) return
    const base = (es ? sv.benefits_es : sv.benefits_en) ?? sv.benefits_es ?? []
    setFeatures((arr) => {
      const actuales = arr.map((f) => f.trim()).filter(Boolean)
      const nuevas = base.filter((b) => !actuales.includes(b))
      const lista = [...actuales, ...nuevas]
      return lista.length ? lista : ['']
    })
    if (!title.trim()) setTitle((es ? sv.title_es : sv.title_en) || sv.title_es || '')
  }

  function elegirContacto(id: string) {
    const c = contactos.find((x) => x.id === id)
    if (!c) { setCliente((v) => ({ ...v, contact_id: '' })); return }
    setCliente((v) => ({
      ...v,
      contact_id: c.id,
      client_name: `${c.first_name} ${c.last_name}`.trim(),
      client_company: c.company ?? v.client_company,
      client_email: c.email ?? v.client_email,
      client_address: [c.address_street, c.address_city, c.address_state].filter(Boolean).join(', ') || v.client_address,
    }))
  }

  async function guardar() {
    if (!cliente.client_name.trim()) return toast.error(es ? 'Falta el nombre del cliente.' : 'Client name is required.')
    if (!title.trim()) return toast.error(es ? 'Falta el nombre del proyecto.' : 'Project title is required.')
    if (!(precio > 0)) return toast.error(es ? 'Pon el precio del proyecto.' : 'Enter the project price.')
    if (errorFeatures) return toast.error(errorFeatures)
    if (errorHitos) return toast.error(errorHitos)
    setGuardando(true)
    const supabase = createClient()
    const datos = {
      lang,
      contact_id: cliente.contact_id || null,
      client_name: cliente.client_name.trim(),
      client_company: cliente.client_company.trim() || null,
      client_email: cliente.client_email.trim() || null,
      client_rfc: cliente.client_rfc.trim() || null,
      client_address: cliente.client_address.trim() || null,
      title: title.trim(),
      intro: intro.trim() || null,
      items: itemsDesdePrecio(title.trim(), precio),
      features: features.map((f) => f.trim()).filter(Boolean),
      currency: 'MXN',
      apply_iva: applyIva,
      payment: { hitos: hitos.map((h) => ({ label: h.label.trim(), pct: Number(h.pct) })), msi },
      terms: { ...terms, garantia_dias: Number(terms.garantia_dias), penalizacion_dia: Number(terms.penalizacion_dia), entrega_semanas: plazo.semanas, fecha_limite: terms.fecha_limite || plazo.fechaLimite },
      notes: notes.trim() || null,
      valid_until: validUntil,
      updated_at: new Date().toISOString(),
    }
    try {
      if (quote) {
        const { error } = await supabase.from('quotes').update(datos).eq('id', quote.id)
        if (error) throw error
        toast.success(es ? 'Cotización guardada' : 'Quote saved')
        router.push(`/${lang}/dashboard/admin/cotizaciones/${quote.id}`)
      } else {
        const { data: ultimo } = await supabase.from('quotes').select('folio').like('folio', 'COT-%').order('created_at', { ascending: false }).limit(1).maybeSingle()
        const folio = siguienteFolio('COT', ultimo?.folio)
        const token = generarToken(crypto.getRandomValues(new Uint8Array(24)))
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase.from('quotes').insert({ ...datos, folio, token, status: 'draft', created_by: user?.id ?? null }).select('id').single()
        if (error) throw error
        toast.success(`${es ? 'Cotización creada' : 'Quote created'}: ${folio}`)
        router.push(`/${lang}/dashboard/admin/cotizaciones/${data.id}`)
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setGuardando(false)
    }
  }

  const setFeature = (i: number, v: string) => setFeatures((arr) => arr.map((x, idx) => (idx === i ? v : x)))
  const setHito = (i: number, patch: Partial<Hito>) => setHitos((arr) => arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{es ? 'Cliente' : 'Client'}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="q-contacto">{es ? 'Tomar del CRM (opcional)' : 'Pick from CRM (optional)'}</Label>
              <select id="q-contacto" className="w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm" value={cliente.contact_id} onChange={(e) => elegirContacto(e.target.value)}>
                <option value="">{es ? '— escribir a mano —' : '— type manually —'}</option>
                {contactos.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}{c.company ? ` · ${c.company}` : ''}</option>)}
              </select>
            </div>
            {([['client_name', es ? 'Nombre' : 'Name'], ['client_company', es ? 'Empresa' : 'Company'], ['client_email', 'Email'], ['client_rfc', 'RFC'], ['client_address', es ? 'Domicilio' : 'Address']] as const).map(([k, label]) => (
              <div key={k} className={`space-y-1.5 ${k === 'client_address' ? 'sm:col-span-2' : ''}`}>
                <Label htmlFor={`q-${k}`}>{label}</Label>
                <Input id={`q-${k}`} className={campo} value={cliente[k]} onChange={(e) => setCliente((v) => ({ ...v, [k]: e.target.value }))} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{es ? 'Proyecto' : 'Project'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
              <div className="space-y-1.5">
                <Label htmlFor="q-title">{es ? 'Nombre del proyecto' : 'Project title'}</Label>
                <Input id="q-title" className={campo} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={es ? 'Página web corporativa para Clínica Sonrisa' : 'Corporate website for Sonrisa Clinic'} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="q-precio">{es ? 'Precio (sin IVA)' : 'Price (before VAT)'}</Label>
                <NumberInput id="q-precio" className={campo} value={precio} onValueChange={setPrecio} placeholder="18000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="q-intro">{es ? 'Resumen (opcional)' : 'Summary (optional)'}</Label>
              <Textarea id="q-intro" className={campo} rows={2} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder={es ? 'Qué problema resuelve, en dos frases.' : 'What it solves, in two sentences.'} />
            </div>
            <div className="space-y-2">
              <Label>{es ? 'Características de la aplicación' : 'Application features'}</Label>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label={es ? 'Precargar características de un servicio' : 'Preload features from a service'}
                  className="rounded-md border-2 border-border bg-background px-3 py-2 text-sm"
                  value={servicioSel}
                  onChange={(e) => precargarServicio(e.target.value)}
                >
                  <option value="">{es ? 'Precargar desde un servicio…' : 'Preload from a service…'}</option>
                  {servicios.map((sv) => <option key={sv.id} value={sv.slug}>{(es ? sv.title_es : sv.title_en) || sv.title_es}</option>)}
                </select>
                <p className="text-xs text-muted-foreground">
                  {es ? 'Agrega las características del servicio (se editan en Admin → Servicios). Luego quita o añade lo que haga falta.' : 'Adds the service features (edited under Admin → Services). Then remove or add what you need.'}
                </p>
              </div>
              {features.map((f, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-7 shrink-0 text-right text-sm tabular-nums text-muted-foreground" aria-hidden="true">{i + 1}.</span>
                  <Input className={campo} value={f} onChange={(e) => setFeature(i, e.target.value)} placeholder={es ? 'p. ej. Formulario de citas con confirmación por WhatsApp' : 'e.g. Appointment form with WhatsApp confirmation'}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setFeatures((arr) => [...arr.slice(0, i + 1), '', ...arr.slice(i + 1)]) } }} />
                  <Button type="button" variant="ghost" size="icon" aria-label={es ? 'Quitar' : 'Remove'} onClick={() => setFeatures((arr) => arr.filter((_, idx) => idx !== i))} disabled={features.length === 1}><Trash2 className="size-4" /></Button>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setFeatures((arr) => [...arr, ''])}><Plus className="size-4 mr-1" />{es ? 'Agregar característica' : 'Add feature'}</Button>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {(() => { const n = features.filter((x) => x.trim()).length; return es ? `${n} ${n === 1 ? 'característica' : 'características'}` : `${n} ${n === 1 ? 'feature' : 'features'}` })()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{es ? 'Forma de pago' : 'Payment terms'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {hitos.map((h, i) => (
                <div key={i} className="grid gap-2 grid-cols-[1fr_90px_40px] items-center">
                  <Input className={campo} value={h.label} onChange={(e) => setHito(i, { label: e.target.value })} placeholder={es ? 'Nombre del hito' : 'Milestone'} />
                  <div className="relative"><NumberInput className={`${campo} pr-7`} value={h.pct} onValueChange={(n) => setHito(i, { pct: n })} aria-label="%" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span></div>
                  <Button type="button" variant="ghost" size="icon" aria-label={es ? 'Quitar hito' : 'Remove milestone'} onClick={() => setHitos((arr) => arr.filter((_, idx) => idx !== i))} disabled={hitos.length === 1}><Trash2 className="size-4" /></Button>
                </div>
              ))}
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={() => setHitos((arr) => [...arr, { label: '', pct: 0 }])}><Plus className="size-4 mr-1" />{es ? 'Agregar hito' : 'Add milestone'}</Button>
                {errorHitos && <p className="text-xs text-destructive">{errorHitos}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="q-iva">{es ? 'Desglosar IVA (16 %)' : 'Add VAT (16 %)'}</Label>
              <Switch id="q-iva" className={sw} checked={applyIva} onCheckedChange={setApplyIva} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="q-msi">{es ? 'Ofrecer meses sin intereses con tarjeta' : 'Offer interest-free installments'}</Label>
              <Switch id="q-msi" className={sw} checked={msi} onCheckedChange={setMsi} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{es ? 'Condiciones' : 'Terms'}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="q-limite">{es ? 'Fecha límite del proyecto' : 'Project deadline'}</Label>
              <Input id="q-limite" className={campo} type="date" value={terms.fecha_limite ?? ''} onChange={(e) => setTerms((v) => ({ ...v, fecha_limite: e.target.value || null }))} />
              <p className="text-xs text-muted-foreground">{es ? `${plazo.semanas} ${plazo.semanas === 1 ? 'semana' : 'semanas'} (${plazo.dias} días) desde ${quote ? 'la creación de la cotización' : 'hoy'}.` : `${plazo.semanas} weeks (${plazo.dias} days) from ${quote ? 'the quote date' : 'today'}.`}</p>
            </div>
            <div className="space-y-1.5"><Label htmlFor="q-garantia">{es ? 'Garantía (días)' : 'Warranty (days)'}</Label><NumberInput id="q-garantia" className={campo} value={terms.garantia_dias} onValueChange={(n) => setTerms((v) => ({ ...v, garantia_dias: n }))} /></div>
            <div className="space-y-1.5"><Label htmlFor="q-penal">{es ? 'Penalización por día de retraso del cliente (MXN)' : 'Client delay penalty per day (MXN)'}</Label><NumberInput id="q-penal" className={campo} value={terms.penalizacion_dia} onValueChange={(n) => setTerms((v) => ({ ...v, penalizacion_dia: n }))} /></div>
            <div className="space-y-1.5 sm:col-span-3"><Label htmlFor="q-soporte">{es ? 'Soporte' : 'Support'}</Label><Textarea id="q-soporte" className={campo} rows={2} value={terms.soporte} onChange={(e) => setTerms((v) => ({ ...v, soporte: e.target.value }))} /></div>
            <div className="space-y-1.5 sm:col-span-3"><Label htmlFor="q-propiedad">{es ? 'Propiedad del código' : 'Code ownership'}</Label><Textarea id="q-propiedad" className={campo} rows={2} value={terms.propiedad} onChange={(e) => setTerms((v) => ({ ...v, propiedad: e.target.value }))} /></div>
            <div className="space-y-1.5 sm:col-span-3"><Label htmlFor="q-cambios">{es ? 'Cambios de alcance' : 'Scope changes'}</Label><Textarea id="q-cambios" className={campo} rows={2} value={terms.cambios_alcance} onChange={(e) => setTerms((v) => ({ ...v, cambios_alcance: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label htmlFor="q-vigencia">{es ? 'Vigente hasta' : 'Valid until'}</Label><Input id="q-vigencia" className={campo} type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-3"><Label htmlFor="q-notes">{es ? 'Notas para el cliente (opcional)' : 'Notes for the client (optional)'}</Label><Textarea id="q-notes" className={campo} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-6">
        <CardHeader><CardTitle className="text-base">{es ? 'Resumen' : 'Summary'}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">{es ? 'Precio' : 'Price'}</span><span className="font-mono tabular-nums">{mxn(t.subtotal)}</span></div>
          {applyIva && <div className="flex justify-between"><span className="text-muted-foreground">IVA</span><span className="font-mono tabular-nums">{mxn(t.iva)}</span></div>}
          <div className="flex justify-between text-base font-semibold border-t pt-2"><span>Total</span><span className="font-mono tabular-nums">{mxn(t.total)}</span></div>
          {!errorHitos && hitos.map((h) => <div key={h.label} className="flex justify-between text-muted-foreground"><span>{h.label || '—'}</span><span className="font-mono tabular-nums">{mxn((t.total * h.pct) / 100)}</span></div>)}
          <Button className="w-full mt-2" onClick={guardar} disabled={guardando}>
            {guardando ? (es ? 'Guardando…' : 'Saving…') : quote ? (es ? 'Guardar cambios' : 'Save changes') : (es ? 'Crear cotización' : 'Create quote')}
          </Button>
          <p className="text-xs text-muted-foreground">{es ? 'Se crea como borrador. Desde el detalle la envías y generas el contrato.' : 'Created as a draft. Send it and generate the contract from the detail page.'}</p>

          <div className="border-t pt-4 space-y-3">
            <Button type="button" variant="outline" className="w-full" onClick={pedirRecomendaciones} disabled={pensando}>
              {pensando ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Sparkles className="size-4 mr-1" />}
              {pensando ? (es ? 'Revisando el proyecto…' : 'Reviewing the project…') : (es ? 'Pedir recomendaciones a la IA' : 'Ask AI for recommendations')}
            </Button>
            <p className="text-xs text-muted-foreground">{es ? 'Revisa precio, características que suelen faltar, preguntas para el cliente y riesgos. Es una segunda opinión; tú decides.' : 'Reviews price, commonly missing features, questions for the client and risks. A second opinion; you decide.'}</p>
            {asistente && (
              <div className="space-y-4 text-sm">
                <p>{asistente.resumen}</p>
                <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                  <p className="font-semibold">{es ? 'Precio sugerido' : 'Suggested price'}: <span className="font-mono tabular-nums">{mxn(asistente.precio.min)} – {mxn(asistente.precio.max)}</span></p>
                  <p className="text-muted-foreground">{asistente.precio.comentario}</p>
                  <div className="flex flex-wrap gap-2">
                    {[asistente.precio.min, Math.round((asistente.precio.min + asistente.precio.max) / 2 / 100) * 100, asistente.precio.max].map((v, i) => (
                      <Button key={i} type="button" size="sm" variant={precio === v ? 'default' : 'outline'} onClick={() => setPrecio(v)}>{es ? ['Usar mínimo', 'Usar medio', 'Usar máximo'][i] : ['Use min', 'Use mid', 'Use max'][i]}</Button>
                    ))}
                  </div>
                </div>
                {asistente.caracteristicas.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold">{es ? 'Características que suelen faltar' : 'Features often missing'}</p>
                    <ul className="space-y-2">
                      {asistente.caracteristicas.map((c) => (
                        <li key={c.texto} className="flex items-start justify-between gap-2 rounded-lg border p-2">
                          <div><p>{c.texto}</p><p className="text-xs text-muted-foreground">{c.motivo}</p></div>
                          <Button type="button" size="sm" variant="outline" onClick={() => agregarCaracteristica(c.texto)}><Plus className="size-4" /></Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {asistente.preguntas.length > 0 && (
                  <div><p className="font-semibold mb-1">{es ? 'Pregúntale al cliente' : 'Ask the client'}</p><ul className="list-disc pl-5 space-y-1 text-muted-foreground">{asistente.preguntas.map((q) => <li key={q}>{q}</li>)}</ul></div>
                )}
                {asistente.riesgos.length > 0 && (
                  <div><p className="font-semibold mb-1">{es ? 'Deja por escrito' : 'Put in writing'}</p><ul className="list-disc pl-5 space-y-1 text-muted-foreground">{asistente.riesgos.map((q) => <li key={q}>{q}</li>)}</ul></div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
