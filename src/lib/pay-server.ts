/**
 * Server side of imsoft.io/pagar: opens the signed link, loads the quote and says whether
 * it was already paid. Used by the page and by the routes that create and confirm the
 * PaymentIntent.
 */
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { serviceClient } from '@/lib/quotes/server'
import { linkSigningSecret, paidQueries, readPaymentLink, type PaymentLinkData } from '@/lib/payment-link-token'
import { withSurcharge } from '@/lib/card-charge'

export interface OpenedLink {
  link: PaymentLinkData
  quote: { id: string; number: string; title: string; currency: string | null; token: string; lang: string | null; client_email: string | null }
  /** What is charged, surcharge included. */
  charge: number
  paid: boolean
}

export type OpenLinkResult = { ok: true; opened: OpenedLink } | { ok: false; status: number; error: 'stripe-unavailable' | 'invalid-link' | 'quote-not-found' }

/** The succeeded PaymentIntent for this link, if any (searching the new and the legacy metadata key). */
export async function findLinkPayment(linkId: string): Promise<Stripe.PaymentIntent | null> {
  if (!stripe) return null
  const results = await Promise.all(paidQueries(linkId).map((query) => stripe!.paymentIntents.search({ query, limit: 1 })))
  return results.find((r) => r.data.length)?.data[0] ?? null
}

export async function openPaymentLink(token: string): Promise<OpenLinkResult> {
  if (!stripe) return { ok: false, status: 503, error: 'stripe-unavailable' }
  const link = readPaymentLink(token, linkSigningSecret(process.env.STRIPE_SECRET_KEY))
  if (!link) return { ok: false, status: 400, error: 'invalid-link' }
  const { data: quote } = await serviceClient().from('quotes').select('id, number, title, currency, token, lang, client_email').eq('id', link.quoteId).maybeSingle()
  if (!quote) return { ok: false, status: 404, error: 'quote-not-found' }
  const paid = await findLinkPayment(link.id)
  return { ok: true, opened: { link, quote, charge: withSurcharge(link.amount, link.surchargePct), paid: paid !== null } }
}
