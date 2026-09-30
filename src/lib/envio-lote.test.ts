import { describe, expect, it } from 'vitest'
import { PAUSA_MAX_MS, PAUSA_MIN_MS, avisoDeCupo, cupoDeHoy, minutosDeLote, pausaEntreEnvios, puedeRecibirCorreo, resumenDeLote } from './envio-lote'

describe('envio en lote', () => {
  it('solo se puede elegir a quien tiene correo y no esta marcado como invalido', () => {
    expect(puedeRecibirCorreo({ email: 'a@x.mx' })).toBe(true)
    expect(puedeRecibirCorreo({ email: null })).toBe(false)
    expect(puedeRecibirCorreo({ email: '  ' })).toBe(false)
    expect(puedeRecibirCorreo({ email: 'a@x.mx', tags: ['correo-invalido'] })).toBe(false)
    expect(puedeRecibirCorreo({ email: 'a@x.mx', invalid_emails: ['A@x.mx'] })).toBe(false)
    // A quien ya se le escribio no entra al lote: su seguimiento va aparte y en su fecha.
    expect(puedeRecibirCorreo({ email: 'a@x.mx', correo: { tipo: 'enviado' } })).toBe(false)
    expect(puedeRecibirCorreo({ email: 'a@x.mx', correo: { tipo: 'respondio' } })).toBe(false)
    expect(puedeRecibirCorreo({ email: 'a@x.mx', correo: { tipo: 'borrador' } })).toBe(true)
    expect(puedeRecibirCorreo({ email: 'a@x.mx', correo: { tipo: 'ninguno' } })).toBe(true)
  })

  it('la pausa entre envios va de 20 a 45 segundos y cambia cada vez', () => {
    expect(pausaEntreEnvios(0)).toBe(PAUSA_MIN_MS)
    expect(pausaEntreEnvios(1)).toBe(PAUSA_MAX_MS)
    expect(pausaEntreEnvios(0.5)).toBe(32_500)
    expect(pausaEntreEnvios(7)).toBe(PAUSA_MAX_MS)
    for (let i = 0; i < 50; i++) {
      const p = pausaEntreEnvios()
      expect(p).toBeGreaterThanOrEqual(PAUSA_MIN_MS)
      expect(p).toBeLessThanOrEqual(PAUSA_MAX_MS)
    }
  })

  it('estima cuanto tarda el lote', () => {
    expect(minutosDeLote(1)).toBe(1)
    expect(minutosDeLote(25)).toBe(13)
  })

  it('resume el lote en una linea', () => {
    expect(resumenDeLote({ listos: 22, yaTenian: 1, errores: ['X: ya se le escribió', 'Y: dominio sin correo'] })).toBe('22 borradores listos · 1 ya tenía borrador · 2 sin preparar')
    expect(resumenDeLote({ listos: 1, yaTenian: 0, errores: [] })).toBe('1 borrador listo')
    expect(resumenDeLote({ listos: 0, yaTenian: 0, errores: [] })).toBe('No se preparó ningún correo')
  })

  it('el cupo de hoy descuenta lo enviado y los borradores que ya esperan', () => {
    expect(cupoDeHoy(25, 7, 2)).toEqual({ tope: 25, enviadosHoy: 7, enEspera: 2, caben: 16 })
    expect(cupoDeHoy(25, 24, 5).caben).toBe(0)
  })

  it('avisa cuando se eligen mas de los que caben hoy', () => {
    const cupo = cupoDeHoy(25, 18, 2)
    expect(avisoDeCupo(5, cupo)).toBeNull()
    expect(avisoDeCupo(8, cupo)).toBe('Elegiste 8 y hoy caben 5: los otros 3 quedan como borrador para mañana.')
    expect(avisoDeCupo(6, cupo)).toBe('Elegiste 6 y hoy caben 5: el otro queda como borrador para mañana.')
    expect(avisoDeCupo(3, cupoDeHoy(25, 19, 8))).toMatch(/^El límite de hoy ya está lleno/)
  })
})
