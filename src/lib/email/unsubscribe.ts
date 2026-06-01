import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Token firmado (HMAC) para los enlaces de baja de correo.
 *
 * No usamos tabla ni guardamos tokens: el enlace lleva el id del usuario y una
 * firma HMAC. Al recibir la baja verificamos que la firma coincide, así nadie
 * puede dar de baja a otro usuario adivinando su id.
 */

function getSecret(): string {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET
  if (!secret) {
    throw new Error('EMAIL_UNSUBSCRIBE_SECRET no está configurada')
  }
  return secret
}

/** Genera la firma HMAC (hex) para un id de usuario. */
export function signUnsubscribe(userId: string): string {
  return createHmac('sha256', getSecret()).update(userId).digest('hex')
}

/** Verifica en tiempo constante que el token corresponde al userId. */
export function verifyUnsubscribe(userId: string, token: string): boolean {
  if (!userId || !token) return false
  try {
    const expected = signUnsubscribe(userId)
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(token, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * Construye la URL absoluta de baja para un usuario.
 * @param lang  idioma del correo ('es' | 'en') para la página de confirmación.
 */
export function buildUnsubscribeUrl(userId: string, lang: string = 'es'): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const token = signUnsubscribe(userId)
  const params = new URLSearchParams({ u: userId, t: token, lang })
  return `${base}/api/unsubscribe?${params.toString()}`
}
