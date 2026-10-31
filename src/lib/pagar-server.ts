/**
 * Lado servidor de imsoft.io/pagar: abre el enlace firmado, carga la cotizacion y dice si
 * ya se pago. Lo usan la pagina y las rutas que crean y confirman el PaymentIntent.
 */
import { stripe } from '@/lib/stripe'
import { serviceClient } from '@/lib/quotes/server'
import { consultaPagado, leerEnlace, secretoDeEnlaces, type DatosEnlace } from '@/lib/enlace-pago'
import { montoConRecargo } from '@/lib/cobro-tarjeta'

export interface EnlaceAbierto {
  d: DatosEnlace
  q: { id: string; number: string; title: string; currency: string | null; token: string; lang: string | null; client_email: string | null }
  /** Lo que se cobra, ya con recargo. */
  cobro: number
  pagado: boolean
}

export type ResultadoEnlace = { ok: true; enlace: EnlaceAbierto } | { ok: false; status: number; error: 'sin-stripe' | 'no-valido' | 'sin-cotizacion' }

export async function abrirEnlace(token: string): Promise<ResultadoEnlace> {
  if (!stripe) return { ok: false, status: 503, error: 'sin-stripe' }
  const d = leerEnlace(token, secretoDeEnlaces(process.env.STRIPE_SECRET_KEY))
  if (!d) return { ok: false, status: 400, error: 'no-valido' }
  const { data: q } = await serviceClient().from('quotes').select('id, number, title, currency, token, lang, client_email').eq('id', d.quoteId).maybeSingle()
  if (!q) return { ok: false, status: 404, error: 'sin-cotizacion' }
  const pagado = await stripe.paymentIntents.search({ query: consultaPagado(d.id), limit: 1 })
  return { ok: true, enlace: { d, q, cobro: montoConRecargo(d.monto, d.recargoPct), pagado: pagado.data.length > 0 } }
}

/** Metadata que llevan la sesion o el PaymentIntent: con `enlace` se comprueba el uso unico. */
export function metadataDeEnlace(e: EnlaceAbierto): Record<string, string> {
  return { enlace: e.d.id, quote_id: e.d.quoteId, folio: e.q.number, monto_base: String(e.d.monto), recargo_pct: String(e.d.recargoPct), msi: e.d.msi ? '1' : '0', ...(e.d.plazo === undefined ? {} : { plazo: String(e.d.plazo) }) }
}
