/**
 * Card payment link for a quote, served by imsoft.io.
 *
 * Stripe Payment Links can't turn interest-free installments off: the terms come from the
 * Dashboard's global settings. A client paid a quote that didn't offer them at 6 months
 * (Sep 2026) and the account absorbed 7.5 % plus VAT. That's why the shared link is an
 * imsoft.io one that, when opened, creates a Checkout session with installments on or off
 * according to the quote.
 *
 * The link carries its data signed (HMAC): no new table is needed and nobody can change the
 * amount in the URL. Single use is checked in Stripe through the link `id`.
 *
 * WIRE FORMAT: tokens are already in clients' hands. The compact JSON keys
 * {i, q, m, r, e, s, p} and the HMAC context strings ('enlace-pago:' and
 * 'imsoft-enlaces-de-pago') must never change, or every link already sent stops working.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export interface PaymentLinkData {
  /** Unique link id: used to check in Stripe whether it was already paid. */
  id: string
  quoteId: string
  /** Base amount from the quote, before the surcharge. */
  amount: number
  surchargePct: number
  label: string
  /** Interest-free installments enabled (only for links without a fixed term). */
  installments: boolean
  /**
   * Agreed term: 0 = single payment, 3/6/12 = interest-free months. With a term, the
   * charge happens on imsoft.io with that exact plan (the client can't pick another).
   * Without a term (old links) it goes to Stripe Checkout with `installments` as always.
   */
  term?: Term
}

export const TERMS = [0, 3, 6, 12] as const
export type Term = (typeof TERMS)[number]

export function isTerm(v: unknown): v is Term {
  return (TERMS as readonly number[]).includes(v as number)
}

const b64 = (s: string | Buffer) => Buffer.from(s).toString('base64url')

function sign(body: string, secret: string): string {
  // The 'enlace-pago:' prefix is part of the wire format: changing it invalidates every link.
  return createHmac('sha256', secret).update(`enlace-pago:${body}`).digest('base64url')
}

export function newLinkId(): string {
  return randomBytes(9).toString('base64url')
}

/** URL token: base64url data + signature. */
export function signPaymentLink(d: PaymentLinkData, secret: string): string {
  const body = b64(JSON.stringify({ i: d.id, q: d.quoteId, m: d.amount, r: d.surchargePct, e: d.label, s: d.installments ? 1 : 0, ...(d.term === undefined ? {} : { p: d.term }) }))
  return `${body}.${sign(body, secret)}`
}

/** Returns the data when the signature is valid; null if the token was tampered with or is unusable. */
export function readPaymentLink(token: string, secret: string): PaymentLinkData | null {
  const [body, sig, ...rest] = String(token ?? '').split('.')
  if (!body || !sig || rest.length) return null
  const expected = Buffer.from(sign(body, secret))
  const received = Buffer.from(sig)
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null
  try {
    const o = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (typeof o.i !== 'string' || typeof o.q !== 'string' || typeof o.m !== 'number' || typeof o.r !== 'number' || typeof o.e !== 'string') return null
    if (o.p !== undefined && !isTerm(o.p)) return null
    return { id: o.i, quoteId: o.q, amount: o.m, surchargePct: o.r, label: o.e, installments: o.s === 1, ...(o.p === undefined ? {} : { term: o.p as Term }) }
  } catch {
    return null
  }
}

/** Signing key derived from the Stripe one: lives only on the server and needs no extra env var. */
export function linkSigningSecret(stripeKey: string | undefined): string {
  if (!stripeKey) throw new Error('Falta STRIPE_SECRET_KEY en el entorno.')
  // The 'imsoft-enlaces-de-pago' label is part of the wire format: changing it invalidates every link.
  return createHmac('sha256', stripeKey).update('imsoft-enlaces-de-pago').digest('hex')
}

/**
 * Metadata key holding the link id. New PaymentIntents carry `link_id`; the ones created
 * before the English rename (2026-10-31) carry `enlace`, so readers check both.
 */
export const LINK_ID_KEY = 'link_id'
export const LEGACY_LINK_ID_KEY = 'enlace'

/** Link id stored in a PaymentIntent's metadata, under the new or the legacy key. */
export function linkIdFromMetadata(metadata: Record<string, string> | null | undefined): string | undefined {
  return metadata?.[LINK_ID_KEY] ?? metadata?.[LEGACY_LINK_ID_KEY]
}

/**
 * Stripe search queries that find a succeeded payment for this link: one per metadata key
 * (Stripe search can't mix OR with AND, so the new and legacy keys are separate queries).
 */
export function paidQueries(linkId: string): string[] {
  const id = linkId.replace(/[^A-Za-z0-9_-]/g, '')
  return [LINK_ID_KEY, LEGACY_LINK_ID_KEY].map((k) => `metadata['${k}']:'${id}' AND status:'succeeded'`)
}

/**
 * Metadata carried by the session or the PaymentIntent; `link_id` is what single use is
 * checked against. Keys were Spanish before 2026-10-31 (enlace, folio, monto_base,
 * recargo_pct, msi, plazo): readers go through linkIdFromMetadata for the link id.
 */
export function paymentLinkMetadata(o: { link: PaymentLinkData; quoteNumber: string }): Record<string, string> {
  const { link } = o
  return {
    link_id: link.id,
    quote_id: link.quoteId,
    quote_number: o.quoteNumber,
    base_amount: String(link.amount),
    surcharge_pct: String(link.surchargePct),
    installments: link.installments ? '1' : '0',
    ...(link.term === undefined ? {} : { term: String(link.term) }),
  }
}
