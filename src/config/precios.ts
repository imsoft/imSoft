/**
 * Pisos de precio que se publican en el sitio ("Desde $X MXN"). Una sola fuente: la
 * usan las tarjetas de servicios de la portada y la referencia de precios, y las pruebas
 * comprueban que ninguna muestre un numero distinto.
 *
 * Son pisos honestos para el ticket tipico de imSoft ($30,000 a $100,000 MXN por
 * proyecto). Antes "software a la medida" decia "desde $150,000", el nivel de las
 * plataformas completas (JTP, Aduvanta): dejaba fuera justo a las pymes que se prospectan
 * (26-oct-2026). Ese nivel sigue, pero con su nombre: plataforma completa. Los pisos de
 * software ($60,000) y app ($90,000) se fijaron el 27-oct-2026 tras comparar con el
 * mercado: las agencias nacionales cotizan un sistema acotado desde $80,000 y una app
 * basica desde $80,000 a $180,000; a $45,000 y $60,000 el precio decia "freelancer".
 *
 * Desde el 31-oct-2026 el precio de lista ya trae la comision de tarjeta en una exhibicion
 * (~5 %), y pagando por transferencia hay 5 % de descuento: asi Brandon recibe el neto
 * que calculo (60k, 90k) sin cobrarle "comision por tarjeta" a nadie, que las redes de
 * tarjetas prohiben. Los MSI y el plan mensual se cotizan aparte, con su total visible.
 */
export const PISOS = {
  /** Landing de una pagina (abajo del minimo de MSI; sin recargo). */
  landing: { mxn: 5_000, usd: 299 },
  'web-pages': { mxn: 16_000, usd: 850 },
  'tiendas-en-linea': { mxn: 32_000, usd: 1_700 },
  /** Sistema para la operacion: usuarios, roles, portal de clientes. */
  'software-a-medida': { mxn: 63_000, usd: 3_400 },
  /** App propia (pedidos, puntos, promociones) publicada en las tiendas. */
  'aplicaciones-moviles': { mxn: 95_000, usd: 5_000 },
  /** Producto digital o MVP con registro, pagos y panel. */
  'desarrollo-de-mvp': { mxn: 63_000, usd: 3_200 },
  /** SaaS o sistema empresarial con varios roles y modulos. */
  'plataforma-completa': { mxn: 158_000, usd: 8_400 },
} as const

/** Descuento por pagar por transferencia bancaria (equivale a la comision de tarjeta que ya trae la lista). */
export const DESCUENTO_TRANSFERENCIA_PCT = 5

/** Precio pagando por transferencia, redondeado a pesos. */
export function conDescuentoTransferencia(monto: number, pct: number = DESCUENTO_TRANSFERENCIA_PCT): number {
  return Math.round(monto * (1 - pct / 100))
}

export type ClaveDePrecio = keyof typeof PISOS

/** "Desde $63,000 MXN" o "From $3,400 USD". */
export function etiquetaDesde(clave: ClaveDePrecio, lang: string): string {
  const p = PISOS[clave]
  return lang === 'en' ? `From $${p.usd.toLocaleString('en-US')} USD` : `Desde $${p.mxn.toLocaleString('en-US')} MXN`
}
