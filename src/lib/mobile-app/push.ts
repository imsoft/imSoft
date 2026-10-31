import { createPrivateKey, createSign, sign as signData } from 'node:crypto'
import { connect as connectHttp2 } from 'node:http2'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Push notifications to the client app. iPhone goes straight to APNs (HTTP/2 with a .p8 key)
 * and Android through Firebase Cloud Messaging (service account). If a platform's config is
 * missing, its devices are simply skipped: the panel never fails because of this.
 */

export interface PushMessage {
  title: string
  body: string
  /** So the app opens the right screen, e.g. { screen: 'payments', projectId: id }. */
  data?: Record<string, string>
}

export interface Device {
  id: string
  platform: 'ios' | 'android'
  token: string
}

export type SendResult = 'ok' | 'invalid' | 'error'

export interface ApnsConfig {
  keyId: string
  teamId: string
  /** Contents of the .p8 file (PEM). */
  key: string
  bundleId: string
  sandbox: boolean
}

export interface FcmConfig {
  projectId: string
  clientEmail: string
  privateKey: string
}

/**
 * Android channel the server names in FCM messages. Published app versions created "avisos";
 * newer ones create "notices" and declare it as the default, so FCM falls back to it. Switch to
 * "notices" once no published version uses "avisos".
 */
export const ANDROID_CHANNEL_ID = 'avisos'

const base64url = (b: Buffer | string) => Buffer.from(b).toString('base64url')

/** Reads the config from environment variables; undefined for whatever isn't complete. */
export function pushConfig(env: Record<string, string | undefined>): { apns?: ApnsConfig; fcm?: FcmConfig } {
  const r: { apns?: ApnsConfig; fcm?: FcmConfig } = {}
  if (env.APNS_KEY_ID && env.APNS_TEAM_ID && env.APNS_KEY_P8) {
    const key = env.APNS_KEY_P8.includes('BEGIN') ? env.APNS_KEY_P8.replace(/\\n/g, '\n') : Buffer.from(env.APNS_KEY_P8, 'base64').toString()
    r.apns = { keyId: env.APNS_KEY_ID, teamId: env.APNS_TEAM_ID, key, bundleId: env.APNS_BUNDLE_ID || 'io.imsoft.clientes', sandbox: env.APNS_SANDBOX === '1' }
  }
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const j = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as { project_id?: string; client_email?: string; private_key?: string }
      if (j.project_id && j.client_email && j.private_key) r.fcm = { projectId: j.project_id, clientEmail: j.client_email, privateKey: j.private_key.replace(/\\n/g, '\n') }
    } catch {
      /* invalid JSON: no Android */
    }
  }
  return r
}

// --- APNs

/** APNs auth token (ES256). Valid for an hour; APNs asks to renew it every 20 to 60 min. */
export function apnsJwt(cfg: Pick<ApnsConfig, 'keyId' | 'teamId' | 'key'>, now = new Date()): string {
  const header = base64url(JSON.stringify({ alg: 'ES256', kid: cfg.keyId }))
  const claims = base64url(JSON.stringify({ iss: cfg.teamId, iat: Math.floor(now.getTime() / 1000) }))
  const signature = signData('sha256', Buffer.from(`${header}.${claims}`), { key: createPrivateKey(cfg.key), dsaEncoding: 'ieee-p1363' })
  return `${header}.${claims}.${base64url(signature)}`
}

export function apnsPayload(m: PushMessage) {
  return { aps: { alert: { title: m.title, body: m.body }, sound: 'default' }, ...(m.data ?? {}) }
}

let apnsJwtCache: { value: string; since: number } | null = null

export async function sendToIos(token: string, m: PushMessage, cfg: ApnsConfig): Promise<SendResult> {
  if (!apnsJwtCache || Date.now() - apnsJwtCache.since > 40 * 60 * 1000) apnsJwtCache = { value: apnsJwt(cfg), since: Date.now() }
  const client = connectHttp2(cfg.sandbox ? 'https://api.sandbox.push.apple.com' : 'https://api.push.apple.com')
  try {
    return await new Promise<SendResult>((resolve) => {
      const req = client.request({
        ':method': 'POST',
        ':path': `/3/device/${token}`,
        authorization: `bearer ${apnsJwtCache!.value}`,
        'apns-topic': cfg.bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'content-type': 'application/json',
      })
      let status = 0
      let body = ''
      req.on('response', (h) => { status = Number(h[':status'] ?? 0) })
      req.on('data', (d) => { body += d })
      req.on('end', () => resolve(apnsResult(status, body)))
      req.on('error', (e) => { console.error('[push] APNs', e); resolve('error') })
      req.end(JSON.stringify(apnsPayload(m)))
    })
  } finally {
    client.close()
  }
}

/** 410 or BadDeviceToken: the token no longer works and is removed from the database. */
export function apnsResult(status: number, body: string): SendResult {
  if (status === 200) return 'ok'
  if (status === 410 || /BadDeviceToken|Unregistered|DeviceTokenNotForTopic/.test(body)) return 'invalid'
  console.error('[push] APNs responded', status, body)
  return 'error'
}

// --- Firebase Cloud Messaging

/** Service account JWT (RS256) to ask Google for an access token. */
export function googleJwt(cfg: Pick<FcmConfig, 'clientEmail' | 'privateKey'>, now = new Date()): string {
  const iat = Math.floor(now.getTime() / 1000)
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = base64url(JSON.stringify({
    iss: cfg.clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat,
    exp: iat + 3600,
  }))
  const s = createSign('RSA-SHA256')
  s.update(`${header}.${claims}`)
  return `${header}.${claims}.${base64url(s.sign(cfg.privateKey))}`
}

export function fcmPayload(token: string, m: PushMessage) {
  return {
    message: {
      token,
      notification: { title: m.title, body: m.body },
      data: m.data ?? {},
      android: { priority: 'HIGH', notification: { channel_id: ANDROID_CHANNEL_ID, sound: 'default' } },
    },
  }
}

let googleTokenCache: { value: string; expires: number } | null = null

async function googleAccessToken(cfg: FcmConfig): Promise<string> {
  if (googleTokenCache && Date.now() < googleTokenCache.expires) return googleTokenCache.value
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: googleJwt(cfg) }),
  })
  const j = (await r.json()) as { access_token?: string; expires_in?: number; error?: string }
  if (!r.ok || !j.access_token) throw new Error(`Google returned no access token: ${j.error ?? r.status}`)
  googleTokenCache = { value: j.access_token, expires: Date.now() + ((j.expires_in ?? 3600) - 60) * 1000 }
  return j.access_token
}

export async function sendToAndroid(token: string, m: PushMessage, cfg: FcmConfig): Promise<SendResult> {
  try {
    const accessToken = await googleAccessToken(cfg)
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${cfg.projectId}/messages:send`, {
      method: 'POST',
      headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
      body: JSON.stringify(fcmPayload(token, m)),
    })
    return fcmResult(r.status, await r.text())
  } catch (e) {
    console.error('[push] FCM', e)
    return 'error'
  }
}

/** 404 UNREGISTERED or 400 with an invalid token: the device no longer exists. */
export function fcmResult(status: number, body: string): SendResult {
  if (status === 200) return 'ok'
  if (status === 404 || /UNREGISTERED|registration token is not a valid/i.test(body)) return 'invalid'
  console.error('[push] FCM responded', status, body)
  return 'error'
}

// --- Sending to a client

type Senders = {
  ios?: (token: string, m: PushMessage) => Promise<SendResult>
  android?: (token: string, m: PushMessage) => Promise<SendResult>
}

export function configuredSenders(env: Record<string, string | undefined> = process.env): Senders {
  const cfg = pushConfig(env)
  return {
    ios: cfg.apns ? (t, m) => sendToIos(t, m, cfg.apns!) : undefined,
    android: cfg.fcm ? (t, m) => sendToAndroid(t, m, cfg.fcm!) : undefined,
  }
}

/**
 * Sends the message to all of the user's devices and deletes the ones that no longer exist.
 * Returns how many were sent; never throws (a failed notice must not break the operation).
 */
export async function sendPush(db: SupabaseClient, userId: string, m: PushMessage, senders: Senders = configuredSenders()): Promise<{ sent: number; removed: number }> {
  const count = { sent: 0, removed: 0 }
  if (!senders.ios && !senders.android) return count
  try {
    const { data, error } = await db.from('app_devices').select('id, platform, token').eq('user_id', userId)
    if (error || !data) return count
    for (const d of data as Device[]) {
      const send = senders[d.platform]
      if (!send) continue
      const r = await send(d.token, m)
      if (r === 'ok') count.sent++
      if (r === 'invalid') {
        await db.from('app_devices').delete().eq('id', d.id)
        count.removed++
      }
    }
  } catch (e) {
    console.error('[push]', e)
  }
  return count
}
