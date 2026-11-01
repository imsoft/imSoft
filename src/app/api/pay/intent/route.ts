import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { openPaymentLink } from '@/lib/pay-server'
import { paymentLinkMetadata } from '@/lib/payment-link-token'
import { cardSupportsTerm } from '@/lib/pay-term'

/**
 * Step 1 of the fixed-term charge: with the card already tokenized in the browser, creates
 * the PaymentIntent (unconfirmed) and checks that the card supports the agreed term. If it
 * doesn't, it cancels the intent and nothing is charged.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (typeof body.token !== 'string' || typeof body.paymentMethodId !== 'string') return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  const r = await openPaymentLink(body.token)
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status })
  const { link, quote, charge, paid } = r.opened
  if (link.term === undefined) return NextResponse.json({ error: 'Este enlace se paga en Stripe Checkout.' }, { status: 400 })
  if (paid) return NextResponse.json({ error: 'paid' }, { status: 409 })
  const metadata = paymentLinkMetadata({ link, quoteNumber: quote.number })
  const pi = await stripe!.paymentIntents.create({
    amount: Math.round(charge * 100),
    currency: String(quote.currency || 'MXN').toLowerCase(),
    payment_method: body.paymentMethodId,
    payment_method_types: ['card'],
    description: `${quote.number} · ${link.label}`,
    ...(quote.client_email ? { receipt_email: quote.client_email } : {}),
    metadata,
    payment_method_options: { card: { installments: { enabled: link.term > 0 } } },
  })
  const plans = pi.payment_method_options?.card?.installments?.available_plans ?? []
  if (!cardSupportsTerm(plans, link.term)) {
    await stripe!.paymentIntents.cancel(pi.id).catch(() => {})
    return NextResponse.json({ error: 'term-unsupported', plans: plans.map((p) => p.count) }, { status: 422 })
  }
  return NextResponse.json({ intentId: pi.id })
}
