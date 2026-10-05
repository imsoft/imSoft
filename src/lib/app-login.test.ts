import { describe, expect, it } from 'vitest'
import { historialTras, normalizarCorreo, puedePedirCodigo } from './app-login'

const AHORA = 1_800_000_000_000
const hace = (seg: number) => AHORA - seg * 1000

describe('inicio de sesion de la app', () => {
  it('normaliza el correo y rechaza lo que no lo es', () => {
    expect(normalizarCorreo('  Ana@Empresa.MX ')).toBe('ana@empresa.mx')
    expect(normalizarCorreo('sin-arroba')).toBeNull()
    expect(normalizarCorreo(null)).toBeNull()
    expect(normalizarCorreo({ email: 'a@b.mx' })).toBeNull()
  })

  it('deja pedir el primer codigo y otro pasado un minuto', () => {
    expect(puedePedirCodigo([], AHORA)).toEqual({ ok: true })
    expect(puedePedirCodigo([hace(61)], AHORA)).toEqual({ ok: true })
  })

  it('frena un segundo codigo dentro del mismo minuto y dice cuanto esperar', () => {
    expect(puedePedirCodigo([hace(20)], AHORA)).toEqual({ ok: false, esperarSegundos: 40 })
  })

  it('frena el sexto codigo de la hora hasta que caduque el mas viejo', () => {
    const cinco = [hace(3000), hace(2400), hace(1800), hace(1200), hace(600)]
    expect(puedePedirCodigo(cinco, AHORA)).toEqual({ ok: false, esperarSegundos: 600 })
    // Los de hace mas de una hora ya no cuentan.
    expect(puedePedirCodigo([hace(4000), hace(3900), hace(3800), hace(3700), hace(3650), hace(120)], AHORA)).toEqual({ ok: true })
  })

  it('el historial que se guarda solo conserva la ultima hora', () => {
    expect(historialTras([hace(4000), hace(100)], AHORA)).toEqual([hace(100), AHORA])
  })
})
