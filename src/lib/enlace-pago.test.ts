import { describe, expect, it } from 'vitest'
import { consultaPagado, firmarEnlace, leerEnlace, nuevoIdEnlace, secretoDeEnlaces } from './enlace-pago'

const secreto = secretoDeEnlaces('sk_test_123')
const datos = { id: nuevoIdEnlace(), quoteId: 'd8c50e31-cdc6-47d4-bfc8-a4b17ba1d779', monto: 99702, recargoPct: 5, etiqueta: 'Pago 1/3 del primer 50 %', msi: false }

describe('enlace de cobro firmado', () => {
  it('ida y vuelta: lo firmado se lee igual, incluido el MSI apagado', () => {
    expect(leerEnlace(firmarEnlace(datos, secreto), secreto)).toEqual(datos)
    expect(leerEnlace(firmarEnlace({ ...datos, msi: true }, secreto), secreto)?.msi).toBe(true)
  })

  it('el token cabe en una URL sin escapar nada', () => {
    expect(firmarEnlace(datos, secreto)).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  })

  it('rechaza un token alterado: nadie puede bajar el monto ni encender los MSI', () => {
    const [cuerpo, sig] = firmarEnlace(datos, secreto).split('.')
    const alterado = Buffer.from(JSON.stringify({ i: datos.id, q: datos.quoteId, m: 1, r: 0, e: 'x', s: 1 })).toString('base64url')
    expect(leerEnlace(`${alterado}.${sig}`, secreto)).toBeNull()
    expect(leerEnlace(`${cuerpo}.${sig}x`, secreto)).toBeNull()
    expect(leerEnlace(firmarEnlace(datos, secreto), secretoDeEnlaces('sk_live_otra'))).toBeNull()
    expect(leerEnlace('basura', secreto)).toBeNull()
    expect(leerEnlace('', secreto)).toBeNull()
  })

  it('cada enlace tiene su propio id y la consulta de Stripe no admite comillas', () => {
    expect(nuevoIdEnlace()).not.toBe(nuevoIdEnlace())
    expect(consultaPagado("abc'OR'1")).toBe("metadata['enlace']:'abcOR1' AND status:'succeeded'")
  })

  it('sin llave de Stripe no se firma nada', () => {
    expect(() => secretoDeEnlaces(undefined)).toThrow('STRIPE_SECRET_KEY')
  })
})
