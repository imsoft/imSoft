import { describe, expect, it } from 'vitest'
import { legacyQuote } from './legacy'
import { quotesForApp } from './quotes'

const TODAY = new Date('2026-10-06T12:00:00Z')
const row = (extra: Record<string, unknown>) => ({
  id: 'q1', number: 'COT-2026-001', title: 'Tienda en línea', status: 'sent', token: 'tok', lang: 'es', currency: 'MXN',
  items: [{ name: 'Tienda', description: '', quantity: 1, price: 10000 }], apply_iva: true, discount: null, valid_until: '2026-10-20',
  ...extra,
})

describe('quotes for the app', () => {
  it('computes the total with VAT, builds the public url and maps the status', () => {
    const [q] = quotesForApp([row({})] as never, 'https://www.imsoft.io', TODAY)
    expect(q).toEqual({
      id: 'q1', number: 'COT-2026-001', title: 'Tienda en línea', status: 'sent', total: 11600, paymentOption: null, currency: 'MXN', vatIncluded: true,
      validUntil: '2026-10-20', url: 'https://www.imsoft.io/es/cotizacion/tok',
    })
  })

  it('accepted, rejected and expired (by status or by date); drafts never go out', () => {
    const list = quotesForApp([
      row({ id: 'a', status: 'accepted' }),
      row({ id: 'r', status: 'rejected' }),
      row({ id: 'e', status: 'expired' }),
      row({ id: 'v', status: 'sent', valid_until: '2026-10-01' }),
      row({ id: 'd', status: 'draft' }),
    ] as never, 'https://www.imsoft.io', TODAY)
    expect(list.map((q) => [q.id, q.status])).toEqual([['a', 'accepted'], ['r', 'rejected'], ['e', 'expired'], ['v', 'expired']])
  })

  it('once accepted, the total is the one of the payment option the client chose', () => {
    const payment = { milestones: [{ label: 'Anticipo', pct: 50 }, { label: 'Liquidación', pct: 50 }], card_installments: true, transfer_discount_pct: 5 }
    const [t] = quotesForApp([row({ status: 'accepted', payment, accepted_payment_option: 'transfer', items: [{ name: 'x', quantity: 1, price: 50000 }] })] as never, 'https://x', TODAY)
    expect(t.total).toBe(55100)
    expect(t.paymentOption).toBe('Transferencia bancaria')
    const [m] = quotesForApp([row({ status: 'accepted', payment, accepted_payment_option: 'installments_12', items: [{ name: 'x', quantity: 1, price: 50000 }] })] as never, 'https://x', TODAY)
    expect(m.paymentOption).toBe('Tarjeta a 12 meses sin intereses')
    expect(m.total).toBeGreaterThan(58000)
    // Sent (no choice yet): list price and no payment option.
    const [s] = quotesForApp([row({ payment, accepted_payment_option: null })] as never, 'https://x', TODAY)
    expect(s.paymentOption).toBeNull()
  })

  it('without VAT and with a discount uses the same math as the document', () => {
    const [q] = quotesForApp([row({ apply_iva: false, discount: { type: 'pct', value: 10, reason: 'promo' } })] as never, 'https://x', TODAY)
    expect(q.total).toBe(9000)
    expect(q.vatIncluded).toBe(false)
  })

  it('keeps the Spanish shape that published apps decode', () => {
    const [q] = quotesForApp([row({ status: 'accepted' })] as never, 'https://www.imsoft.io', TODAY)
    expect(legacyQuote(q)).toEqual({
      id: 'q1', folio: 'COT-2026-001', titulo: 'Tienda en línea', estado: 'aceptada', total: 11600, formaDePago: null, moneda: 'MXN', ivaIncluido: true,
      vigencia: '2026-10-20', enlace: 'https://www.imsoft.io/es/cotizacion/tok',
    })
  })
})
