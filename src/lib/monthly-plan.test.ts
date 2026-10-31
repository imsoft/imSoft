import { describe, expect, it } from 'vitest'
import { monthlyFeesCharged, planChargeLabel, planLineItems, planMetadata, planMonths, planPaidOff, subscriptionFromInvoice } from './monthly-plan'

describe('monthly plan with Stripe', () => {
  it('builds the deposit as a one-off charge and the monthly fee as recurring, in cents', () => {
    const l = planLineItems({ title: 'Sistema de pedidos', currency: 'MXN', deposit: 18900, monthlyFee: 2887.5, months: 24 })
    expect(l[0].price_data).toMatchObject({ currency: 'mxn', unit_amount: 1890000 })
    expect(l[0].price_data.recurring).toBeUndefined()
    expect(l[1].price_data).toMatchObject({ currency: 'mxn', unit_amount: 288750, recurring: { interval: 'month' } })
    expect(l[1].price_data.product_data.description).toContain('24 mensualidades')
    expect(planMetadata({ projectId: 'p1', quoteId: 'q1', plan: { months: 24, deposit_pct: 30, surcharge_pct: 40 } })).toEqual({ project_id: 'p1', quote_id: 'q1', plan: '1', months: '24' })
  })

  it('reads the number of months from new and legacy subscription metadata', () => {
    expect(planMonths({ plan: '1', months: '24' })).toBe(24)
    expect(planMonths({ plan: '1', meses: '12' })).toBe(12)
    expect(planMonths({ plan: '1' })).toBe(0)
    expect(planMonths(null)).toBe(0)
  })

  it('keeps the stored notes format exactly as before', () => {
    expect(planChargeLabel({ isDeposit: true, number: 0, months: 24, invoiceId: 'in_1' })).toBe('Plan mensual · Anticipo · Stripe Invoice in_1')
    expect(planChargeLabel({ isDeposit: false, number: 3, months: 24, invoiceId: 'in_9' })).toBe('Plan mensual · Mensualidad 3/24 · Stripe Invoice in_9')
  })

  it('counts the monthly fees charged from the notes and knows when it was paid off', () => {
    const notes = [planChargeLabel({ isDeposit: true, number: 0, months: 24, invoiceId: 'in_1' }), planChargeLabel({ isDeposit: false, number: 1, months: 24, invoiceId: 'in_2' }), 'Transferencia', 'Plan mensual · Mensualidad 2/24 · Stripe Invoice in_3', null]
    expect(monthlyFeesCharged(notes)).toBe(2)
    expect(planPaidOff(2, 24)).toBe(false)
    expect(planPaidOff(24, 24)).toBe(true)
  })

  it('reads the subscription from the invoice in the new and the old API format', () => {
    expect(subscriptionFromInvoice({ parent: { subscription_details: { subscription: 'sub_1', metadata: { project_id: 'p1', months: '24' } } }, billing_reason: 'subscription_cycle' })).toEqual({ subscriptionId: 'sub_1', metadata: { project_id: 'p1', months: '24' }, billingReason: 'subscription_cycle' })
    expect(subscriptionFromInvoice({ subscription: { id: 'sub_2' }, subscription_details: { metadata: { project_id: 'p2' } } })).toEqual({ subscriptionId: 'sub_2', metadata: { project_id: 'p2' }, billingReason: null })
    expect(subscriptionFromInvoice({})).toEqual({ subscriptionId: null, metadata: {}, billingReason: null })
  })
})
