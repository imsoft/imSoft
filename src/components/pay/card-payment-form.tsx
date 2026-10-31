'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
import { formatMoney } from '@/lib/quotes'
import { termLabel } from '@/lib/pay-term'
import type { Term } from '@/lib/payment-link-token'

/* Stripe.js loads from js.stripe.com (a PCI requirement); only what we use is typed. */
interface StripeElement { mount(sel: string): void; on(ev: 'change', cb: (e: { error?: { message: string }; complete?: boolean }) => void): void }
interface StripeJs {
  elements(opts?: Record<string, unknown>): { create(type: 'card', opts?: Record<string, unknown>): StripeElement }
  createPaymentMethod(type: 'card', el: StripeElement, data?: Record<string, unknown>): Promise<{ paymentMethod?: { id: string }; error?: { message: string } }>
  handleNextAction(opts: { clientSecret: string }): Promise<{ paymentIntent?: { status: string }; error?: { message: string } }>
}
declare global { interface Window { Stripe?: (pk: string, opts?: Record<string, unknown>) => StripeJs } }

interface Props {
  token: string
  lang: string
  publishableKey: string
  concept: string
  quoteNumber: string
  charge: number
  currency: string
  term: Term
  /** Where the client goes when done: this same page with ?payment=ok, which confirms the charge. */
  returnUrl: string
}

/**
 * Card payment form on imsoft.io with the link's fixed term. Flow:
 * card -> PaymentMethod in the browser -> /api/pagar/intento (checks that the card supports
 * the term) -> /api/pagar/confirmar (confirms with that plan) -> 3D Secure if the bank asks
 * for it -> back to the pay page with ?payment=ok.
 */
export function CardPaymentForm({ token, lang, publishableKey, concept, quoteNumber, charge, currency, term, returnUrl }: Props) {
  const es = lang !== 'en'
  const [ready, setReady] = useState(false)
  const [name, setName] = useState('')
  const [cardComplete, setCardComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'card' | 'charging' | 'done'>('card')
  const stripeRef = useRef<StripeJs | null>(null)
  const cardRef = useRef<StripeElement | null>(null)

  useEffect(() => {
    if (!ready || stripeRef.current || !window.Stripe) return
    const stripe = window.Stripe(publishableKey, { locale: es ? 'es-419' : 'en' })
    const card = stripe.elements({ locale: es ? 'es-419' : 'en' }).create('card', { hidePostalCode: true, style: { base: { fontSize: '16px', fontFamily: 'Montserrat, system-ui, sans-serif', color: '#0f172a', '::placeholder': { color: '#94a3b8' } } } })
    card.mount('#card-element')
    card.on('change', (e) => { setError(e.error?.message ?? null); setCardComplete(Boolean(e.complete)) })
    stripeRef.current = stripe
    cardRef.current = card
  }, [ready, publishableKey, es])

  const messageFor = (j: { error?: string; plans?: number[]; message?: string | null }, status: number): string => {
    if (j.error === 'paid') return es ? 'Este pago ya se hizo. Gracias.' : 'This payment was already made. Thank you.'
    if (j.error === 'term-unsupported') {
      const others = (j.plans ?? []).filter((n) => [3, 6, 12].includes(n))
      return es
        ? `Tu tarjeta no admite ${term} meses sin intereses${others.length ? ` (sí admite ${others.join(', ')})` : ''}. No se hizo ningún cargo. Prueba con otra tarjeta o pídenos un enlace con otro plazo.`
        : `Your card does not support ${term} interest-free months${others.length ? ` (it supports ${others.join(', ')})` : ''}. Nothing was charged. Try another card or ask us for a different plan.`
    }
    if (j.error === 'declined') return es ? `El banco rechazó el cargo${j.message ? `: ${j.message}` : ''}. No se cobró nada; prueba con otra tarjeta.` : `The bank declined the charge${j.message ? `: ${j.message}` : ''}. Nothing was charged; try another card.`
    return j.message || j.error || (es ? `No se pudo procesar el pago (${status}).` : `The payment could not be processed (${status}).`)
  }

  async function pay(ev: React.FormEvent) {
    ev.preventDefault()
    const stripe = stripeRef.current, card = cardRef.current
    if (!stripe || !card || step !== 'card') return
    setError(null)
    setStep('charging')
    try {
      const pm = await stripe.createPaymentMethod('card', card, { billing_details: { name: name.trim() || undefined } })
      if (pm.error || !pm.paymentMethod) throw new Error(pm.error?.message || 'Tarjeta no válida')
      const r1 = await fetch('/api/pagar/intento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, paymentMethodId: pm.paymentMethod.id }) })
      const j1 = await r1.json().catch(() => ({}))
      if (!r1.ok) throw new Error(messageFor(j1, r1.status))
      const r2 = await fetch('/api/pagar/confirmar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, intentId: j1.intentId }) })
      const j2 = await r2.json().catch(() => ({}))
      if (!r2.ok) throw new Error(messageFor(j2, r2.status))
      let status: string = j2.status
      if (status === 'requires_action' && j2.clientSecret) {
        const next = await stripe.handleNextAction({ clientSecret: j2.clientSecret })
        if (next.error) throw new Error(next.error.message)
        status = next.paymentIntent?.status ?? 'unknown'
      }
      if (status !== 'succeeded' && status !== 'processing') throw new Error(es ? 'El pago no se completó. No se hizo ningún cargo.' : 'The payment did not complete. Nothing was charged.')
      setStep('done')
      window.location.assign(returnUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStep('card')
    }
  }

  const monthly = term ? charge / term : 0

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-10">
      <Script src="https://js.stripe.com/v3/" strategy="afterInteractive" onLoad={() => setReady(true)} onReady={() => setReady(true)} />
      <form onSubmit={pay} className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/imsoft-isotipo-correo-v3.png" alt="imSoft" width={40} height={52} className="mb-6" />
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">{es ? 'Cotización' : 'Quote'} {quoteNumber}</p>
        <h1 className="mt-1 text-lg font-semibold text-neutral-900">{concept}</h1>

        <div className="mt-5 rounded-xl bg-neutral-50 p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-neutral-600">{es ? 'Total' : 'Total'}</span>
            <span className="text-2xl font-semibold tabular-nums text-neutral-900">{formatMoney(charge, currency)}</span>
          </div>
          <div className="mt-1 flex items-baseline justify-between text-sm">
            <span className="text-neutral-600">{termLabel(term, es)}</span>
            {term > 0 && <span className="tabular-nums text-neutral-700">{term} × {formatMoney(monthly, currency)}</span>}
          </div>
          {term > 0 && <p className="mt-2 text-xs text-neutral-500">{es ? 'Solo con tarjeta de crédito mexicana participante. Si tu tarjeta no admite este plazo, te avisamos y no se cobra nada.' : 'Mexican participating credit cards only. If your card does not support this plan, we tell you and nothing is charged.'}</p>}
        </div>

        <label className="mt-6 block text-sm font-medium text-neutral-800" htmlFor="card-name">{es ? 'Nombre en la tarjeta' : 'Name on card'}</label>
        <input id="card-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="cc-name" required className="mt-1.5 w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-[#1E9DF1] focus:ring-2 focus:ring-[#1E9DF1]/20" />

        <label className="mt-4 block text-sm font-medium text-neutral-800">{es ? 'Datos de la tarjeta' : 'Card details'}</label>
        <div id="card-element" className="mt-1.5 rounded-lg border border-neutral-300 px-3 py-3">
          {!ready && <span className="text-sm text-neutral-400">{es ? 'Cargando…' : 'Loading…'}</span>}
        </div>

        {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={!ready || !cardComplete || step !== 'card'} className="mt-6 w-full rounded-lg bg-[#1E9DF1] px-4 py-3 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50">
          {step === 'charging' ? (es ? 'Procesando…' : 'Processing…') : step === 'done' ? (es ? 'Pago recibido' : 'Payment received') : (es ? `Pagar ${formatMoney(charge, currency)}` : `Pay ${formatMoney(charge, currency)}`)}
        </button>
        <p className="mt-3 text-center text-xs text-neutral-500">{es ? 'Pago procesado por Stripe. imSoft no guarda los datos de tu tarjeta.' : 'Processed by Stripe. imSoft never stores your card details.'}</p>
      </form>
    </main>
  )
}
