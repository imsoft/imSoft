/**
 * Enlace de cobro con tarjeta desde una cotizacion, servido por imsoft.io.
 *
 * Los Payment Links de Stripe no permiten apagar los meses sin intereses: los plazos
 * salen de la configuracion global del Dashboard. Un cliente pago a 6 MSI una cotizacion
 * que no los ofrecia (sep-2026) y la cuenta absorbio 7.5 % mas IVA. Por eso el enlace que
 * se comparte es de imsoft.io y, al abrirse, crea una sesion de Checkout con los MSI
 * encendidos o apagados segun la cotizacion.
 *
 * El enlace lleva sus datos firmados (HMAC): no hace falta tabla nueva y nadie puede
 * cambiar el monto en la URL. El uso unico se comprueba en Stripe por el `id` del enlace.
 */
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export interface DatosEnlace {
  /** id del enlace, unico: con el se comprueba en Stripe si ya se pago. */
  id: string
  quoteId: string
  /** Monto base de la cotizacion, sin recargo. */
  monto: number
  recargoPct: number
  etiqueta: string
  msi: boolean
}

const b64 = (s: string | Buffer) => Buffer.from(s).toString('base64url')

function firma(cuerpo: string, secreto: string): string {
  return createHmac('sha256', secreto).update(`enlace-pago:${cuerpo}`).digest('base64url')
}

export function nuevoIdEnlace(): string {
  return randomBytes(9).toString('base64url')
}

/** Token de la URL: datos en base64url + firma. */
export function firmarEnlace(d: DatosEnlace, secreto: string): string {
  const cuerpo = b64(JSON.stringify({ i: d.id, q: d.quoteId, m: d.monto, r: d.recargoPct, e: d.etiqueta, s: d.msi ? 1 : 0 }))
  return `${cuerpo}.${firma(cuerpo, secreto)}`
}

/** Devuelve los datos si la firma es valida; null si el token fue alterado o no sirve. */
export function leerEnlace(token: string, secreto: string): DatosEnlace | null {
  const [cuerpo, sig, ...resto] = String(token ?? '').split('.')
  if (!cuerpo || !sig || resto.length) return null
  const esperada = Buffer.from(firma(cuerpo, secreto))
  const recibida = Buffer.from(sig)
  if (esperada.length !== recibida.length || !timingSafeEqual(esperada, recibida)) return null
  try {
    const o = JSON.parse(Buffer.from(cuerpo, 'base64url').toString('utf8'))
    if (typeof o.i !== 'string' || typeof o.q !== 'string' || typeof o.m !== 'number' || typeof o.r !== 'number' || typeof o.e !== 'string') return null
    return { id: o.i, quoteId: o.q, monto: o.m, recargoPct: o.r, etiqueta: o.e, msi: o.s === 1 }
  } catch {
    return null
  }
}

/** Llave de firma derivada de la de Stripe: vive solo en el servidor y no pide otra variable de entorno. */
export function secretoDeEnlaces(stripeKey: string | undefined): string {
  if (!stripeKey) throw new Error('Falta STRIPE_SECRET_KEY en el entorno.')
  return createHmac('sha256', stripeKey).update('imsoft-enlaces-de-pago').digest('hex')
}

/** Consulta de Stripe para saber si este enlace ya se pago. */
export function consultaPagado(idEnlace: string): string {
  return `metadata['enlace']:'${idEnlace.replace(/[^A-Za-z0-9_-]/g, '')}' AND status:'succeeded'`
}
