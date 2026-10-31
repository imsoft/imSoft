import { describe, expect, it } from 'vitest'
import { datosDeSuscripcion, etiquetaCobroPlan, lineasDelPlan, mensualidadesCobradas, metadataDelPlan, planLiquidado } from './plan-mensual'

describe('plan mensual con Stripe', () => {
  it('arma el anticipo como cargo único y la mensualidad como recurrente, en centavos', () => {
    const l = lineasDelPlan({ titulo: 'Sistema de pedidos', currency: 'MXN', anticipo: 18900, mensualidad: 2887.5, months: 24 })
    expect(l[0].price_data).toMatchObject({ currency: 'mxn', unit_amount: 1890000 })
    expect(l[0].price_data.recurring).toBeUndefined()
    expect(l[1].price_data).toMatchObject({ currency: 'mxn', unit_amount: 288750, recurring: { interval: 'month' } })
    expect(l[1].price_data.product_data.description).toContain('24 mensualidades')
    expect(metadataDelPlan({ projectId: 'p1', quoteId: 'q1', plan: { months: 24, deposit_pct: 30, surcharge_pct: 40 } })).toEqual({ project_id: 'p1', quote_id: 'q1', plan: '1', months: '24' })
  })

  it('cuenta las mensualidades cobradas por las notas y sabe cuándo se liquidó', () => {
    const notas = [etiquetaCobroPlan({ esAnticipo: true, numero: 0, months: 24, invoiceId: 'in_1' }), etiquetaCobroPlan({ esAnticipo: false, numero: 1, months: 24, invoiceId: 'in_2' }), 'Transferencia', etiquetaCobroPlan({ esAnticipo: false, numero: 2, months: 24, invoiceId: 'in_3' }), null]
    expect(mensualidadesCobradas(notas)).toBe(2)
    expect(planLiquidado(2, 24)).toBe(false)
    expect(planLiquidado(24, 24)).toBe(true)
  })

  it('lee la suscripción de la factura en el formato nuevo y en el viejo del API', () => {
    expect(datosDeSuscripcion({ parent: { subscription_details: { subscription: 'sub_1', metadata: { project_id: 'p1', months: '24' } } }, billing_reason: 'subscription_cycle' })).toEqual({ subscriptionId: 'sub_1', metadata: { project_id: 'p1', months: '24' }, billingReason: 'subscription_cycle' })
    expect(datosDeSuscripcion({ subscription: { id: 'sub_2' }, subscription_details: { metadata: { project_id: 'p2' } } })).toEqual({ subscriptionId: 'sub_2', metadata: { project_id: 'p2' }, billingReason: null })
    expect(datosDeSuscripcion({})).toEqual({ subscriptionId: null, metadata: {}, billingReason: null })
  })
})
