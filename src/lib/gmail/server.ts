/**
 * Gmail via OAuth (server only). No dependencies: token endpoint and REST API with fetch.
 * Scopes: send email and read threads (to know whether they replied).
 */
import { serviceClient, SITE_URL } from '@/lib/quotes/server'
import { failedRecipient, foreignMessageType } from '@/lib/outreach'
import { isRateLimitResponse, GMAIL_RATE_LIMIT_MESSAGE } from '@/lib/batch-send'

/**
 * Pace of batch reads (reply and bounce checks): each query takes at least
 * this long, so a check doesn't eat Gmail's per-minute limit and leave
 * the sends without quota. threads.get costs 10 units and messages.get 5: that keeps it at
 * about 60 units per second, less than half the limit.
 */
const THREAD_PACE_MS = 170
const MESSAGE_PACE_MS = 85

async function paced<T>(minMs: number, f: () => Promise<T>): Promise<T> {
  const start = Date.now()
  const r = await f()
  const remaining = minMs - (Date.now() - start)
  if (remaining > 0) await new Promise((ok) => setTimeout(ok, remaining))
  return r
}

export const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly', 'openid', 'email']
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET
export const REDIRECT_URI = `${SITE_URL}/api/gmail/callback`

export function gmailConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET)
}

export function consentUrl(state: string): string {
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

/** Exchanges the consent code and stores the account. */
export async function connectAccount(userId: string, code: string): Promise<string> {
  const t = await tokenRequest({ code, grant_type: 'authorization_code', redirect_uri: REDIRECT_URI })
  if (!t.refresh_token) throw new Error('Google no devolvió refresh_token; vuelve a conectar con prompt=consent.')
  const profile = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', { headers: { Authorization: `Bearer ${t.access_token}` } }).then((r) => r.json())
  const email: string = profile.emailAddress
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

export async function connectedAccount(userId: string): Promise<{ email: string } | null> {
  const { data } = await serviceClient().from('gmail_accounts').select('email').eq('user_id', userId).maybeSingle()
  return data ? { email: data.email } : null
}

export async function disconnectAccount(userId: string): Promise<void> {
  const db = serviceClient()
  const { data } = await db.from('gmail_accounts').select('refresh_token').eq('user_id', userId).maybeSingle()
  if (data?.refresh_token) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(data.refresh_token)}`, { method: 'POST' }).catch(() => {})
  }
  await db.from('gmail_accounts').delete().eq('user_id', userId)
}

/** Valid access token for the user, refreshing it if needed. */
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

export async function sendRaw(userId: string, raw: string, threadId?: string | null): Promise<{ id: string; threadId: string }> {
  const { token } = await accessToken(userId)
  const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(threadId ? { raw, threadId } : { raw }),
  })
  if (!r.ok) {
    const body = await r.text()
    if (isRateLimitResponse(r.status, body)) throw new Error(GMAIL_RATE_LIMIT_MESSAGE)
    throw new Error(`Gmail send ${r.status}: ${body.slice(0, 300)}`)
  }
  return r.json()
}

/** Message-ID of the sent email, so follow-ups go in the same thread. */
export async function messageIdHeader(userId: string, messageId: string): Promise<string | null> {
  const { token } = await accessToken(userId)
  const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=metadata&metadataHeaders=Message-ID`, { headers: { Authorization: `Bearer ${token}` } })
  if (!r.ok) return null
  const j = await r.json()
  return j.payload?.headers?.find((h: { name: string; value: string }) => h.name.toLowerCase() === 'message-id')?.value ?? null
}

/**
 * What's in the thread besides what we sent: a reply from the prospect, a bounce
 * notice or nothing. A real reply wins even if there are bounces too. Delay notices
 * don't count: Gmail retries for up to 48 h and the email may still arrive. Automatic
 * replies (out of office) don't either: nobody read the email.
 */
export async function threadStatus(userId: string, threadId: string): Promise<'reply' | 'bounce' | null> {
  const { token, email } = await accessToken(userId)
  const r = await paced(THREAD_PACE_MS, () => fetch(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Auto-Submitted`, { headers: { Authorization: `Bearer ${token}` } }))
  if (!r.ok) return null
  const j = await r.json()
  const ownAddress = email.toLowerCase()
  const kinds = (j.messages ?? []).map((m: { payload?: { headers?: Array<{ name: string; value: string }> } }) => {
    const h = (n: string) => m.payload?.headers?.find((x) => x.name.toLowerCase() === n)?.value ?? ''
    const from = h('from')
    if (!from || from.toLowerCase().includes(ownAddress)) return null
    return foreignMessageType(from, h('subject'), h('auto-submitted'))
  })
  if (kinds.includes('reply')) return 'reply'
  if (kinds.includes('bounce')) return 'bounce'
  return null
}

/**
 * Emails that bounced permanently in the last `days`, reading the mailer-daemon notices
 * across the whole inbox. Covers those that arrive outside the send's thread and those for
 * emails sent by hand, which `threadStatus` doesn't see.
 */
export async function recentBounces(userId: string, days = 30): Promise<string[]> {
  const { token } = await accessToken(userId)
  const auth = { headers: { Authorization: `Bearer ${token}` } }
  const ids: string[] = []
  let pageToken: string | undefined
  for (let i = 0; i < 5; i += 1) {
    const q = encodeURIComponent(`from:mailer-daemon newer_than:${days}d`)
    const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=100${pageToken ? `&pageToken=${pageToken}` : ''}`, auth)
    if (!r.ok) break
    const j = await r.json()
    ids.push(...((j.messages ?? []) as Array<{ id: string }>).map((m) => m.id))
    pageToken = j.nextPageToken
    if (!pageToken) break
  }
  const failed = new Set<string>()
  for (const id of ids) {
    const r = await paced(MESSAGE_PACE_MS, () => fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=X-Failed-Recipients`, auth))
    if (!r.ok) continue
    const m = await r.json()
    const h = (n: string) => (m.payload?.headers as Array<{ name: string; value: string }> | undefined)?.find((x) => x.name.toLowerCase() === n)?.value ?? ''
    // Permanent failures only: delay notices don't count.
    if (foreignMessageType(h('from'), h('subject')) !== 'bounce') continue
    const email = failedRecipient(h('x-failed-recipients'), m.snippet as string)
    if (email) failed.add(email)
  }
  return [...failed]
}
