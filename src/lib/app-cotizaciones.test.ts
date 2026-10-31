import { describe, expect, it } from 'vitest'
import { cotizacionesParaApp } from './app-cotizaciones'

const HOY = new Date('2026-10-06T12:00:00Z')
const fila = (extra: Record<string, unknown>) => ({
  id: 'q1', folio: 'COT-2026-001', title: 'Tienda en línea', status: 'sent', token: 'tok', lang: 'es', currency: 'MXN',
  items: [{ concepto: 'Tienda', descripcion: '', cantidad: 1, precio: 10000 }], apply_iva: true, discount: null, valid_until: '2026-10-20',
  ...extra,
})

describe('cotizaciones para la app', () => {
  it('calcula el total con IVA, arma el enlace publico y traduce el estado', () => {
    const [c] = cotizacionesParaApp([fila({})] as never, 'https://www.imsoft.io', HOY)
    expect(c).toEqual({
      id: 'q1', folio: 'COT-2026-001', titulo: 'Tienda en línea', estado: 'enviada', total: 11600, formaDePago: null, moneda: 'MXN', ivaIncluido: true,
      vigencia: '2026-10-20', enlace: 'https://www.imsoft.io/es/cotizacion/tok',
    })
  })

  it('aceptada, rechazada y vencida (por estado o por fecha); los borradores no salen', () => {
    const lista = cotizacionesParaApp([
      fila({ id: 'a', status: 'accepted' }),
      fila({ id: 'r', status: 'rejected' }),
      fila({ id: 'e', status: 'expired' }),
      fila({ id: 'v', status: 'sent', valid_until: '2026-10-01' }),
      fila({ id: 'd', status: 'draft' }),
    ] as never, 'https://www.imsoft.io', HOY)
    expect(lista.map((c) => [c.id, c.estado])).toEqual([['a', 'aceptada'], ['r', 'rechazada'], ['e', 'vencida'], ['v', 'vencida']])
  })

  it('ya aceptada, el total es el de la forma de pago que eligió el cliente', () => {
    const payment = { hitos: [{ label: 'Anticipo', pct: 50 }, { label: 'Liquidación', pct: 50 }], msi: true, descuento_transferencia_pct: 5 }
    const [t] = cotizacionesParaApp([fila({ status: 'accepted', payment, accepted_payment_option: 'transferencia', items: [{ concepto: 'x', cantidad: 1, precio: 50000 }] })] as never, 'https://x', HOY)
    expect(t.total).toBe(55100)
    expect(t.formaDePago).toBe('Transferencia bancaria')
    const [m] = cotizacionesParaApp([fila({ status: 'accepted', payment, accepted_payment_option: 'msi12', items: [{ concepto: 'x', cantidad: 1, precio: 50000 }] })] as never, 'https://x', HOY)
    expect(m.formaDePago).toBe('Tarjeta a 12 meses sin intereses')
    expect(m.total).toBeGreaterThan(58000)
    // Enviada (aún sin elegir): precio de lista y sin forma de pago.
    const [e] = cotizacionesParaApp([fila({ payment, accepted_payment_option: null })] as never, 'https://x', HOY)
    expect(e.formaDePago).toBeNull()
  })

  it('sin IVA y con descuento usa el mismo calculo que el documento', () => {
    const [c] = cotizacionesParaApp([fila({ apply_iva: false, discount: { tipo: 'pct', valor: 10, motivo: 'promo' } })] as never, 'https://x', HOY)
    expect(c.total).toBe(9000)
    expect(c.ivaIncluido).toBe(false)
  })
})
