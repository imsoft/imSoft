import { describe, expect, it } from 'vitest'
import { netAfterStripe, stripeFee, surchargeToCoverStripe, validateCharge, withSurcharge } from './card-charge'

describe('card charge from a quote', () => {
  it('applies the surcharge to the amount', () => {
    expect(withSurcharge(33234, 5)).toBe(34895.7)
    expect(withSurcharge(33234, 0)).toBe(33234)
    expect(withSurcharge(100, -3)).toBe(100)
  })

  it('computes the Stripe fee with VAT and what is left', () => {
    // 34,895.70 * 3.6 % = 1,256.25 + 3 = 1,259.25; with VAT 1,460.72
    expect(stripeFee(34895.7)).toBe(1460.72)
    expect(netAfterStripe(34895.7)).toBe(33434.98)
    // 6 interest-free months add 7.5 % plus VAT
    expect(stripeFee(10000, 6)).toBe(round((10000 * 0.036 + 3 + 10000 * 0.075) * 1.16))
  })

  it('finds the surcharge that leaves the full amount after Stripe', () => {
    const pct = surchargeToCoverStripe(33234)
    expect(pct).toBeGreaterThan(4.3)
    expect(pct).toBeLessThan(4.5)
    expect(netAfterStripe(withSurcharge(33234, pct))).toBeGreaterThanOrEqual(33234)
    expect(netAfterStripe(withSurcharge(33234, pct - 0.05))).toBeLessThan(33234)
    expect(surchargeToCoverStripe(0)).toBe(0)
  })

  it('validates amount and surcharge', () => {
    expect(validateCharge(0, 5)).toMatch(/monto/)
    expect(validateCharge(5, 5)).toMatch(/mínimo/)
    expect(validateCharge(1000, 40)).toMatch(/0 a 30/)
    expect(validateCharge(33234, 5)).toBeNull()
  })
})

function round(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100 }
