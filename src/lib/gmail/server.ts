/**
 * Gmail por OAuth (solo servidor). Sin dependencias: token endpoint y API REST con fetch.
 * Alcances: enviar correo y leer hilos (para saber si contestaron).
 */
import { serviceClient, SITE_URL } from '@/lib/quotes/server'

export const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly', 'openid', 'email']
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
export const REDIRECT_URI = `${SITE_URL}/api/gmail/callback`

export function gmailConfigurado(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET)
}

export function urlDeConsentimiento(state: string): string {
  const p = new URLSearchParams({
    client_id: CLIENT_ID!,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`
}

interface TokenResponse { access_token: string; expires_in: number; refresh_token?: string; scope?: string; id_token?: string }

async function tokenRequest(params: Record<string, string>): Promise<TokenResponse> {
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: CLIENT_ID!, client_secret: CLIENT_SECRET!, ...params }),
  })
  if (!r.ok) throw new Error(`Google token ${r.status}: ${(await r.text()).slice(0, 200)}`)
  return r.json()
}

/** Intercambia el codigo del consentimiento y guarda la cuenta. */
export async function conectarCuenta(userId: string, code: string): Promise<string> {
  const t = await tokenRequest({ code, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI })
  if (!t.refresh_token) throw new Error('Google no devolvió refresh_token; vuelve a conectar con prompt=consent.')
  const perfil = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers: { Authorization: `Bearer ${t.access_token}` } }).then((r) => r.json())
  const email: string = perfil.emailAddress
  const db = serviceClient()
  const { error } = await db.from('gmail_accounts').upsert({
    user_id: userId,
    email,
    refresh_token: t.refresh_token,
    access_token: t.access_token,
    token_expiry: new Date(Date.now() + t.expires_in * 1000).toISOString(),
    scope: t.scope ?? GMAIL_SCOPES.join(' '),
    updated_at: new Date().toISOString(),
  })
  if (error) throw new Error(error.message)
  return email
}

export async function cuentaConectada(userId: string): Promise<{ email: string } | null> {
  const { data } = await serviceClient().from('gmail_accounts').select('email').eq('user_id', userId).maybeSingle()
  return data ? { email: data.email } : null
}

export async function desconectarCuenta(userId: string): Promise<void> {
  const db = serviceClient()
  const { data } = await db.from('gmail_accounts').select('refresh_token').eq('user_id', userId).maybeSingle()
  if (data?.refresh_token) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(data.refresh_token)}`, { method: 'POST' }).catch(() => {})
  }
  await db.from('gmail_accounts').delete().eq('user_id', userId)
}

/** Access token vigente para el usuario, renovandolo si hace falta. */
export async function accessToken(userId: string): Promise<{ token: string; email: string }> {
  const db = serviceClient()
  const { data } = await db.from('gmail_accounts').select('*').eq('user_id', userId).maybeSingle()
  if (!data) throw new Error('No hay una cuenta de Gmail conectada. Conéctala desde Prospección.')
  if (data.access_token && data.token_expiry && Date.parse(data.token_expiry) - Date.now() > 60_000) {
    return { token: data.access_token, email: data.email }
  }
  const t = await tokenRequest({ refresh_token: data.refresh_token, grant_type: 'refresh_token' })
  await db.from('gmail_accounts').update({ access_token: t.access_token, token_expiry: new Date(Date.now() + t.expires_in * 1000).toISOString(), updated_at: new Date().toISOString() }).eq('user_id', userId)
  return { token: t.access_token, email: data.email }
}

export async function enviarRaw(userId: string, raw: string, threadId?: string | null): Promise<{ id: string; threadId: string }> {
  const { token } = await accessToken(userId)
  const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(threadId ? { raw, threadId } : { raw }),
  })
  if (!r.ok) throw new Error(`Gmail send ${r.status}: ${(await r.text()).slice(0, 300)}`)
  return r.json()
}

/** Message-ID del correo enviado, para que los seguimientos vayan en el mismo hilo. */
export async function messageIdHeader(userId: string, messageId: string): Promise<string | null> {
  const { token } = await accessToken(userId)
  const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Message-ID`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) return null
  const j = await r.json()
  return j.payload?.headers?.find((h: { name: string; value: string }) => h.name.toLowerCase() === 'message-id')?.value ?? null
}

/** true si en el hilo hay algun mensaje que no mandamos nosotros. */
export async function hiloTieneRespuesta(userId: string, threadId: string): Promise<boolean> {
  const { token, email } = await accessToken(userId)
  const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=metadata&metadataHeaders=From`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) return false
  const j = await r.json()
  const mios = email.toLowerCase()
  return (j.messages ?? []).some((m: { payload?: { headers?: Array<{ name: string; value: string }> } }) => {
    const from = m.payload?.headers?.find((h) => h.name.toLowerCase() === 'from')?.value?.toLowerCase() ?? ''
    return from && !from.includes(mios)
  })
}
