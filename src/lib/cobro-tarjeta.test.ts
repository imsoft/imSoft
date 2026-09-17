import { describe, expect, it } from 'vitest'
import { comisionStripe, montoConRecargo, netoTrasStripe, recargoQueCubreStripe, validarCobro } from './cobro-tarjeta'

describe('cobro con tarjeta desde la cotización', () => {
  it('aplica el recargo al monto', () => {
    expect(montoConRecargo(33234, 5)).toBe(34895.7)
    expect(montoConRecargo(33234, 0)).toBe(33234)
    expect(montoConRecargo(100, -3)).toBe(100)
  })

  it('calcula la comisión de Stripe con IVA y lo que queda', () => {
    // 34,895.70 * 3.6 % = 1,256.25 + 3 = 1,259.25; con IVA 1,460.72
    expect(comisionStripe(34895.7)).toBe(1460.72)
    expect(netoTrasStripe(34895.7)).toBe(33434.98)
    // Con 6 MSI se suma 7.5 % mas IVA
    expect(comisionStripe(10000, 6)).toBe(round((10000 * 0.036 + 3 + 10000 * 0.075) * 1.16))
  })

  it('dice qué recargo deja el monto completo tras Stripe', () => {
    const pct = recargoQueCubreStripe(33234)
    expect(pct).toBeGreaterThan(4.3)
    expect(pct).toBeLessThan(4.5)
    expect(netoTrasStripe(montoConRecargo(33234, pct))).toBeGreaterThanOrEqual(33234)
    expect(netoTrasStripe(montoConRecargo(33234, pct - 0.05))).toBeLessThan(33234)
    expect(recargoQueCubreStripe(0)).toBe(0)
  })

  it('valida monto y recargo', () => {
    expect(validarCobro(0, 5)).toMatch(/monto/)
    expect(validarCobro(5, 5)).toMatch(/mínimo/)
    expect(validarCobro(1000, 40)).toMatch(/0 a 30/)
    expect(validarCobro(33234, 5)).toBeNull()
  })
})

function round(n: number) { return Math.round((n + Number.EPSILON) * 100) / 100 }
