import { describe, expect, it } from 'vitest'
import { etiquetaPlazo, planParaPlazo, tarjetaAdmitePlazo } from './pagar-plazo'

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
})
