import { describe, expect, it } from 'vitest'
import { etiquetaPlazo, planParaPlazo, resumenPagoHecho, tarjetaAdmitePlazo } from './pagar-plazo'

describe('plazo fijo del enlace de pago', () => {
  const planes = [{ count: 3, interval: 'month', type: 'fixed_count' }, { count: 6, interval: 'month', type: 'fixed_count' }]

  it('a una exhibición siempre se puede; a meses solo si la tarjeta trae ese plan', () => {
    expect(tarjetaAdmitePlazo(null, 0)).toBe(true)
    expect(tarjetaAdmitePlazo(planes, 6)).toBe(true)
    expect(tarjetaAdmitePlazo(planes, 12)).toBe(false)
    expect(tarjetaAdmitePlazo([], 3)).toBe(false)
  })

  it('arma el plan que se confirma en Stripe', () => {
    expect(planParaPlazo(6)).toEqual({ count: 6, interval: 'month', type: 'fixed_count' })
    expect(planParaPlazo(0)).toBeNull()
  })

  it('describe el plazo', () => {
    expect(etiquetaPlazo(0)).toBe('Una sola exhibición')
    expect(etiquetaPlazo(12)).toBe('12 meses sin intereses')
    expect(etiquetaPlazo(3, false)).toBe('3 interest-free months')
  })

  it('al pagar dice monto, concepto, plazo y fecha; al reabrir el enlace avisa que ya se usó', () => {
    const base = { cobro: 28614.47, etiqueta: 'Pago 3 de 4', folio: 'COT-2026-001', fecha: new Date('2026-10-15T23:01:00Z'), plazo: 6 as const }
    const r = resumenPagoHecho({ ...base, recien: true })
    expect(r.titulo).toBe('¡Recibimos tu pago!')
    expect(r.texto).toBe('Pago 3 de 4 de la cotización COT-2026-001: $28,614.47 a 6 meses sin intereses, pagado el 15 de octubre de 2026.')
    expect(r.detalle).toMatch(/comprobante por correo/)
    const v = resumenPagoHecho({ ...base, recien: false, plazo: 0 })
    expect(v.titulo).toBe('Este pago ya está hecho')
    expect(v.texto).not.toMatch(/meses/)
    expect(v.detalle).toMatch(/un solo pago/)
  })
})
