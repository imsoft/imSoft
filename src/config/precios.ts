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
 */
export const PISOS = {
  /** Landing de una pagina. */
  landing: { mxn: 5_000, usd: 299 },
  'web-pages': { mxn: 15_000, usd: 800 },
  'tiendas-en-linea': { mxn: 30_000, usd: 1_600 },
  /** Sistema para la operacion: usuarios, roles, portal de clientes. */
  'software-a-medida': { mxn: 60_000, usd: 3_200 },
  /** App propia (pedidos, puntos, promociones) publicada en las tiendas. */
  'aplicaciones-moviles': { mxn: 90_000, usd: 4_800 },
  /** Producto digital o MVP con registro, pagos y panel. */
  'desarrollo-de-mvp': { mxn: 60_000, usd: 3_000 },
  /** SaaS o sistema empresarial con varios roles y modulos. */
  'plataforma-completa': { mxn: 150_000, usd: 8_000 },
} as const

export type ClaveDePrecio = keyof typeof PISOS

/** "Desde $45,000 MXN" o "From $2,400 USD". */
export function etiquetaDesde(clave: ClaveDePrecio, lang: string): string {
  const p = PISOS[clave]
  return lang === 'en' ? `From $${p.usd.toLocaleString('en-US')} USD` : `Desde $${p.mxn.toLocaleString('en-US')} MXN`
}
