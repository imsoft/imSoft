import { describe, expect, it } from 'vitest'
import { correoInvalido, tagsTrasCambiarCorreo } from './correo-invalido'

describe('correo invalido', () => {
  it('lo es por etiqueta (rebote o dominio sin correo) o por la lista marcada a mano', () => {
    expect(correoInvalido({ email: 'a@x.mx', tags: ['logistica', 'correo-invalido'] })).toBe(true)
    expect(correoInvalido({ email: 'A@x.mx', invalid_emails: ['a@X.mx'] })).toBe(true)
    expect(correoInvalido({ email: 'a@x.mx', tags: ['logistica'], invalid_emails: ['otro@x.mx'] })).toBe(false)
    expect(correoInvalido({ email: 'a@x.mx' })).toBe(false)
  })

  it('sin correo no hay nada que marcar', () => {
    expect(correoInvalido({ email: null, tags: ['correo-invalido'] })).toBe(false)
    expect(correoInvalido({ email: '  ', tags: ['correo-invalido'] })).toBe(false)
  })

  it('al cambiar el correo se quita la marca; si es el mismo, se conserva', () => {
    expect(tagsTrasCambiarCorreo(['logistica', 'correo-invalido'], 'a@x.mx', 'nuevo@x.mx')).toEqual(['logistica'])
    expect(tagsTrasCambiarCorreo(['correo-invalido'], 'a@x.mx', 'nuevo@x.mx')).toBeNull()
    expect(tagsTrasCambiarCorreo(['logistica', 'correo-invalido'], 'a@x.mx', ' A@X.mx ')).toEqual(['logistica', 'correo-invalido'])
    expect(tagsTrasCambiarCorreo(null, 'a@x.mx', 'b@x.mx')).toBeNull()
  })
})
