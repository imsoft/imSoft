import { generateKeyPairSync, verify } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { apnsJwt, apnsPayload, apnsResult, fcmPayload, fcmResult, googleJwt, pushConfig, sendPush, type PushMessage, type SendResult } from './push'

const MESSAGE: PushMessage = { title: 'Avance', body: 'Terminamos: Diseño', data: { screen: 'project', projectId: 'p1' } }

const decode = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString())

describe('push: config', () => {
  it('with no variables there is no platform', () => {
    expect(pushConfig({})).toEqual({})
  })

  it('reads APNs with the key in PEM or base64, and FCM from the service account JSON', () => {
    const pem = '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----'
    const a = pushConfig({ APNS_KEY_ID: 'K1', APNS_TEAM_ID: 'T1', APNS_KEY_P8: pem.replace(/\n/g, '\\n'), APNS_SANDBOX: '1' })
    expect(a.apns).toEqual({ keyId: 'K1', teamId: 'T1', key: pem, bundleId: 'io.imsoft.clientes', sandbox: true })
    const b = pushConfig({ APNS_KEY_ID: 'K1', APNS_TEAM_ID: 'T1', APNS_KEY_P8: Buffer.from(pem).toString('base64') })
    expect(b.apns?.key).toBe(pem)
    expect(b.apns?.sandbox).toBe(false)
    const f = pushConfig({ FIREBASE_SERVICE_ACCOUNT: JSON.stringify({ project_id: 'imsoft', client_email: 'x@y.iam', private_key: 'a\\nb' }) })
    expect(f.fcm).toEqual({ projectId: 'imsoft', clientEmail: 'x@y.iam', privateKey: 'a\nb' })
    expect(pushConfig({ FIREBASE_SERVICE_ACCOUNT: 'not json' }).fcm).toBeUndefined()
  })
})

describe('push: signed tokens', () => {
  it('the APNs token is ES256 with the key id and signed by the private key', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    const t = apnsJwt({ keyId: 'ABC123', teamId: 'TEAM1', key: pem }, new Date(1_800_000_000_000))
    const [h, c, s] = t.split('.')
    expect(decode(h)).toEqual({ alg: 'ES256', kid: 'ABC123' })
    expect(decode(c)).toEqual({ iss: 'TEAM1', iat: 1_800_000_000 })
    expect(verify('sha256', Buffer.from(`${h}.${c}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(s, 'base64url'))).toBe(true)
  })

  it('the Google token is RS256 with the FCM scope and lasts an hour', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    const t = googleJwt({ clientEmail: 'fcm@imsoft.iam.gserviceaccount.com', privateKey: pem }, new Date(1_800_000_000_000))
    const [h, c, s] = t.split('.')
    expect(decode(h)).toEqual({ alg: 'RS256', typ: 'JWT' })
    expect(decode(c)).toMatchObject({ iss: 'fcm@imsoft.iam.gserviceaccount.com', aud: 'https://oauth2.googleapis.com/token', iat: 1_800_000_000, exp: 1_800_003_600 })
    expect(decode(c).scope).toContain('firebase.messaging')
    expect(verify('sha256', Buffer.from(`${h}.${c}`), publicKey, Buffer.from(s, 'base64url'))).toBe(true)
  })
})

describe('push: payloads and responses', () => {
  it('builds the APNs notice with sound and the data loose for the app', () => {
    expect(apnsPayload(MESSAGE)).toEqual({ aps: { alert: { title: 'Avance', body: 'Terminamos: Diseño' }, sound: 'default' }, screen: 'project', projectId: 'p1' })
  })

  it('builds the FCM message with high priority and the app channel', () => {
    const m = fcmPayload('tok', MESSAGE).message
    expect(m.token).toBe('tok')
    expect(m.notification).toEqual({ title: 'Avance', body: 'Terminamos: Diseño' })
    expect(m.data).toEqual(MESSAGE.data)
    expect(m.android.notification.channel_id).toBe('avisos')
  })

  it('tells a dead token from a transient error', () => {
    const quiet = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(apnsResult(200, '')).toBe('ok')
    expect(apnsResult(410, '{"reason":"Unregistered"}')).toBe('invalid')
    expect(apnsResult(400, '{"reason":"BadDeviceToken"}')).toBe('invalid')
    expect(apnsResult(503, '')).toBe('error')
    expect(fcmResult(200, '{}')).toBe('ok')
    expect(fcmResult(404, '{"error":{"details":[{"errorCode":"UNREGISTERED"}]}}')).toBe('invalid')
    expect(fcmResult(400, 'The registration token is not a valid FCM registration token')).toBe('invalid')
    expect(fcmResult(500, '')).toBe('error')
    quiet.mockRestore()
  })
})

describe('push: sending to a client', () => {
  function fakeDb(devices: Array<{ id: string; platform: string; token: string }>) {
    const removed: string[] = []
    const db = {
      from: () => ({
        select: () => ({ eq: async () => ({ data: devices, error: null }) }),
        delete: () => ({ eq: async (_c: string, id: string) => { removed.push(id); return { error: null } } }),
      }),
    }
    return { db: db as never, removed }
  }

  it('sends to each configured platform and deletes tokens that no longer exist', async () => {
    const { db, removed } = fakeDb([
      { id: 'a', platform: 'ios', token: 'ios-ok' },
      { id: 'b', platform: 'ios', token: 'ios-dead' },
      { id: 'c', platform: 'android', token: 'and-ok' },
    ])
    const ios = vi.fn(async (t: string): Promise<SendResult> => (t === 'ios-dead' ? 'invalid' : 'ok'))
    const android = vi.fn(async (): Promise<SendResult> => 'ok')
    expect(await sendPush(db, 'u1', MESSAGE, { ios, android })).toEqual({ sent: 2, removed: 1 })
    expect(removed).toEqual(['b'])
    expect(android).toHaveBeenCalledWith('and-ok', MESSAGE)
  })

  it('skips devices of an unconfigured platform; with none, it does not even query the database', async () => {
    const { db } = fakeDb([{ id: 'a', platform: 'ios', token: 'x' }, { id: 'c', platform: 'android', token: 'y' }])
    const android = vi.fn(async (): Promise<SendResult> => 'ok')
    expect(await sendPush(db, 'u1', MESSAGE, { android })).toEqual({ sent: 1, removed: 0 })
    const query = vi.fn()
    expect(await sendPush({ from: query } as never, 'u1', MESSAGE, {})).toEqual({ sent: 0, removed: 0 })
    expect(query).not.toHaveBeenCalled()
  })
})
