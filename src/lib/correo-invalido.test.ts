import { describe, expect, it } from 'vitest'
import { buzonNoComercial, correoInvalido, tagsTrasCambiarCorreo } from './correo-invalido'

describe('correo invalido', () => {
  it('lo es por etiqueta (rebote o dominio sin correo) o por la lista marcada a mano', () => {
    expect(correoInvalido({ email: 'a@x.mx', tags: ['logistics', 'invalid-email'] })).toBe(true)
    expect(correoInvalido({ email: 'A@x.mx', invalid_emails: ['a@X.mx'] })).toBe(true)
    expect(correoInvalido({ email: 'a@x.mx', tags: ['logistics'], invalid_emails: ['otro@x.mx'] })).toBe(false)
    expect(correoInvalido({ email: 'a@x.mx' })).toBe(false)
  })

  it('sin correo no hay nada que marcar', () => {
    expect(correoInvalido({ email: null, tags: ['invalid-email'] })).toBe(false)
    expect(correoInvalido({ email: '  ', tags: ['invalid-email'] })).toBe(false)
  })

  it('al cambiar el correo se quita la marca; si es el mismo, se conserva', () => {
    expect(tagsTrasCambiarCorreo(['logistics', 'invalid-email'], 'a@x.mx', 'nuevo@x.mx')).toEqual(['logistics'])
    expect(tagsTrasCambiarCorreo(['invalid-email'], 'a@x.mx', 'nuevo@x.mx')).toBeNull()
    expect(tagsTrasCambiarCorreo(['logistics', 'invalid-email'], 'a@x.mx', ' A@X.mx ')).toEqual(['logistics', 'invalid-email'])
    expect(tagsTrasCambiarCorreo(null, 'a@x.mx', 'b@x.mx')).toBeNull()
  })
})

describe('buzones no comerciales', () => {
  it('privacidad, facturacion, RH y legal no son a quien venderle', () => {
    for (const e of ['privacidad@x.mx', 'privacidaddatos@constructoramonte.com.mx', 'aviso.privacidad@x.mx', 'datos-personales@x.mx', 'facturacion@x.mx', 'rh@x.mx', 'legal@station24.com', 'vacantes.gdl@x.mx']) expect(buzonNoComercial(e), e).toBe(true)
  })

  it('los buzones normales y los que solo se parecen si pasan', () => {
    for (const e of ['contacto@x.mx', 'ventas@x.mx', 'rhinos@x.mx', 'legalizaciones@x.mx', 'marco@x.mx', 'pagosyventas@x.mx', 'hola@privacidad.mx']) expect(buzonNoComercial(e), e).toBe(false)
    expect(buzonNoComercial(null)).toBe(false)
  })
})
