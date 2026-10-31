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
import { DEFAULT_TERMS } from '@/config/issuer'
import { MAX_RECOMMENDED_DISCOUNT_PCT, DEFAULT_PLAN, PROMOTIONS, transferDiscountPct, validateDiscount, planAmounts, monthlyPaymentCount, validatePlan, monthlyPaymentsText, totalWithInstallments, type MonthlyPlan, validateFeatures, dateAfterDays, generateToken, validateMilestones, itemsFromPrice, formatMoney, deliveryTerm, discountPct, projectPrice, nextNumber, quoteTotals, type Milestone, type QuoteDiscount, type QuoteTerms } from '@/lib/quotes'
import type { Quote } from '@/types/quotes'
import { retainerText, type AssistOutput, type Priority } from '@/lib/quote-assist'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2 } from 'lucide-react'

const field = 'border-2! border-border!'
const sw = 'border-2! border-border! data-[state=unchecked]:bg-muted!'
const PRIORITY_LABEL_ES: Record<Priority, string> = { essential: 'esencial', recommended: 'recomendada', optional: 'opcional' }

interface ServiceLite { id: string; slug: string; title_es?: string | null; title_en?: string | null; benefits_es?: string[] | null; benefits_en?: string[] | null }
interface ContactLite { id: string; first_name: string; last_name: string; email?: string | null; company?: string | null; address_street?: string | null; address_city?: string | null; address_state?: string | null }

export function QuoteForm({ lang, quote }: { lang: string; quote?: Quote }) {
  const es = lang !== 'en'
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [contacts, setContacts] = useState<ContactLite[]>([])
  const [services, setServices] = useState<ServiceLite[]>([])
  const [selectedService, setSelectedService] = useState('')
  const [assist, setAssist] = useState<AssistOutput | null>(null)
  const [thinking, setThinking] = useState(false)

  const [client, setClient] = useState({
    contact_id: quote?.contact_id ?? '',
    client_name: quote?.client_name ?? '',
    client_company: quote?.client_company ?? '',
    client_email: quote?.client_email ?? '',
    client_rfc: quote?.client_rfc ?? '',
    client_address: quote?.client_address ?? '',
  })
  const [title, setTitle] = useState(quote?.title ?? '')
  const [intro, setIntro] = useState(quote?.intro ?? '')
  const [price, setPrice] = useState<number>(quote ? projectPrice(quote) : 0)
  const [features, setFeatures] = useState<string[]>(quote?.features?.length ? quote.features : [''])
  const [applyIva, setApplyIva] = useState(quote?.apply_iva ?? true)
  const [hasDiscount, setHasDiscount] = useState(Boolean(quote?.discount))
  const [discount, setDiscount] = useState<QuoteDiscount>(quote?.discount ?? { reason: '', type: 'pct', value: 10 })
  const [milestones, setMilestones] = useState<Milestone[]>(quote?.payment?.milestones ?? DEFAULT_TERMS.milestones.map((h) => ({ ...h })))
  const [cardInstallments, setCardInstallments] = useState(quote?.payment?.card_installments ?? DEFAULT_TERMS.card_installments)
  const [transferDiscount, setTransferDiscount] = useState<number>(quote?.payment ? transferDiscountPct(quote.payment) : transferDiscountPct({}))
  const [plan, setPlan] = useState<MonthlyPlan | null>(quote?.payment?.plan ?? null)
  const [terms, setTerms] = useState<QuoteTerms>(quote?.terms ?? {
    warranty_days: DEFAULT_TERMS.warranty_days,
    support: DEFAULT_TERMS.support,
    ownership: DEFAULT_TERMS.ownership,
    scope_changes: DEFAULT_TERMS.scope_changes,
    daily_penalty: DEFAULT_TERMS.daily_penalty,
    delivery_weeks: DEFAULT_TERMS.delivery_weeks,
    deadline: dateAfterDays(DEFAULT_TERMS.delivery_weeks * 7),
  })
  const term = deliveryTerm({ terms, created_at: quote?.created_at ?? null })
  const [validUntil, setValidUntil] = useState(quote?.valid_until ?? dateAfterDays(DEFAULT_TERMS.valid_days))
  const [notes, setNotes] = useState(quote?.notes ?? '')

  useEffect(() => {
    const supabase = createClient()
    supabase.from('contacts').select('id, first_name, last_name, email, company, address_street, address_city, address_state').order('first_name').limit(500)
      .then(({ data }) => setContacts((data ?? []) as ContactLite[]))
    // Preloaded features come from each service's benefits (the same ones the site
    // shows): they are edited under Admin → Services.
    supabase.from('services').select('id, slug, title_es, title_en, benefits_es, benefits_en').order('title_es')
      .then(({ data }) => setServices((data ?? []) as ServiceLite[]))
  }, [])

  const activeDiscount = hasDiscount ? discount : null
  const t = useMemo(() => quoteTotals({ items: itemsFromPrice(title, price), apply_iva: applyIva, discount: activeDiscount }), [title, price, applyIva, activeDiscount])
  const discountPctValue = useMemo(() => discountPct({ items: itemsFromPrice(title, price), discount: activeDiscount }), [title, price, activeDiscount])
  const discountError = hasDiscount ? validateDiscount(discount) : null
  const milestonesError = validateMilestones(milestones)
  const planError = validatePlan(plan)
  const featuresError = validateFeatures(features)

  async function requestRecommendations() {
    if (!title.trim()) return toast.error(es ? 'Pon primero el nombre del proyecto.' : 'Enter the project title first.')
    setThinking(true)
    try {
      const sv = services.find((x) => x.slug === selectedService)
      const r = await fetch('/api/quotes/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, intro, features: features.filter((f) => f.trim()), price, clientCompany: client.client_company, service: sv?.title_es ?? null, returningClient: Boolean(client.contact_id), currentDiscount: hasDiscount ? discount : null, quoteId: quote?.id ?? null }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) throw new Error(j.error || r.statusText)
      setAssist(j as AssistOutput)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setThinking(false)
    }
  }

  /** Adds the suggested feature; with `addToPrice` it also raises the project price. */
  function addFeature(text: string, addToPrice = 0) {
    if (addToPrice > 0 && !features.some((f) => f.trim().toLowerCase() === text.toLowerCase())) setPrice((p) => (Number(p) || 0) + addToPrice)
    setFeatures((arr) => {
      const clean = arr.map((f) => f.trim()).filter(Boolean)
      if (clean.some((f) => f.toLowerCase() === text.toLowerCase())) return arr
      return [...clean, text]
    })
    setAssist((a) => (a ? { ...a, features: a.features.filter((c) => c.text !== text) } : a))
  }

  function addRetainerToNotes() {
    if (!assist?.retainer) return
    const paragraph = retainerText(assist.retainer)
    setNotes((n) => (n.includes(paragraph) ? n : [n.trim(), paragraph].filter(Boolean).join('\n\n')))
  }

  function preloadService(slug: string) {
    setSelectedService(slug)
    const sv = services.find((x) => x.slug === slug)
    if (!sv) return
    const base = (es ? sv.benefits_es : sv.benefits_en) ?? sv.benefits_es ?? []
    setFeatures((arr) => {
      const current = arr.map((f) => f.trim()).filter(Boolean)
      const added = base.filter((b) => !current.includes(b))
      const list = [...current, ...added]
      return list.length ? list : ['']
    })
    if (!title.trim()) setTitle((es ? sv.title_es : sv.title_en) || sv.title_es || '')
  }

  function pickContact(id: string) {
    const c = contacts.find((x) => x.id === id)
    if (!c) { setClient((v) => ({ ...v, contact_id: '' })); return }
    setClient((v) => ({
      ...v,
      contact_id: c.id,
      client_name: `${c.first_name} ${c.last_name}`.trim(),
      client_company: c.company ?? v.client_company,
      client_email: c.email ?? v.client_email,
      client_address: [c.address_street, c.address_city, c.address_state].filter(Boolean).join(', ') || v.client_address,
    }))
  }

  async function save() {
    if (!client.client_name.trim()) return toast.error(es ? 'Falta el nombre del cliente.' : 'Client name is required.')
    if (!title.trim()) return toast.error(es ? 'Falta el nombre del proyecto.' : 'Project title is required.')
    if (!(price > 0)) return toast.error(es ? 'Pon el precio del proyecto.' : 'Enter the project price.')
    if (featuresError) return toast.error(featuresError)
    if (milestonesError) return toast.error(milestonesError)
    if (discountError) return toast.error(discountError)
    setSaving(true)
    const supabase = createClient()
    const payload = {
      lang,
      contact_id: client.contact_id || null,
      client_name: client.client_name.trim(),
      client_company: client.client_company.trim() || null,
      client_email: client.client_email.trim() || null,
      client_rfc: client.client_rfc.trim() || null,
      client_address: client.client_address.trim() || null,
      title: title.trim(),
      intro: intro.trim() || null,
      items: itemsFromPrice(title.trim(), price),
      features: features.map((f) => f.trim()).filter(Boolean),
      currency: 'MXN',
      apply_iva: applyIva,
      discount: hasDiscount ? { reason: discount.reason.trim(), type: discount.type, value: Number(discount.value) } : null,
      payment: { milestones: milestones.map((h) => ({ label: h.label.trim(), pct: Number(h.pct), ...(monthlyPaymentCount(h) > 1 ? { monthly_payments: monthlyPaymentCount(h) } : {}) })), card_installments: cardInstallments, transfer_discount_pct: transferDiscount, plan },
      terms: { ...terms, warranty_days: Number(terms.warranty_days), daily_penalty: Number(terms.daily_penalty), delivery_weeks: term.weeks, deadline: terms.deadline || term.deadline },
      notes: notes.trim() || null,
      valid_until: validUntil,
      updated_at: new Date().toISOString(),
    }
    try {
      if (quote) {
        const { error } = await supabase.from('quotes').update(payload).eq('id', quote.id)
        if (error) throw error
        toast.success(es ? 'Cotización guardada' : 'Quote saved')
        router.push(`/${lang}/dashboard/admin/cotizaciones/${quote.id}`)
      } else {
        const { data: last } = await supabase.from('quotes').select('number').like('number', 'COT-%').order('created_at', { ascending: false }).limit(1).maybeSingle()
        const quoteNumber = nextNumber('COT', last?.number)
        const token = generateToken(crypto.getRandomValues(new Uint8Array(24)))
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error } = await supabase.from('quotes').insert({ ...payload, number: quoteNumber, token, status: 'draft', created_by: user?.id ?? null }).select('id').single()
        if (error) throw error
        toast.success(`${es ? 'Cotización creada' : 'Quote created'}: ${quoteNumber}`)
        router.push(`/${lang}/dashboard/admin/cotizaciones/${data.id}`)
      }
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const setFeature = (i: number, v: string) => setFeatures((arr) => arr.map((x, idx) => (idx === i ? v : x)))
  const setMilestone = (i: number, patch: Partial<Milestone>) => setMilestones((arr) => arr.map((x, idx) => (idx === i ? { ...x, ...patch } : x)))

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px] items-start">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{es ? 'Cliente' : 'Client'}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="q-contact">{es ? 'Tomar del CRM (opcional)' : 'Pick from CRM (optional)'}</Label>
              <select id="q-contact" className="w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm" value={client.contact_id} onChange={(e) => pickContact(e.target.value)}>
                <option value="">{es ? '— escribir a mano —' : '— type manually —'}</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}{c.company ? ` · ${c.company}` : ''}</option>)}
              </select>
            </div>
            {([['client_name', es ? 'Nombre' : 'Name'], ['client_company', es ? 'Empresa' : 'Company'], ['client_email', 'Email'], ['client_rfc', 'RFC'], ['client_address', es ? 'Domicilio' : 'Address']] as const).map(([k, label]) => (
              <div key={k} className={`space-y-1.5 ${k === 'client_address' ? 'sm:col-span-2' : ''}`}>
                <Label htmlFor={`q-${k}`}>{label}</Label>
                <Input id={`q-${k}`} className={field} value={client[k]} onChange={(e) => setClient((v) => ({ ...v, [k]: e.target.value }))} />
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
                <Input id="q-title" className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={es ? 'Página web corporativa para Clínica Sonrisa' : 'Corporate website for Sonrisa Clinic'} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="q-price">{es ? 'Precio (sin IVA)' : 'Price (before VAT)'}</Label>
                <NumberInput id="q-price" className={field} value={price} onValueChange={setPrice} placeholder="18000" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="q-intro">{es ? 'Resumen (opcional)' : 'Summary (optional)'}</Label>
              <Textarea id="q-intro" className={field} rows={2} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder={es ? 'Qué problema resuelve, en dos frases.' : 'What it solves, in two sentences.'} />
            </div>

            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="q-discount">{es ? 'Descuento o promoción' : 'Discount or promotion'}</Label>
                  <p className="text-xs text-muted-foreground">{es ? 'Siempre con motivo: el cliente lo ve en la cotización y en el contrato.' : 'Always with a reason: the client sees it on the quote and the contract.'}</p>
                </div>
                <Switch id="q-discount" checked={hasDiscount} onCheckedChange={setHasDiscount} />
              </div>
              {hasDiscount && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {PROMOTIONS.map((p) => (
                      <Button key={p.key} type="button" size="sm" variant={discount.reason === p.reason ? 'default' : 'outline'} onClick={() => setDiscount({ reason: p.reason, type: p.type, value: p.value })}>{p.reason.split(':')[0]}</Button>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_130px_140px]">
                    <div className="space-y-1.5">
                      <Label htmlFor="q-discount-reason">{es ? 'Motivo (lo ve el cliente)' : 'Reason (client sees it)'}</Label>
                      <Input id="q-discount-reason" className={field} value={discount.reason} onChange={(e) => setDiscount((d) => ({ ...d, reason: e.target.value }))} placeholder={es ? 'Cliente desde 2023' : 'Client since 2023'} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="q-discount-type">{es ? 'Tipo' : 'Type'}</Label>
                      <select id="q-discount-type" className="h-10 w-full rounded-md border-2 border-border bg-background px-3 text-sm" value={discount.type} onChange={(e) => setDiscount((d) => ({ ...d, type: e.target.value as QuoteDiscount['type'] }))}>
                        <option value="pct">{es ? 'Porcentaje' : 'Percent'}</option>
                        <option value="amount">{es ? 'Monto fijo' : 'Fixed amount'}</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="q-discount-value">{discount.type === 'pct' ? '%' : 'MXN'}</Label>
                      <NumberInput id="q-discount-value" className={field} value={discount.value} onValueChange={(v) => setDiscount((d) => ({ ...d, value: v }))} placeholder={discount.type === 'pct' ? '10' : '2000'} />
                    </div>
                  </div>
                  {discountError && <p className="text-xs text-destructive">{discountError}</p>}
                  {!discountError && price > 0 && (
                    <p className={`text-xs ${discountPctValue > MAX_RECOMMENDED_DISCOUNT_PCT ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                      {es ? `Descuento de ${formatMoney(t.discount)} (${discountPctValue} %). Precio con descuento: ${formatMoney(t.subtotal)} sin IVA.` : `Discount of ${formatMoney(t.discount)} (${discountPctValue}%). Discounted price: ${formatMoney(t.subtotal)} before VAT.`}
                      {discountPctValue > MAX_RECOMMENDED_DISCOUNT_PCT && (es ? ` Pasa del ${MAX_RECOMMENDED_DISCOUNT_PCT} %: con la comisión de Stripe y el ISR, el margen queda más chico de lo que parece. Revísalo en el simulador.` : ` Above ${MAX_RECOMMENDED_DISCOUNT_PCT}%: after Stripe fees and income tax the margin is thinner than it looks.`)}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>{es ? 'Características de la aplicación' : 'Application features'}</Label>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label={es ? 'Precargar características de un servicio' : 'Preload features from a service'}
                  className="rounded-md border-2 border-border bg-background px-3 py-2 text-sm"
                  value={selectedService}
                  onChange={(e) => preloadService(e.target.value)}
                >
                  <option value="">{es ? 'Precargar desde un servicio…' : 'Preload from a service…'}</option>
                  {services.map((sv) => <option key={sv.id} value={sv.slug}>{(es ? sv.title_es : sv.title_en) || sv.title_es}</option>)}
                </select>
                <p className="text-xs text-muted-foreground">
                  {es ? 'Agrega las características del servicio (se editan en Admin → Servicios). Luego quita o añade lo que haga falta.' : 'Adds the service features (edited under Admin → Services). Then remove or add what you need.'}
                </p>
              </div>
              {features.map((f, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="w-7 shrink-0 text-right text-sm tabular-nums text-muted-foreground" aria-hidden="true">{i + 1}.</span>
                  <Input className={field} value={f} onChange={(e) => setFeature(i, e.target.value)} placeholder={es ? 'p. ej. Formulario de citas con confirmación por WhatsApp' : 'e.g. Appointment form with WhatsApp confirmation'}
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
              {milestones.map((h, i) => (
                <div key={i} className="grid gap-2 grid-cols-[1fr_90px_120px_40px] items-center">
                  <Input className={field} value={h.label} onChange={(e) => setMilestone(i, { label: e.target.value })} placeholder={es ? 'Nombre del hito' : 'Milestone'} />
                  <div className="relative"><NumberInput className={`${field} pr-7`} value={h.pct} onValueChange={(n) => setMilestone(i, { pct: n })} aria-label="%" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span></div>
                  <div className="relative"><NumberInput className={`${field} pr-14`} value={monthlyPaymentCount(h)} onValueChange={(n) => setMilestone(i, { monthly_payments: Math.max(1, Math.round(n) || 1) })} aria-label={es ? 'Mensualidades' : 'Monthly payments'} /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{es ? 'pagos' : 'pmts'}</span></div>
                  <Button type="button" variant="ghost" size="icon" aria-label={es ? 'Quitar hito' : 'Remove milestone'} onClick={() => setMilestones((arr) => arr.filter((_, idx) => idx !== i))} disabled={milestones.length === 1}><Trash2 className="size-4" /></Button>
                </div>
              ))}
              <p className="text-xs text-muted-foreground">{es ? 'Pagos: en cuántas mensualidades por transferencia se cubre el hito (1 = un solo pago). Es un acuerdo directo con el cliente, sin Stripe ni meses sin intereses.' : 'Payments: how many monthly bank transfers cover the milestone (1 = single payment). No Stripe or card installments involved.'}</p>
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={() => setMilestones((arr) => [...arr, { label: '', pct: 0 }])}><Plus className="size-4 mr-1" />{es ? 'Agregar hito' : 'Add milestone'}</Button>
                {milestonesError && <p className="text-xs text-destructive">{milestonesError}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="q-vat">{es ? 'Desglosar IVA (16 %)' : 'Add VAT (16 %)'}</Label>
              <Switch id="q-vat" className={sw} checked={applyIva} onCheckedChange={setApplyIva} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="q-installments">{es ? 'Ofrecer meses sin intereses con tarjeta' : 'Offer interest-free installments'}</Label>
                <p className="text-xs text-muted-foreground">{es ? 'Apagado: la cotización y el contrato no mencionan meses, y los enlaces de pago del proyecto salen sin esa opción.' : 'Off: the quote and contract do not mention installments, and the project payment links are created without them.'}</p>
              </div>
              <Switch id="q-installments" className={sw} checked={cardInstallments} onCheckedChange={setCardInstallments} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="q-transfer-discount">{es ? 'Descuento por transferencia' : 'Bank-transfer discount'}</Label>
                <p className="text-xs text-muted-foreground">{es ? 'El precio de lista ya trae la comisión de tarjeta; por transferencia se descuenta. 0 para no ofrecerlo.' : 'List price already includes the card fee; bank transfers get it back. 0 to disable.'}</p>
              </div>
              <div className="relative w-24"><NumberInput id="q-transfer-discount" className={`${field} pr-7`} value={transferDiscount} onValueChange={(n) => setTransferDiscount(Math.min(20, Math.max(0, n || 0)))} aria-label="%" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span></div>
            </div>
            <div className="space-y-3 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <Label htmlFor="q-plan">{es ? 'Ofrecer plan mensual' : 'Offer monthly plan'}</Label>
                  <p className="text-xs text-muted-foreground">{es ? 'Anticipo + mensualidades con hosting y soporte; el sistema vive en infra de imSoft y el código se transfiere al liquidar. Solo software y apps.' : 'Deposit + monthly fee with hosting and support; code is transferred once paid off. Software and apps only.'}</p>
                </div>
                <Switch id="q-plan" className={sw} checked={plan !== null} onCheckedChange={(v) => setPlan(v ? { ...DEFAULT_PLAN } : null)} />
              </div>
              {plan && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1"><Label className="text-xs">{es ? 'Meses' : 'Months'}</Label><NumberInput className={field} value={plan.months} onValueChange={(n) => setPlan({ ...plan, months: Math.round(n) || 0 })} /></div>
                  <div className="space-y-1"><Label className="text-xs">{es ? 'Anticipo %' : 'Deposit %'}</Label><NumberInput className={field} value={plan.deposit_pct} onValueChange={(n) => setPlan({ ...plan, deposit_pct: n || 0 })} /></div>
                  <div className="space-y-1"><Label className="text-xs">{es ? 'Recargo %' : 'Surcharge %'}</Label><NumberInput className={field} value={plan.surcharge_pct} onValueChange={(n) => setPlan({ ...plan, surcharge_pct: n || 0 })} /></div>
                  {planError && <p className="col-span-3 text-xs text-destructive">{planError}</p>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{es ? 'Condiciones' : 'Terms'}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="q-deadline">{es ? 'Fecha límite del proyecto' : 'Project deadline'}</Label>
              <Input id="q-deadline" className={field} type="date" value={terms.deadline ?? ''} onChange={(e) => setTerms((v) => ({ ...v, deadline: e.target.value || null }))} />
              <p className="text-xs text-muted-foreground">{es ? `${term.weeks} ${term.weeks === 1 ? 'semana' : 'semanas'} (${term.days} días) desde ${quote ? 'la creación de la cotización' : 'hoy'}.` : `${term.weeks} weeks (${term.days} days) from ${quote ? 'the quote date' : 'today'}.`}</p>
            </div>
            <div className="space-y-1.5"><Label htmlFor="q-warranty">{es ? 'Garantía (días)' : 'Warranty (days)'}</Label><NumberInput id="q-warranty" className={field} value={terms.warranty_days} onValueChange={(n) => setTerms((v) => ({ ...v, warranty_days: n }))} /></div>
            <div className="space-y-1.5"><Label htmlFor="q-penalty">{es ? 'Penalización por día de retraso del cliente (MXN)' : 'Client delay penalty per day (MXN)'}</Label><NumberInput id="q-penalty" className={field} value={terms.daily_penalty} onValueChange={(n) => setTerms((v) => ({ ...v, daily_penalty: n }))} /></div>
            <div className="space-y-1.5 sm:col-span-3"><Label htmlFor="q-support">{es ? 'Soporte' : 'Support'}</Label><Textarea id="q-support" className={field} rows={2} value={terms.support} onChange={(e) => setTerms((v) => ({ ...v, support: e.target.value }))} /></div>
            <div className="space-y-1.5 sm:col-span-3"><Label htmlFor="q-ownership">{es ? 'Propiedad del código' : 'Code ownership'}</Label><Textarea id="q-ownership" className={field} rows={2} value={terms.ownership} onChange={(e) => setTerms((v) => ({ ...v, ownership: e.target.value }))} /></div>
            <div className="space-y-1.5 sm:col-span-3"><Label htmlFor="q-scope">{es ? 'Cambios de alcance' : 'Scope changes'}</Label><Textarea id="q-scope" className={field} rows={2} value={terms.scope_changes} onChange={(e) => setTerms((v) => ({ ...v, scope_changes: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label htmlFor="q-valid-until">{es ? 'Vigente hasta' : 'Valid until'}</Label><Input id="q-valid-until" className={field} type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-3"><Label htmlFor="q-notes">{es ? 'Notas para el cliente (opcional)' : 'Notes for the client (optional)'}</Label><Textarea id="q-notes" className={field} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:sticky lg:top-6">
        <CardHeader><CardTitle className="text-base">{es ? 'Resumen' : 'Summary'}</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          {t.discount > 0 ? (
            <>
              <div className="flex justify-between"><span className="text-muted-foreground">{es ? 'Precio de lista' : 'List price'}</span><span className="font-mono tabular-nums line-through text-muted-foreground">{formatMoney(t.listPrice)}</span></div>
              <div className="flex justify-between gap-2 text-emerald-700"><span className="truncate">{es ? 'Descuento' : 'Discount'} ({discountPctValue} %)</span><span className="font-mono tabular-nums shrink-0">−{formatMoney(t.discount)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{es ? 'Precio con descuento' : 'Discounted price'}</span><span className="font-mono tabular-nums">{formatMoney(t.subtotal)}</span></div>
            </>
          ) : (
            <div className="flex justify-between"><span className="text-muted-foreground">{es ? 'Precio' : 'Price'}</span><span className="font-mono tabular-nums">{formatMoney(t.subtotal)}</span></div>
          )}
          {applyIva && <div className="flex justify-between"><span className="text-muted-foreground">IVA</span><span className="font-mono tabular-nums">{formatMoney(t.vat)}</span></div>}
          <div className="flex justify-between text-base font-semibold border-t pt-2"><span>Total</span><span className="font-mono tabular-nums">{formatMoney(t.total)}</span></div>
          {!milestonesError && milestones.map((h) => {
            const amount = (t.total * h.pct) / 100
            const m = monthlyPaymentsText(amount, h)
            return (
              <div key={h.label} className="text-muted-foreground">
                <div className="flex justify-between"><span>{h.label || '—'}</span><span className="font-mono tabular-nums">{formatMoney(amount)}</span></div>
                {m && <p className="text-xs">{m}</p>}
              </div>
            )
          })}
          <div className="border-t pt-2 space-y-1 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">{es ? 'Lo que ve el cliente' : 'What the client sees'}</p>
            {transferDiscount > 0 && <div className="flex justify-between"><span>{es ? `Transferencia (−${transferDiscount} %)` : `Bank transfer (−${transferDiscount} %)`}</span><span className="font-mono tabular-nums">{formatMoney(t.total * (1 - transferDiscount / 100))}</span></div>}
            <div className="flex justify-between"><span>{es ? 'Tarjeta, una exhibición' : 'Card, one payment'}</span><span className="font-mono tabular-nums">{formatMoney(t.total)}</span></div>
            {cardInstallments && <div className="flex justify-between"><span>6 MSI</span><span className="font-mono tabular-nums">{formatMoney(totalWithInstallments(t.total, 6))}</span></div>}
            {cardInstallments && <div className="flex justify-between"><span>12 MSI</span><span className="font-mono tabular-nums">{formatMoney(totalWithInstallments(t.total, 12))}</span></div>}
            {plan && !planError && (() => { const pa = planAmounts(t.total, plan); return <div className="flex justify-between"><span>{es ? `Plan ${plan.months} m` : `${plan.months}-mo plan`}</span><span className="font-mono tabular-nums">{formatMoney(pa.deposit)} + {plan.months} × {formatMoney(pa.monthlyFee)}</span></div> })()}
          </div>
          <Button className="w-full mt-2" onClick={save} disabled={saving}>
            {saving ? (es ? 'Guardando…' : 'Saving…') : quote ? (es ? 'Guardar cambios' : 'Save changes') : (es ? 'Crear cotización' : 'Create quote')}
          </Button>
          <p className="text-xs text-muted-foreground">{es ? 'Se crea como borrador. Desde el detalle la envías y generas el contrato.' : 'Created as a draft. Send it and generate the contract from the detail page.'}</p>

          <div className="border-t pt-4 space-y-3">
            <Button type="button" variant="outline" className="w-full" onClick={requestRecommendations} disabled={thinking}>
              {thinking ? <Loader2 className="size-4 mr-1 animate-spin" /> : <Sparkles className="size-4 mr-1" />}
              {thinking ? (es ? 'Revisando el proyecto…' : 'Reviewing the project…') : (es ? 'Pedir recomendaciones a la IA' : 'Ask AI for recommendations')}
            </Button>
            <p className="text-xs text-muted-foreground">{es ? 'Revisa precio contra tus cotizaciones anteriores, características que suelen faltar con su costo, iguala mensual, preguntas para el cliente y riesgos. Es una segunda opinión; tú decides.' : 'Reviews price against your past quotes, commonly missing features with their cost, monthly retainer, questions for the client and risks. A second opinion; you decide.'}</p>
            {assist && (
              <div className="space-y-4 text-sm">
                <p>{assist.summary}</p>
                <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                  <p className="font-semibold">{es ? 'Precio sugerido' : 'Suggested price'}: <span className="font-mono tabular-nums">{formatMoney(assist.price.min)} – {formatMoney(assist.price.max)}</span></p>
                  <p className="text-muted-foreground">{assist.price.comment}</p>
                  {assist.comparables_used.length > 0 && (
                    <p className="text-xs text-muted-foreground">{es ? 'Basado en tus cotizaciones' : 'Based on your quotes'}: <span className="font-mono">{assist.comparables_used.join(', ')}</span></p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {[assist.price.min, Math.round((assist.price.min + assist.price.max) / 2 / 100) * 100, assist.price.max].map((v, i) => (
                      <Button key={i} type="button" size="sm" variant={price === v ? 'default' : 'outline'} onClick={() => setPrice(v)}>{es ? ['Usar mínimo', 'Usar medio', 'Usar máximo'][i] : ['Use min', 'Use mid', 'Use max'][i]}</Button>
                    ))}
                  </div>
                </div>
                {assist.discount && (
                  <div className="rounded-lg border p-3 space-y-2">
                    <p className="font-semibold">{es ? 'Descuento' : 'Discount'}: {assist.discount.advisable ? `${assist.discount.pct} %` : es ? 'no conviene' : 'not advised'}</p>
                    <p className="text-muted-foreground">{assist.discount.comment}</p>
                    {assist.discount.advisable && assist.discount.pct > 0 && (
                      <Button type="button" size="sm" variant="outline" onClick={() => { setHasDiscount(true); setDiscount({ reason: assist.discount!.reason, type: 'pct', value: assist.discount!.pct }) }}>{es ? 'Aplicar este descuento' : 'Apply this discount'}</Button>
                    )}
                  </div>
                )}
                {assist.features.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold">{es ? 'Características que suelen faltar' : 'Features often missing'}</p>
                    <ul className="space-y-2">
                      {assist.features.map((c) => (
                        <li key={c.text} className="flex items-start justify-between gap-2 rounded-lg border p-2">
                          <div className="space-y-1">
                            <p>{c.text}</p>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <Badge variant={c.priority === 'essential' ? 'default' : c.priority === 'recommended' ? 'secondary' : 'outline'}>{es ? PRIORITY_LABEL_ES[c.priority] : c.priority}</Badge>
                              <span className="font-mono tabular-nums text-muted-foreground">{c.extra_price > 0 ? `+${formatMoney(c.extra_price)}` : es ? 'sin costo extra' : 'no extra cost'}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{c.reason}</p>
                          </div>
                          <div className="flex shrink-0 flex-col gap-1">
                            <Button type="button" size="sm" variant="outline" title={es ? 'Agregar sin cambiar el precio' : 'Add without changing the price'} onClick={() => addFeature(c.text)}><Plus className="size-4" /></Button>
                            {c.extra_price > 0 && (
                              <Button type="button" size="sm" variant="outline" title={es ? 'Agregar y sumar al precio' : 'Add and increase the price'} onClick={() => addFeature(c.text, c.extra_price)}><Plus className="size-4" />$</Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {assist.retainer && (
                  <div className="rounded-lg border p-3 space-y-2">
                    <p className="font-semibold">{es ? 'Iguala mensual sugerida' : 'Suggested monthly retainer'}: <span className="font-mono tabular-nums">{formatMoney(assist.retainer.monthly)}</span> {es ? '/ mes + IVA' : '/ month + VAT'}</p>
                    {assist.retainer.includes.length > 0 && <ul className="list-disc pl-5 space-y-1 text-muted-foreground">{assist.retainer.includes.map((x) => <li key={x}>{x}</li>)}</ul>}
                    <p className="text-muted-foreground">{assist.retainer.comment}</p>
                    <Button type="button" size="sm" variant="outline" onClick={addRetainerToNotes}>{es ? 'Ofrecerla en las notas' : 'Offer it in the notes'}</Button>
                  </div>
                )}
                {assist.questions.length > 0 && (
                  <div><p className="font-semibold mb-1">{es ? 'Pregúntale al cliente' : 'Ask the client'}</p><ul className="list-disc pl-5 space-y-1 text-muted-foreground">{assist.questions.map((q) => <li key={q}>{q}</li>)}</ul></div>
                )}
                {assist.risks.length > 0 && (
                  <div><p className="font-semibold mb-1">{es ? 'Deja por escrito' : 'Put in writing'}</p><ul className="list-disc pl-5 space-y-1 text-muted-foreground">{assist.risks.map((q) => <li key={q}>{q}</li>)}</ul></div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
