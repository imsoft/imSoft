import { describe, expect, it } from 'vitest'
import { bodyField, legacyComment, legacyMessage } from './legacy'
import { commentForApp, messageForApp, senderName, validateComment, validateMessage } from './messages'

describe('messages and comments from the app', () => {
  it('validates what the client writes', () => {
    expect(validateMessage('  hola ')).toMatch(/al menos 5/)
    expect(validateMessage('Necesito una factura')).toBeNull()
    expect(validateMessage('x'.repeat(2001))).toMatch(/muy largo/)
    expect(validateComment('ok', 'Esto es un comentario largo')).toMatch(/título/)
    expect(validateComment('Reporte', 'corto')).toMatch(/un poco más/)
    expect(validateComment('Reporte', 'El botón de pagar no abre en mi iPhone')).toBeNull()
  })

  it('summarizes the rows with the English keys and keeps the Spanish shape', () => {
    const m = messageForApp({ id: 'm1', message: 'Hola', status: null, created_at: '2026-10-19T10:00:00Z' })
    expect(m).toEqual({ id: 'm1', text: 'Hola', status: 'unread', date: '2026-10-19T10:00:00Z' })
    expect(legacyMessage(m)).toEqual({ id: 'm1', texto: 'Hola', estado: 'unread', fecha: '2026-10-19T10:00:00Z' })
    const c = commentForApp({ id: 'c1', title: 'T', description: 'D', status: 'reviewed', admin_notes: '  ', created_at: null })
    expect(c).toEqual({ id: 'c1', title: 'T', description: 'D', status: 'reviewed', reply: null, date: null })
    expect(legacyComment(c)).toEqual({ id: 'c1', titulo: 'T', descripcion: 'D', estado: 'reviewed', respuesta: null, fecha: null })
  })

  it('reads request fields under the English name or the one older apps send', () => {
    expect(bodyField({ message: 'a' }, 'message', 'mensaje')).toBe('a')
    expect(bodyField({ mensaje: 'b' }, 'message', 'mensaje')).toBe('b')
    expect(bodyField({}, 'message', 'mensaje')).toBeUndefined()
  })

  it('signs with the account name, then the company and finally the email', () => {
    expect(senderName({ name: 'Álvaro Gutiérrez Navarro', email: 'a@x.mx' })).toEqual({ first_name: 'Álvaro', last_name: 'Gutiérrez Navarro' })
    expect(senderName({ name: ' ', company: 'Valuadores de los Altos', email: 'a@x.mx' })).toEqual({ first_name: 'Valuadores', last_name: 'de los Altos' })
    expect(senderName({ email: 'alvaro@x.mx' })).toEqual({ first_name: 'alvaro', last_name: '' })
  })
})
