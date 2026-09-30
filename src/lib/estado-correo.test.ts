import { describe, expect, it } from 'vitest'
import { accionDeCorreo, estadoDeCorreo, etiquetaDeCorreo, fechaCorta, type FilaCorreo } from './estado-correo'

const f = (step: number, status: FilaCorreo['status'], sent_at: string | null = null): FilaCorreo => ({ id: `e${step}`, step, status, sent_at })

describe('estado de la secuencia de correos de un contacto', () => {
  it('sin correos, o solo descartados, se le puede escribir', () => {
    expect(estadoDeCorreo([])).toEqual({ tipo: 'ninguno' })
    expect(estadoDeCorreo([f(1, 'skipped')])).toEqual({ tipo: 'ninguno' })
    expect(accionDeCorreo({ tipo: 'ninguno' })).toBe('escribir')
  })

  it('con borrador pendiente, se abre ese borrador', () => {
    const e = estadoDeCorreo([f(1, 'draft')])
    expect(e).toEqual({ tipo: 'borrador', paso: 1, borradorId: 'e1' })
    expect(accionDeCorreo(e)).toBe('abrir-borrador')
    expect(etiquetaDeCorreo(e, '2026-09-30')).toBe('Borrador listo para revisar')
    expect(etiquetaDeCorreo(estadoDeCorreo([f(1, 'sent', '2026-09-20T16:00:00Z'), f(2, 'draft')]), '2026-09-30')).toBe('Seguimiento 1 listo para revisar')
  })

  it('enviado: dice cuando se mando y cuando toca el seguimiento (4 dias habiles)', () => {
    // Jueves 24-sep + 4 dias habiles = miercoles 30-sep.
    const e = estadoDeCorreo([f(1, 'sent', '2026-09-24T19:14:00Z')])
    expect(e).toEqual({ tipo: 'enviado', paso: 1, fecha: '2026-09-24', siguientePaso: 2, tocaEl: '2026-09-30' })
    expect(accionDeCorreo(e)).toBe('seguimiento')
    expect(etiquetaDeCorreo(e, '2026-09-28')).toBe('Enviado el 24 sep · seguimiento el 30 sep')
    expect(etiquetaDeCorreo(e, '2026-09-30')).toBe('Enviado el 24 sep · ya toca seguimiento')
  })

  it('tras el primer seguimiento todavia queda uno', () => {
    const e = estadoDeCorreo([f(1, 'sent', '2026-09-15T16:00:00Z'), f(2, 'sent', '2026-09-21T16:00:00Z')])
    expect(e.tipo === 'enviado' && e.siguientePaso).toBe(3)
    expect(etiquetaDeCorreo(e, '2026-09-22')).toMatch(/^Seguimiento 1 enviado el 21 sep · seguimiento el /)
  })

  it('si respondio o ya se mandaron los tres, no se le escribe mas desde aqui', () => {
    const r = estadoDeCorreo([f(1, 'replied', '2026-09-24T19:14:00Z')])
    expect(r.tipo).toBe('respondio')
    expect(accionDeCorreo(r)).toBeNull()
    const t = estadoDeCorreo([f(1, 'sent', '2026-09-01T16:00:00Z'), f(2, 'sent', '2026-09-07T16:00:00Z'), f(3, 'sent', '2026-09-15T16:00:00Z')])
    expect(t).toEqual({ tipo: 'terminado', fecha: '2026-09-15' })
    expect(etiquetaDeCorreo(t, '2026-09-30')).toBe('Secuencia terminada el 15 sep')
    // Un rebote cierra la secuencia.
    expect(estadoDeCorreo([f(1, 'closed', '2026-09-24T19:14:00Z')]).tipo).toBe('terminado')
    expect(accionDeCorreo(t)).toBeNull()
  })

  it('la fecha es la de Guadalajara: un envio de las 8:30 pm no cae al dia siguiente', () => {
    const e = estadoDeCorreo([f(1, 'sent', '2026-09-25T02:30:00Z')])
    expect(e.tipo === 'enviado' && e.fecha).toBe('2026-09-24')
  })

  it('fecha corta', () => {
    expect(fechaCorta('2026-09-04')).toBe('4 sep')
    expect(fechaCorta(null)).toBe('')
  })
})
