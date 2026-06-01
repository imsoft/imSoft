import 'server-only'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

/**
 * Verifica un token de Cloudflare Turnstile contra el endpoint de siteverify.
 *
 * Se usa en formularios que NO pasan por Supabase Auth (p. ej. el de contacto),
 * donde la validación del captcha debe hacerse manualmente en el servidor.
 *
 * @returns true si el token es válido; false si es inválido o falta config.
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  remoteIp?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    console.error('[turnstile] TURNSTILE_SECRET_KEY no está configurada')
    return false
  }
  if (!token) return false

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (remoteIp) body.append('remoteip', remoteIp)

    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })
    const data = (await res.json()) as { success: boolean; 'error-codes'?: string[] }
    if (!data.success) {
      console.warn('[turnstile] Verificación fallida:', data['error-codes'])
    }
    return data.success === true
  } catch (e) {
    console.error('[turnstile] Error verificando token:', e)
    return false
  }
}
