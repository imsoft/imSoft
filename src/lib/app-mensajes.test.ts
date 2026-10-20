import { describe, expect, it } from 'vitest'
import { comentarioParaApp, mensajeParaApp, nombreParaMensaje, validarComentario, validarMensaje } from './app-mensajes'

describe('mensajes y comentarios desde la app', () => {
  it('valida lo que escribe el cliente', () => {
    expect(validarMensaje('  hola ')).toMatch(/al menos 5/)
    expect(validarMensaje('Necesito una factura')).toBeNull()
    expect(validarMensaje('x'.repeat(2001))).toMatch(/muy largo/)
    expect(validarComentario('ok', 'Esto es un comentario largo')).toMatch(/título/)
    expect(validarComentario('Reporte', 'corto')).toMatch(/un poco más/)
    expect(validarComentario('Reporte', 'El botón de pagar no abre en mi iPhone')).toBeNull()
  })

  it('resume las filas de la base con los nombres que usa la app', () => {
    expect(mensajeParaApp({ id: 'm1', message: 'Hola', status: null, created_at: '2026-10-19T10:00:00Z' })).toEqual({ id: 'm1', texto: 'Hola', estado: 'unread', fecha: '2026-10-19T10:00:00Z' })
    expect(comentarioParaApp({ id: 'c1', title: 'T', description: 'D', status: 'reviewed', admin_notes: '  ', created_at: null })).toEqual({ id: 'c1', titulo: 'T', descripcion: 'D', estado: 'reviewed', respuesta: null, fecha: null })
  })

  it('firma con el nombre de la cuenta, luego la empresa y al final el correo', () => {
    expect(nombreParaMensaje({ nombre: 'Álvaro Gutiérrez Navarro', email: 'a@x.mx' })).toEqual({ first_name: 'Álvaro', last_name: 'Gutiérrez Navarro' })
    expect(nombreParaMensaje({ nombre: ' ', empresa: 'Valuadores de los Altos', email: 'a@x.mx' })).toEqual({ first_name: 'Valuadores', last_name: 'de los Altos' })
    expect(nombreParaMensaje({ email: 'alvaro@x.mx' })).toEqual({ first_name: 'alvaro', last_name: '' })
  })
})
