import { describe, expect, it } from 'vitest'
import { isTerm, linkIdFromMetadata, linkSigningSecret, newLinkId, paidQueries, paymentLinkMetadata, readPaymentLink, signPaymentLink } from './payment-link-token'

const secret = linkSigningSecret('sk_test_123')
const data = { id: newLinkId(), quoteId: 'd8c50e31-cdc6-47d4-bfc8-a4b17ba1d779', amount: 99702, surchargePct: 5, label: 'Pago 1/3 del primer 50 %', installments: false }

describe('signed payment link', () => {
  it('round trip: what is signed reads back the same, including installments off', () => {
    expect(readPaymentLink(signPaymentLink(data, secret), secret)).toEqual(data)
    expect(readPaymentLink(signPaymentLink({ ...data, installments: true }, secret), secret)?.installments).toBe(true)
  })

  it('tokens signed before the English rename still verify and decode the same', () => {
    // Generated with the previous module (src/lib/enlace-pago.ts, firmarEnlace) and secret 'sk_test_123'.
    const legacy = 'eyJpIjoiUTJ4cFpXNTBaVXhwYm1zeCIsInEiOiJkOGM1MGUzMS1jZGM2LTQ3ZDQtYmZjOC1hNGIxN2JhMWQ3NzkiLCJtIjo5OTcwMiwiciI6NSwiZSI6IlBhZ28gMS8zIGRlbCBwcmltZXIgNTAgJSIsInMiOjB9.nOXpo1o12gdNDg3AvYO_e34_i-_gHP13X0zFrLcrZcc'
    const legacyWithTerm = 'eyJpIjoiUTJ4cFpXNTBaVXhwYm1zeCIsInEiOiJkOGM1MGUzMS1jZGM2LTQ3ZDQtYmZjOC1hNGIxN2JhMWQ3NzkiLCJtIjo5OTcwMiwiciI6NSwiZSI6IlBhZ28gMS8zIGRlbCBwcmltZXIgNTAgJSIsInMiOjEsInAiOjZ9.xvMyfrIsIH2pbrfviVK0FMXp9BLwv3cQXHOKAfIpRmY'
    const expected = { ...data, id: 'Q2xpZW50ZUxpbmsx' }
    expect(readPaymentLink(legacy, secret)).toEqual(expected)
    expect(readPaymentLink(legacyWithTerm, secret)).toEqual({ ...expected, installments: true, term: 6 })
    // And the new code signs byte-for-byte the same token for the same data.
    expect(signPaymentLink(expected, secret)).toBe(legacy)
    expect(signPaymentLink({ ...expected, installments: true, term: 6 }, secret)).toBe(legacyWithTerm)
  })

  it('the agreed term travels signed and old links still have none', () => {
    expect(readPaymentLink(signPaymentLink({ ...data, term: 6 }, secret), secret)).toEqual({ ...data, term: 6 })
    expect(readPaymentLink(signPaymentLink({ ...data, term: 0 }, secret), secret)?.term).toBe(0)
    expect(readPaymentLink(signPaymentLink(data, secret), secret)).not.toHaveProperty('term')
    const odd = Buffer.from(JSON.stringify({ i: data.id, q: data.quoteId, m: 1, r: 0, e: 'x', s: 0, p: 9 })).toString('base64url')
    expect(readPaymentLink(`${odd}.x`, secret)).toBeNull()
    expect(isTerm(12)).toBe(true)
    expect(isTerm(9)).toBe(false)
  })

  it('the token fits in a URL without escaping', () => {
    expect(signPaymentLink(data, secret)).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  })

  it('rejects a tampered token: nobody can lower the amount or turn installments on', () => {
    const [body, sig] = signPaymentLink(data, secret).split('.')
    const tampered = Buffer.from(JSON.stringify({ i: data.id, q: data.quoteId, m: 1, r: 0, e: 'x', s: 1 })).toString('base64url')
    expect(readPaymentLink(`${tampered}.${sig}`, secret)).toBeNull()
    expect(readPaymentLink(`${body}.${sig}x`, secret)).toBeNull()
    expect(readPaymentLink(signPaymentLink(data, secret), linkSigningSecret('sk_live_other'))).toBeNull()
    expect(readPaymentLink('garbage', secret)).toBeNull()
    expect(readPaymentLink('', secret)).toBeNull()
  })

  it('each link has its own id and the Stripe queries strip quotes, for the new and legacy keys', () => {
    expect(newLinkId()).not.toBe(newLinkId())
    expect(paidQueries("abc'OR'1")).toEqual(["metadata['link_id']:'abcOR1' AND status:'succeeded'", "metadata['enlace']:'abcOR1' AND status:'succeeded'"])
  })

  it('reads the link id from new and legacy PaymentIntent metadata', () => {
    expect(linkIdFromMetadata({ link_id: 'new1' })).toBe('new1')
    expect(linkIdFromMetadata({ enlace: 'old1', folio: 'COT-1' })).toBe('old1')
    expect(linkIdFromMetadata({})).toBeUndefined()
    expect(linkIdFromMetadata(null)).toBeUndefined()
  })

  it('writes English metadata keys that the link-id reader understands', () => {
    const md = paymentLinkMetadata({ link: { ...data, term: 6 }, quoteNumber: 'COT-2026-001' })
    expect(md).toEqual({ link_id: data.id, quote_id: data.quoteId, quote_number: 'COT-2026-001', base_amount: '99702', surcharge_pct: '5', installments: '0', term: '6' })
    expect(linkIdFromMetadata(md)).toBe(data.id)
    expect(paymentLinkMetadata({ link: data, quoteNumber: 'X' })).not.toHaveProperty('term')
  })

  it('signs nothing without a Stripe key', () => {
    expect(() => linkSigningSecret(undefined)).toThrow('STRIPE_SECRET_KEY')
  })
})
