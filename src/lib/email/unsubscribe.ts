import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Signed (HMAC) token for the email unsubscribe links.
 *
 * No table and no stored tokens: the link carries the user id and an
 * HMAC signature. On unsubscribe we check the signature matches, so nobody
 * can unsubscribe another user by guessing their id.
 */

function getSecret(): string {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET
  if (!secret) {
    throw new Error('EMAIL_UNSUBSCRIBE_SECRET no está configurada')
  }
  return secret
}

/** Builds the HMAC signature (hex) for a user id. */
export function signUnsubscribe(userId: string): string {
  return createHmac('sha256', getSecret()).update(userId).digest('hex')
}

/** Checks in constant time that the token matches the userId. */
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
 * Builds the absolute unsubscribe URL for a user.
 * @param lang  language of the email ('es' | 'en') for the confirmation page.
 */
export function buildUnsubscribeUrl(userId: string, lang: string = 'es'): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const token = signUnsubscribe(userId)
  const params = new URLSearchParams({ u: userId, t: token, lang })
  return `${base}/api/unsubscribe?${params.toString()}`
}
