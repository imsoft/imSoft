'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { mxn } from '@/lib/cotizaciones'
import { etiquetaPlazo } from '@/lib/pagar-plazo'
import type { Plazo } from '@/lib/enlace-pago'

/* Stripe.js se carga desde js.stripe.com (requisito PCI); solo tipamos lo que usamos. */
interface StripeElement { mount(sel: string): void; on(ev: 'change', cb: (e: { error?: { message: string }; complete?: boolean }) => void): void }
interface StripeJs {
  elements(opts?: Record<string, unknown>): { create(tipo: 'card', opts?: Record<string, unknown>): StripeElement }
  createPaymentMethod(tipo: 'card', el: StripeElement, data?: Record<string, unknown>): Promise<{ paymentMethod?: { id: string }; error?: { message: string } }>
  handleNextAction(opts: { clientSecret: string }): Promise<{ paymentIntent?: { status: string }; error?: { message: string } }>
}
declare global { interface Window { Stripe?: (pk: string, opts?: Record<string, unknown>) => StripeJs } }

interface Props {
  token: string
  lang: string
  publishableKey: string
  concepto: string
  folio: string
  cobro: number
  currency: string
  plazo: Plazo
  /** A donde regresa el cliente al terminar (la cotizacion). */
  volver: string
}

/**
 * Formulario de pago con tarjeta en imsoft.io con el plazo fijo del enlace. Flujo:
 * tarjeta -> PaymentMethod en el navegador -> /api/pagar/intento (revisa que la tarjeta
 * admita el plazo) -> /api/pagar/confirmar (confirma con ese plan) -> 3D Secure si el
 * banco lo pide -> regreso a la cotizacion con ?pago=ok.
 */
export function PagarTarjeta({ token, lang, publishableKey, concepto, folio, cobro, currency, plazo, volver }: Props) {
  const es = lang !== 'en'
  const [listo, setListo] = useState(false)
  const [nombre, setNombre] = useState('')
  const [tarjetaOk, setTarjetaOk] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paso, setPaso] = useState<'tarjeta' | 'cobrando' | 'hecho'>('tarjeta')
  const stripeRef = useRef<StripeJs | null>(null)
  const cardRef = useRef<StripeElement | null>(null)

  useEffect(() => {
    if (!listo || stripeRef.current || !window.Stripe) return
    const stripe = window.Stripe(publishableKey, { locale: es ? 'es-419' : 'en' })
    const card = stripe.elements({ locale: es ? 'es-419' : 'en' }).create('card', { hidePostalCode: true, style: { base: { fontSize: '16px', fontFamily: 'Montserrat, system-ui, sans-serif', color: '#0f172a', '::placeholder': { color: '#94a3b8' } } } })
    card.mount('#tarjeta')
    card.on('change', (e) => { setError(e.error?.message ?? null); setTarjetaOk(Boolean(e.complete)) })
    stripeRef.current = stripe
    cardRef.current = card
  }, [listo, publishableKey, es])

  const mensajeDe = (j: { error?: string; planes?: number[]; message?: string | null }, status: number): string => {
    if (j.error === 'pagado') return es ? 'Este pago ya se hizo. Gracias.' : 'This payment was already made. Thank you.'
    if (j.error === 'sin-plazo') {
      const otros = (j.planes ?? []).filter((n) => [3, 6, 12].includes(n))
      return es
        ? `Tu tarjeta no admite ${plazo} meses sin intereses${otros.length ? ` (sí admite ${otros.join(', ')})` : ''}. No se hizo ningún cargo. Prueba con otra tarjeta o pídenos un enlace con otro plazo.`
        : `Your card does not support ${plazo} interest-free months${otros.length ? ` (it supports ${otros.join(', ')})` : ''}. Nothing was charged. Try another card or ask us for a different plan.`
    }
    if (j.error === 'rechazada') return es ? `El banco rechazó el cargo${j.message ? `: ${j.message}` : ''}. No se cobró nada; prueba con otra tarjeta.` : `The bank declined the charge${j.message ? `: ${j.message}` : ''}. Nothing was charged; try another card.`
    return j.message || j.error || (es ? `No se pudo procesar el pago (${status}).` : `The payment could not be processed (${status}).`)
  }

  async function pagar(ev: React.FormEvent) {
    ev.preventDefault()
    const stripe = stripeRef.current, card = cardRef.current
    if (!stripe || !card || paso !== 'tarjeta') return
    setError(null)
    setPaso('cobrando')
    try {
      const pm = await stripe.createPaymentMethod('card', card, { billing_details: { name: nombre.trim() || undefined } })
      if (pm.error || !pm.paymentMethod) throw new Error(pm.error?.message || 'Tarjeta no válida')
      const r1 = await fetch('/api/pagar/intento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, paymentMethodId: pm.paymentMethod.id }) })
      const j1 = await r1.json().catch(() => ({}))
      if (!r1.ok) throw new Error(mensajeDe(j1, r1.status))
      const r2 = await fetch('/api/pagar/confirmar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, intentId: j1.intentId }) })
      const j2 = await r2.json().catch(() => ({}))
      if (!r2.ok) throw new Error(mensajeDe(j2, r2.status))
      let status: string = j2.status
      if (status === 'requires_action' && j2.clientSecret) {
        const sig = await stripe.handleNextAction({ clientSecret: j2.clientSecret })
        if (sig.error) throw new Error(sig.error.message)
        status = sig.paymentIntent?.status ?? 'unknown'
      }
      if (status !== 'succeeded' && status !== 'processing') throw new Error(es ? 'El pago no se completó. No se hizo ningún cargo.' : 'The payment did not complete. Nothing was charged.')
      setPaso('hecho')
      window.location.assign(`${volver}?pago=ok`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setPaso('tarjeta')
    }
  }

  const mensualidad = plazo ? cobro / plazo : 0

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-10">
      <Script src="https://js.stripe.com/v3/" strategy="afterInteractive" onLoad={() => setListo(true)} onReady={() => setListo(true)} />
      <form onSubmit={pagar} className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/imsoft-isotipo-correo-v3.png" alt="imSoft" width={40} height={52} className="mb-6" />
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{es ? 'Cotización' : 'Quote'} {folio}</p>
        <h1 className="mt-1 text-lg font-semibold text-neutral-900">{concepto}</h1>

        <div className="mt-5 rounded-xl bg-neutral-50 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-neutral-600">{es ? 'Total' : 'Total'}</span>
            <span className="text-2xl font-semibold tabular-nums text-neutral-900">{mxn(cobro, currency)}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between text-sm">
            <span className="text-neutral-600">{etiquetaPlazo(plazo, es)}</span>
            {plazo > 0 && <span className="tabular-nums text-neutral-700">{plazo} × {mxn(mensualidad, currency)}</span>}
          </div>
          {plazo > 0 && <p className="mt-2 text-xs text-neutral-500">{es ? 'Solo con tarjeta de crédito mexicana participante. Si tu tarjeta no admite este plazo, te avisamos y no se cobra nada.' : 'Mexican participating credit cards only. If your card does not support this plan, we tell you and nothing is charged.'}</p>}
        </div>

        <label className="mt-6 block text-sm font-medium text-neutral-800" htmlFor="nombre">{es ? 'Nombre en la tarjeta' : 'Name on card'}</label>
        <input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="cc-name" required className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-[#1E9DF1] focus:ring-2 focus:ring-[#1E9DF1]/20" />

        <label className="mt-4 block text-sm font-medium text-neutral-800">{es ? 'Datos de la tarjeta' : 'Card details'}</label>
        <div id="tarjeta" className="mt-1.5 rounded-lg border border-neutral-300 px-3 py-3">
          {!listo && <span className="text-sm text-neutral-400">{es ? 'Cargando…' : 'Loading…'}</span>}
        </div>

        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={!listo || !tarjetaOk || paso !== 'tarjeta'} className="mt-6 w-full rounded-lg bg-[#1E9DF1] px-4 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50">
          {paso === 'cobrando' ? (es ? 'Procesando…' : 'Processing…') : paso === 'hecho' ? (es ? 'Pago recibido' : 'Payment received') : (es ? `Pagar ${mxn(cobro, currency)}` : `Pay ${mxn(cobro, currency)}`)}
        </button>
        <p className="mt-3 text-center text-xs text-neutral-500">{es ? 'Pago procesado por Stripe. imSoft no guarda los datos de tu tarjeta.' : 'Processed by Stripe. imSoft never stores your card details.'}</p>
      </form>
    </main>
  )
}
