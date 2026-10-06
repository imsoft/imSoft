import { generateKeyPairSync, verify } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { cargaApns, cargaFcm, configuracionPush, enviarPush, jwtApns, jwtGoogle, resultadoApns, resultadoFcm, type Mensaje, type Resultado } from './push'

const MENSAJE: Mensaje = { titulo: 'Avance', cuerpo: 'Terminamos: Diseño', datos: { pantalla: 'proyecto', proyecto: 'p1' } }

const decodificar = (parte: string) => JSON.parse(Buffer.from(parte, 'base64url').toString())

describe('push: configuracion', () => {
  it('sin variables no hay ninguna plataforma', () => {
    expect(configuracionPush({})).toEqual({})
  })

  it('lee APNs con la llave en PEM o en base64 y FCM desde el JSON de la cuenta de servicio', () => {
    const pem = '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----'
    const a = configuracionPush({ APNS_KEY_ID: 'K1', APNS_TEAM_ID: 'T1', APNS_KEY_P8: pem.replace(/\n/g, '\\n'), APNS_SANDBOX: '1' })
    expect(a.apns).toEqual({ keyId: 'K1', teamId: 'T1', llave: pem, bundleId: 'io.imsoft.clientes', sandbox: true })
    const b = configuracionPush({ APNS_KEY_ID: 'K1', APNS_TEAM_ID: 'T1', APNS_KEY_P8: Buffer.from(pem).toString('base64') })
    expect(b.apns?.llave).toBe(pem)
    expect(b.apns?.sandbox).toBe(false)
    const f = configuracionPush({ FIREBASE_SERVICE_ACCOUNT: JSON.stringify({ project_id: 'imsoft', client_email: 'x@y.iam', private_key: 'a\\nb' }) })
    expect(f.fcm).toEqual({ projectId: 'imsoft', clientEmail: 'x@y.iam', privateKey: 'a\nb' })
    expect(configuracionPush({ FIREBASE_SERVICE_ACCOUNT: 'no es json' }).fcm).toBeUndefined()
  })
})

describe('push: tokens firmados', () => {
  it('el token de APNs es ES256 con el id de la llave y lo firma la llave privada', () => {
    const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    const t = jwtApns({ keyId: 'ABC123', teamId: 'TEAM1', llave: pem }, new Date(1_800_000_000_000))
    const [h, c, f] = t.split('.')
    expect(decodificar(h)).toEqual({ alg: 'ES256', kid: 'ABC123' })
    expect(decodificar(c)).toEqual({ iss: 'TEAM1', iat: 1_800_000_000 })
    expect(verify('sha256', Buffer.from(`${h}.${c}`), { key: publicKey, dsaEncoding: 'ieee-p1363' }, Buffer.from(f, 'base64url'))).toBe(true)
  })

  it('el token para Google es RS256 con el alcance de FCM y dura una hora', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
    const pem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
    const t = jwtGoogle({ clientEmail: 'fcm@imsoft.iam.gserviceaccount.com', privateKey: pem }, new Date(1_800_000_000_000))
    const [h, c, f] = t.split('.')
    expect(decodificar(h)).toEqual({ alg: 'RS256', typ: 'JWT' })
    expect(decodificar(c)).toMatchObject({ iss: 'fcm@imsoft.iam.gserviceaccount.com', aud: 'https://oauth2.googleapis.com/token', iat: 1_800_000_000, exp: 1_800_003_600 })
    expect(decodificar(c).scope).toContain('firebase.messaging')
    expect(verify('sha256', Buffer.from(`${h}.${c}`), publicKey, Buffer.from(f, 'base64url'))).toBe(true)
  })
})

describe('push: cuerpos y respuestas', () => {
  it('arma el aviso de APNs con sonido y los datos sueltos para la app', () => {
    expect(cargaApns(MENSAJE)).toEqual({ aps: { alert: { title: 'Avance', body: 'Terminamos: Diseño' }, sound: 'default' }, pantalla: 'proyecto', proyecto: 'p1' })
  })

  it('arma el mensaje de FCM con prioridad alta y el canal de la app', () => {
    const m = cargaFcm('tok', MENSAJE).message
    expect(m.token).toBe('tok')
    expect(m.notification).toEqual({ title: 'Avance', body: 'Terminamos: Diseño' })
    expect(m.data).toEqual(MENSAJE.datos)
    expect(m.android.notification.channel_id).toBe('avisos')
  })

  it('distingue un token muerto de un error pasajero', () => {
    const silencio = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(resultadoApns(200, '')).toBe('ok')
    expect(resultadoApns(410, '{"reason":"Unregistered"}')).toBe('invalido')
    expect(resultadoApns(400, '{"reason":"BadDeviceToken"}')).toBe('invalido')
    expect(resultadoApns(503, '')).toBe('error')
    expect(resultadoFcm(200, '{}')).toBe('ok')
    expect(resultadoFcm(404, '{"error":{"details":[{"errorCode":"UNREGISTERED"}]}}')).toBe('invalido')
    expect(resultadoFcm(400, 'The registration token is not a valid FCM registration token')).toBe('invalido')
    expect(resultadoFcm(500, '')).toBe('error')
    silencio.mockRestore()
  })
})

describe('push: envio a un cliente', () => {
  function baseFalsa(dispositivos: Array<{ id: string; platform: string; token: string }>) {
    const borrados: string[] = []
    const db = {
      from: () => ({
        select: () => ({ eq: async () => ({ data: dispositivos, error: null }) }),
        delete: () => ({ eq: async (_c: string, id: string) => { borrados.push(id); return { error: null } } }),
      }),
    }
    return { db: db as never, borrados }
  }

  it('manda a cada plataforma configurada y borra los tokens que ya no existen', async () => {
    const { db, borrados } = baseFalsa([
      { id: 'a', platform: 'ios', token: 'ios-ok' },
      { id: 'b', platform: 'ios', token: 'ios-muerto' },
      { id: 'c', platform: 'android', token: 'and-ok' },
    ])
    const ios = vi.fn(async (t: string): Promise<Resultado> => (t === 'ios-muerto' ? 'invalido' : 'ok'))
    const android = vi.fn(async (): Promise<Resultado> => 'ok')
    expect(await enviarPush(db, 'u1', MENSAJE, { ios, android })).toEqual({ enviados: 2, borrados: 1 })
    expect(borrados).toEqual(['b'])
    expect(android).toHaveBeenCalledWith('and-ok', MENSAJE)
  })

  it('sin configuracion de una plataforma salta sus dispositivos; sin ninguna, ni consulta la base', async () => {
    const { db } = baseFalsa([{ id: 'a', platform: 'ios', token: 'x' }, { id: 'c', platform: 'android', token: 'y' }])
    const android = vi.fn(async (): Promise<Resultado> => 'ok')
    expect(await enviarPush(db, 'u1', MENSAJE, { android })).toEqual({ enviados: 1, borrados: 0 })
    const consulta = vi.fn()
    expect(await enviarPush({ from: consulta } as never, 'u1', MENSAJE, {})).toEqual({ enviados: 0, borrados: 0 })
    expect(consulta).not.toHaveBeenCalled()
  })
})
