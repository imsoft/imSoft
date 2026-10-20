import { describe, expect, it } from 'vitest'
import { empresaParaApp, validarNombreEmpresa } from './app-empresa'

describe('empresa desde la app', () => {
  it('valida el nombre', () => {
    expect(validarNombreEmpresa(' ')).toMatch(/nombre/)
    expect(validarNombreEmpresa('x'.repeat(121))).toMatch(/muy largo/)
    expect(validarNombreEmpresa('Valuadores de los Altos')).toBeNull()
  })
  it('resume la fila', () => {
    expect(empresaParaApp({ id: 'e1', name: 'Acme', logo_url: ' ' })).toEqual({ id: 'e1', nombre: 'Acme', logo: null })
  })
})
