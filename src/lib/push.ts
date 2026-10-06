import { createPrivateKey, createSign, sign as firmar } from 'node:crypto'
import { connect as conectarHttp2 } from 'node:http2'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Notificaciones push a la app de clientes. iPhone va directo a APNs (HTTP/2 con llave .p8)
 * y Android por Firebase Cloud Messaging (cuenta de servicio). Si falta la configuracion de
 * una plataforma, sus dispositivos simplemente se saltan: el panel nunca falla por esto.
 */

export interface Mensaje {
  titulo: string
  cuerpo: string
  /** Para que la app abra la pantalla correcta: p. ej. { pantalla: 'pagos', proyecto: id }. */
  datos?: Record<string, string>
}

export interface Dispositivo {
  id: string
  platform: 'ios' | 'android'
  token: string
}

export type Resultado = 'ok' | 'invalido' | 'error'

export interface ConfigApns {
  keyId: string
  teamId: string
  /** Contenido del archivo .p8 (PEM). */
  llave: string
  bundleId: string
  sandbox: boolean
}

export interface ConfigFcm {
  projectId: string
  clientEmail: string
  privateKey: string
}

const base64url = (b: Buffer | string) => Buffer.from(b).toString('base64url')

/** Lee la configuracion de las variables de entorno; undefined para lo que no este completo. */
export function configuracionPush(env: Record<string, string | undefined>): { apns?: ConfigApns; fcm?: ConfigFcm } {
  const r: { apns?: ConfigApns; fcm?: ConfigFcm } = {}
  if (env.APNS_KEY_ID && env.APNS_TEAM_ID && env.APNS_KEY_P8) {
    const llave = env.APNS_KEY_P8.includes('BEGIN') ? env.APNS_KEY_P8.replace(/\\n/g, '\n') : Buffer.from(env.APNS_KEY_P8, 'base64').toString()
    r.apns = { keyId: env.APNS_KEY_ID, teamId: env.APNS_TEAM_ID, llave, bundleId: env.APNS_BUNDLE_ID || 'io.imsoft.clientes', sandbox: env.APNS_SANDBOX === '1' }
  }
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const j = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT) as { project_id?: string; client_email?: string; private_key?: string }
      if (j.project_id && j.client_email && j.private_key) r.fcm = { projectId: j.project_id, clientEmail: j.client_email, privateKey: j.private_key.replace(/\\n/g, '\n') }
    } catch {
      /* JSON invalido: sin Android */
    }
  }
  return r
}

// --- APNs

/** Token de autenticacion de APNs (ES256). Vale una hora; APNs pide renovarlo entre 20 y 60 min. */
export function jwtApns(cfg: Pick<ConfigApns, 'keyId' | 'teamId' | 'llave'>, ahora = new Date()): string {
  const cabecera = base64url(JSON.stringify({ alg: 'ES256', kid: cfg.keyId }))
  const cuerpo = base64url(JSON.stringify({ iss: cfg.teamId, iat: Math.floor(ahora.getTime() / 1000) }))
  const firma = firmar('sha256', Buffer.from(`${cabecera}.${cuerpo}`), { key: createPrivateKey(cfg.llave), dsaEncoding: 'ieee-p1363' })
  return `${cabecera}.${cuerpo}.${base64url(firma)}`
}

export function cargaApns(m: Mensaje) {
  return { aps: { alert: { title: m.titulo, body: m.cuerpo }, sound: 'default' }, ...(m.datos ?? {}) }
}

let jwtApnsCache: { valor: string; desde: number } | null = null

export async function enviarAIos(token: string, m: Mensaje, cfg: ConfigApns): Promise<Resultado> {
  if (!jwtApnsCache || Date.now() - jwtApnsCache.desde > 40 * 60 * 1000) jwtApnsCache = { valor: jwtApns(cfg), desde: Date.now() }
  const cliente = conectarHttp2(cfg.sandbox ? 'https://api.sandbox.push.apple.com' : 'https://api.push.apple.com')
  try {
    return await new Promise<Resultado>((resolver) => {
      const req = cliente.request({
        ':method': 'POST',
        ':path': `/3/device/${token}`,
        authorization: `bearer ${jwtApnsCache!.valor}`,
        'apns-topic': cfg.bundleId,
        'apns-push-type': 'alert',
        'apns-priority': '10',
        'content-type': 'application/json',
      })
      let estado = 0
      let cuerpo = ''
      req.on('response', (h) => { estado = Number(h[':status'] ?? 0) })
      req.on('data', (d) => { cuerpo += d })
      req.on('end', () => resolver(resultadoApns(estado, cuerpo)))
      req.on('error', (e) => { console.error('[push] APNs', e); resolver('error') })
      req.end(JSON.stringify(cargaApns(m)))
    })
  } finally {
    cliente.close()
  }
}

/** 410 o BadDeviceToken: el token ya no sirve y se borra de la base. */
export function resultadoApns(estado: number, cuerpo: string): Resultado {
  if (estado === 200) return 'ok'
  if (estado === 410 || /BadDeviceToken|Unregistered|DeviceTokenNotForTopic/.test(cuerpo)) return 'invalido'
  console.error('[push] APNs respondio', estado, cuerpo)
  return 'error'
}

// --- Firebase Cloud Messaging

/** JWT (RS256) de la cuenta de servicio para pedirle a Google un token de acceso. */
export function jwtGoogle(cfg: Pick<ConfigFcm, 'clientEmail' | 'privateKey'>, ahora = new Date()): string {
  const iat = Math.floor(ahora.getTime() / 1000)
  const cabecera = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const cuerpo = base64url(JSON.stringify({
    iss: cfg.clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat,
    exp: iat + 3600,
  }))
  const s = createSign('RSA-SHA256')
  s.update(`${cabecera}.${cuerpo}`)
  return `${cabecera}.${cuerpo}.${base64url(s.sign(cfg.privateKey))}`
}

export function cargaFcm(token: string, m: Mensaje) {
  return {
    message: {
      token,
      notification: { title: m.titulo, body: m.cuerpo },
      data: m.datos ?? {},
      android: { priority: 'HIGH', notification: { channel_id: 'avisos', sound: 'default' } },
    },
  }
}

let tokenGoogleCache: { valor: string; vence: number } | null = null

async function tokenDeAccesoGoogle(cfg: ConfigFcm): Promise<string> {
  if (tokenGoogleCache && Date.now() < tokenGoogleCache.vence) return tokenGoogleCache.valor
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwtGoogle(cfg) }),
  })
  const j = (await r.json()) as { access_token?: string; expires_in?: number; error?: string }
  if (!r.ok || !j.access_token) throw new Error(`Google no dio token de acceso: ${j.error ?? r.status}`)
  tokenGoogleCache = { valor: j.access_token, vence: Date.now() + ((j.expires_in ?? 3600) - 60) * 1000 }
  return j.access_token
}

export async function enviarAAndroid(token: string, m: Mensaje, cfg: ConfigFcm): Promise<Resultado> {
  try {
    const acceso = await tokenDeAccesoGoogle(cfg)
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${cfg.projectId}/messages:send`, {
      method: 'POST',
      headers: { authorization: `Bearer ${acceso}`, 'content-type': 'application/json' },
      body: JSON.stringify(cargaFcm(token, m)),
    })
    return resultadoFcm(r.status, await r.text())
  } catch (e) {
    console.error('[push] FCM', e)
    return 'error'
  }
}

/** 404 UNREGISTERED o 400 con token invalido: el dispositivo ya no existe. */
export function resultadoFcm(estado: number, cuerpo: string): Resultado {
  if (estado === 200) return 'ok'
  if (estado === 404 || /UNREGISTERED|registration token is not a valid/i.test(cuerpo)) return 'invalido'
  console.error('[push] FCM respondio', estado, cuerpo)
  return 'error'
}

// --- Envio a un cliente

type Envios = {
  ios?: (token: string, m: Mensaje) => Promise<Resultado>
  android?: (token: string, m: Mensaje) => Promise<Resultado>
}

export function enviosConfigurados(env: Record<string, string | undefined> = process.env): Envios {
  const cfg = configuracionPush(env)
  return {
    ios: cfg.apns ? (t, m) => enviarAIos(t, m, cfg.apns!) : undefined,
    android: cfg.fcm ? (t, m) => enviarAAndroid(t, m, cfg.fcm!) : undefined,
  }
}

/**
 * Manda el mensaje a todos los dispositivos del usuario y borra los que ya no existen.
 * Devuelve cuantos se enviaron; nunca lanza (un aviso fallido no debe romper la operacion).
 */
export async function enviarPush(db: SupabaseClient, userId: string, m: Mensaje, envios: Envios = enviosConfigurados()): Promise<{ enviados: number; borrados: number }> {
  const cuenta = { enviados: 0, borrados: 0 }
  if (!envios.ios && !envios.android) return cuenta
  try {
    const { data, error } = await db.from('app_devices').select('id, platform, token').eq('user_id', userId)
    if (error || !data) return cuenta
    for (const d of data as Dispositivo[]) {
      const enviar = envios[d.platform]
      if (!enviar) continue
      const r = await enviar(d.token, m)
      if (r === 'ok') cuenta.enviados++
      if (r === 'invalido') {
        await db.from('app_devices').delete().eq('id', d.id)
        cuenta.borrados++
      }
    }
  } catch (e) {
    console.error('[push]', e)
  }
  return cuenta
}
