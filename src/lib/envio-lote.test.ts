import { describe, expect, it } from 'vitest'
import { PAUSA_MAX_MS, PAUSA_MIN_MS, minutosDeLote, pausaEntreEnvios, puedeRecibirCorreo, resumenDeLote } from './envio-lote'

describe('envio en lote', () => {
  it('solo se puede elegir a quien tiene correo y no esta marcado como invalido', () => {
    expect(puedeRecibirCorreo({ email: 'a@x.mx' })).toBe(true)
    expect(puedeRecibirCorreo({ email: null })).toBe(false)
    expect(puedeRecibirCorreo({ email: '  ' })).toBe(false)
    expect(puedeRecibirCorreo({ email: 'a@x.mx', tags: ['correo-invalido'] })).toBe(false)
    expect(puedeRecibirCorreo({ email: 'a@x.mx', invalid_emails: ['A@x.mx'] })).toBe(false)
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
})
