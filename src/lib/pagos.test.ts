import { describe, expect, it } from 'vitest'
import { pagoValido } from './pagos'

describe('pago desde el panel', () => {
  const base = { amount: '40000', currency: 'MXN', payment_method: 'transfer', payment_date: '2026-10-06', status: 'completed', notes: ' Anticipo ' }

  it('acepta el formulario tal cual lo manda el panel y limpia las notas', () => {
    expect(pagoValido(base)).toEqual({ amount: 40000, currency: 'MXN', payment_method: 'transfer', payment_date: '2026-10-06', status: 'completed', notes: 'Anticipo' })
    expect(pagoValido({ ...base, notes: '  ', currency: '' })).toMatchObject({ notes: null, currency: 'MXN' })
  })

  it('rechaza importes, metodos, estados o fechas que no existen', () => {
    expect(pagoValido(null)).toBeNull()
    expect(pagoValido({ ...base, amount: '0' })).toBeNull()
    expect(pagoValido({ ...base, amount: 'abc' })).toBeNull()
    expect(pagoValido({ ...base, payment_method: 'bitcoin' })).toBeNull()
    expect(pagoValido({ ...base, status: 'refunded' })).toBeNull()
    expect(pagoValido({ ...base, payment_date: '06/10/2026' })).toBeNull()
  })
})
