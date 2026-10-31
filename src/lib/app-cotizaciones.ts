import { estaVencida, opcionesDePago, totales, type QuoteLike, type QuoteStatus } from '@/lib/cotizaciones'

/** Lo que la app muestra de una cotizacion. Sin items ni datos fiscales: el detalle se ve en la pagina publica. */
export interface CotizacionApp {
  id: string
  folio: string
  titulo: string
  estado: 'enviada' | 'aceptada' | 'rechazada' | 'vencida'
  /** Precio de lista; ya aceptada, el total de la forma de pago que eligio el cliente. */
  total: number
  /** "Transferencia bancaria", "Tarjeta a 12 meses sin intereses"…; null si aun no elige. */
  formaDePago: string | null
  moneda: string
  ivaIncluido: boolean
  vigencia: string
  enlace: string
}

type Fila = Pick<QuoteLike, 'items' | 'apply_iva' | 'discount' | 'valid_until' | 'accepted_payment_option'> & Partial<Pick<QuoteLike, 'payment'>> & {
  id: string
  folio: string
  title: string
  status: QuoteStatus
  currency?: string | null
  token: string
  lang?: string | null
}

/** Convierte las filas de la base en lo que ve el cliente. Los borradores nunca salen. */
export function cotizacionesParaApp(filas: Fila[], sitio: string, hoy = new Date()): CotizacionApp[] {
  return filas
    .filter((q) => q.status !== 'draft')
    .map((q) => {
      // Las apps ya publicadas solo leen `total`: al aceptarse, ahi va el de la opcion elegida.
      const elegida = q.status === 'accepted' && q.accepted_payment_option && q.payment
        ? opcionesDePago({ ...q, payment: q.payment, currency: q.currency || 'MXN' }).find((o) => o.clave === q.accepted_payment_option)
        : undefined
      return {
      id: q.id,
      folio: q.folio,
      titulo: q.title,
      estado: estadoApp(q, hoy),
      total: elegida?.total ?? totales(q).total,
      formaDePago: elegida?.titulo ?? null,
      moneda: q.currency || 'MXN',
      ivaIncluido: q.apply_iva,
      vigencia: q.valid_until,
      enlace: `${sitio}/${q.lang || 'es'}/cotizacion/${q.token}`,
      }
    })
}

function estadoApp(q: Pick<QuoteLike, 'valid_until' | 'status'>, hoy: Date): CotizacionApp['estado'] {
  if (q.status === 'accepted') return 'aceptada'
  if (q.status === 'rejected') return 'rechazada'
  if (q.status === 'expired' || estaVencida(q, hoy)) return 'vencida'
  return 'enviada'
}
