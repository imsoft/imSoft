import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { SITE_URL } from '@/lib/quotes/server'
import { openPaymentLink } from '@/lib/pay-server'
import { linkIdFromMetadata } from '@/lib/payment-link-token'
import { planForTerm } from '@/lib/pay-term'

/**
 * Step 2: confirms the PaymentIntent with the link's exact plan (or with no plan, as a
 * single payment). If the bank asks for 3D Secure, the browser handles it with the
 * client_secret.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (typeof body.token !== 'string' || typeof body.intentId !== 'string') return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  const r = await openPaymentLink(body.token)
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status })
  const { link, quote, charge, paid } = r.opened
  if (link.term === undefined) return NextResponse.json({ error: 'Este enlace se paga en Stripe Checkout.' }, { status: 400 })
  if (paid) return NextResponse.json({ error: 'paid' }, { status: 409 })
  const previous = await stripe!.paymentIntents.retrieve(body.intentId)
  // The intent must belong to this link and be for this amount: nobody confirms another one with this token.
  if (linkIdFromMetadata(previous.metadata) !== link.id || previous.amount !== Math.round(charge * 100)) return NextResponse.json({ error: 'El intento no corresponde a este enlace.' }, { status: 400 })
  if (previous.status === 'succeeded') return NextResponse.json({ status: 'succeeded' })
  const plan = planForTerm(link.term)
  const lang = quote.lang === 'en' ? 'en' : 'es'
  try {
    const pi = await stripe!.paymentIntents.confirm(body.intentId, {
      return_url: `${SITE_URL}/${lang}/pagar/${body.token}`,
      payment_method_options: { card: { installments: plan ? { plan } : { enabled: false } } },
    })
    return NextResponse.json({ status: pi.status, clientSecret: pi.client_secret })
  } catch (err) {
    const e = err as { code?: string; decline_code?: string; message?: string }
    return NextResponse.json({ error: 'declined', code: e.decline_code || e.code || null, message: e.message ?? null }, { status: 402 })
  }
}
