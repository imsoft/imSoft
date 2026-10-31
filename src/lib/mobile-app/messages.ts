/**
 * The client's messages and comments from the mobile app. Pure logic: validate what they write
 * and summarize the database rows so the app renders them as is.
 */

export const MAX_MESSAGE = 2000
export const MAX_TITLE = 120

export interface AppMessage {
  id: string
  text: string
  /** unread | read | replied | archived, as the admin panel tracks it. */
  status: string
  date: string | null
}

export interface AppComment {
  id: string
  title: string
  description: string
  /** pending | reviewed | in-progress | completed | rejected */
  status: string
  reply: string | null
  date: string | null
}

export function validateMessage(text: unknown): string | null {
  const t = typeof text === 'string' ? text.trim() : ''
  if (t.length < 5) return 'Escribe tu mensaje (al menos 5 caracteres).'
  if (t.length > MAX_MESSAGE) return `El mensaje es muy largo (máximo ${MAX_MESSAGE} caracteres).`
  return null
}

export function validateComment(title: unknown, description: unknown): string | null {
  const t = typeof title === 'string' ? title.trim() : ''
  const d = typeof description === 'string' ? description.trim() : ''
  if (t.length < 3) return 'Ponle un título (al menos 3 caracteres).'
  if (t.length > MAX_TITLE) return `El título es muy largo (máximo ${MAX_TITLE} caracteres).`
  if (d.length < 10) return 'Cuéntanos un poco más (al menos 10 caracteres).'
  if (d.length > MAX_MESSAGE) return `El comentario es muy largo (máximo ${MAX_MESSAGE} caracteres).`
  return null
}

export function messageForApp(r: { id: string; message: string | null; status: string | null; created_at: string | null }): AppMessage {
  return { id: r.id, text: r.message ?? '', status: r.status ?? 'unread', date: r.created_at }
}

export function commentForApp(r: { id: string; title: string | null; description: string | null; status: string | null; admin_notes: string | null; created_at: string | null }): AppComment {
  return { id: r.id, title: r.title ?? '', description: r.description ?? '', status: r.status ?? 'pending', reply: r.admin_notes?.trim() || null, date: r.created_at }
}

/** Name the message is signed with: the account's, else the company's, else the email's. */
export function senderName(o: { name?: string | null; company?: string | null; email: string }): { first_name: string; last_name: string } {
  const n = (o.name ?? '').trim() || (o.company ?? '').trim() || o.email.split('@')[0]
  const [first, ...rest] = n.split(/\s+/)
  return { first_name: first, last_name: rest.join(' ') }
}
