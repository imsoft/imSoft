import { describe, expect, it } from 'vitest'
import { isNonSalesMailbox, isInvalidEmail, tagsAfterEmailChange } from './invalid-email'

describe('invalid email', () => {
  it('is invalid by tag (bounce or domain without mail) or by the hand-marked list', () => {
    expect(isInvalidEmail({ email: 'a@x.mx', tags: ['logistics', 'invalid-email'] })).toBe(true)
    expect(isInvalidEmail({ email: 'A@x.mx', invalid_emails: ['a@X.mx'] })).toBe(true)
    expect(isInvalidEmail({ email: 'a@x.mx', tags: ['logistics'], invalid_emails: ['otro@x.mx'] })).toBe(false)
    expect(isInvalidEmail({ email: 'a@x.mx' })).toBe(false)
  })

  it('without an email there is nothing to mark', () => {
    expect(isInvalidEmail({ email: null, tags: ['invalid-email'] })).toBe(false)
    expect(isInvalidEmail({ email: '  ', tags: ['invalid-email'] })).toBe(false)
  })

  it('changing the email removes the mark; if it is the same one, it is kept', () => {
    expect(tagsAfterEmailChange(['logistics', 'invalid-email'], 'a@x.mx', 'nuevo@x.mx')).toEqual(['logistics'])
    expect(tagsAfterEmailChange(['invalid-email'], 'a@x.mx', 'nuevo@x.mx')).toBeNull()
    expect(tagsAfterEmailChange(['logistics', 'invalid-email'], 'a@x.mx', ' A@X.mx ')).toEqual(['logistics', 'invalid-email'])
    expect(tagsAfterEmailChange(null, 'a@x.mx', 'b@x.mx')).toBeNull()
  })
})

describe('non-sales mailboxes', () => {
  it('privacy, billing, HR and legal are not who to sell to', () => {
    for (const e of ['privacidad@x.mx', 'privacidaddatos@constructoramonte.com.mx', 'aviso.privacidad@x.mx', 'datos-personales@x.mx', 'facturacion@x.mx', 'rh@x.mx', 'legal@station24.com', 'vacantes.gdl@x.mx']) expect(isNonSalesMailbox(e), e).toBe(true)
  })

  it('normal mailboxes and lookalikes do pass', () => {
    for (const e of ['contacto@x.mx', 'ventas@x.mx', 'rhinos@x.mx', 'legalizaciones@x.mx', 'marco@x.mx', 'pagosyventas@x.mx', 'hola@privacidad.mx']) expect(isNonSalesMailbox(e), e).toBe(false)
    expect(isNonSalesMailbox(null)).toBe(false)
  })
})
