/**
 * Mensajes y comentarios del cliente desde la app movil. Logica pura: validar lo que
 * escribe y resumir las filas de la base para que la app las pinte tal cual.
 */

export const MAX_MENSAJE = 2000
export const MAX_TITULO = 120

export interface MensajeApp {
  id: string
  texto: string
  /** unread | read | replied | archived, tal como lo lleva el panel. */
  estado: string
  fecha: string | null
}

export interface ComentarioApp {
  id: string
  titulo: string
  descripcion: string
  /** pending | reviewed | in-progress | completed | rejected */
  estado: string
  respuesta: string | null
  fecha: string | null
}

export function validarMensaje(texto: unknown): string | null {
  const t = typeof texto === 'string' ? texto.trim() : ''
  if (t.length < 5) return 'Escribe tu mensaje (al menos 5 caracteres).'
  if (t.length > MAX_MENSAJE) return `El mensaje es muy largo (máximo ${MAX_MENSAJE} caracteres).`
  return null
}

export function validarComentario(titulo: unknown, descripcion: unknown): string | null {
  const t = typeof titulo === 'string' ? titulo.trim() : ''
  const d = typeof descripcion === 'string' ? descripcion.trim() : ''
  if (t.length < 3) return 'Ponle un título (al menos 3 caracteres).'
  if (t.length > MAX_TITULO) return `El título es muy largo (máximo ${MAX_TITULO} caracteres).`
  if (d.length < 10) return 'Cuéntanos un poco más (al menos 10 caracteres).'
  if (d.length > MAX_MENSAJE) return `El comentario es muy largo (máximo ${MAX_MENSAJE} caracteres).`
  return null
}

export function mensajeParaApp(r: { id: string; message: string | null; status: string | null; created_at: string | null }): MensajeApp {
  return { id: r.id, texto: r.message ?? '', estado: r.status ?? 'unread', fecha: r.created_at }
}

export function comentarioParaApp(r: { id: string; title: string | null; description: string | null; status: string | null; admin_notes: string | null; created_at: string | null }): ComentarioApp {
  return { id: r.id, titulo: r.title ?? '', descripcion: r.description ?? '', estado: r.status ?? 'pending', respuesta: r.admin_notes?.trim() || null, fecha: r.created_at }
}

/** Nombre con el que firma el mensaje: el de su cuenta, si no el de su empresa, si no el correo. */
export function nombreParaMensaje(o: { nombre?: string | null; empresa?: string | null; email: string }): { first_name: string; last_name: string } {
  const n = (o.nombre ?? '').trim() || (o.empresa ?? '').trim() || o.email.split('@')[0]
  const [first, ...rest] = n.split(/\s+/)
  return { first_name: first, last_name: rest.join(' ') }
}
