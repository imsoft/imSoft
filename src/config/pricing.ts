/**
 * Price floors published on the site ("Desde $X MXN"). A single source: used by the home
 * page service cards and the pricing reference, and the tests check that none of them
 * shows a different number.
 *
 * They are honest floors for imSoft's typical ticket ($30,000 to $100,000 MXN per
 * project). "Software a la medida" used to say "desde $150,000", the level of full
 * platforms (JTP, Aduvanta): it left out exactly the SMBs being prospected (2026-10-26).
 * That level stays, under its own name: full platform. The software ($60,000) and app
 * ($90,000) floors were set on 2026-10-27 after comparing with the market: national
 * agencies quote a scoped system from $80,000 and a basic app from $80,000 to $180,000; at
 * $45,000 and $60,000 the price read "freelancer".
 *
 * Since 2026-10-31 the list price already includes the card fee for a single payment
 * (~5 %), and paying by bank transfer gets a 5 % discount: that way Brandon receives the
 * net he calculated (60k, 90k) without charging anyone a "card fee", which card networks
 * forbid. Installments and the monthly plan are quoted separately, with their total shown.
 *
 * Keys are the service slugs used across the site (public URL slugs), so they stay as is.
 */
export const PRICE_FLOORS = {
  /** One-page landing (below the installments minimum; no surcharge). */
  landing: { mxn: 5_000, usd: 299 },
  'web-pages': { mxn: 16_000, usd: 850 },
  'tiendas-en-linea': { mxn: 32_000, usd: 1_700 },
  /** System for the operation: users, roles, client portal. */
  'software-a-medida': { mxn: 63_000, usd: 3_400 },
  /** Own app (orders, points, promotions) published in the stores. */
  'aplicaciones-moviles': { mxn: 95_000, usd: 5_000 },
  /** Digital product or MVP with sign-up, payments and admin. */
  'desarrollo-de-mvp': { mxn: 63_000, usd: 3_200 },
  /** SaaS or enterprise system with several roles and modules. */
  'plataforma-completa': { mxn: 158_000, usd: 8_400 },
} as const

/** Discount for paying by bank transfer (equal to the card fee the list price already includes). */
export const TRANSFER_DISCOUNT_PCT = 5

/** Price when paying by transfer, rounded to pesos. */
export function withTransferDiscount(amount: number, pct: number = TRANSFER_DISCOUNT_PCT): number {
  return Math.round(amount * (1 - pct / 100))
}

export type PriceKey = keyof typeof PRICE_FLOORS

/** "Desde $63,000 MXN" or "From $3,400 USD". */
export function startingPriceLabel(key: PriceKey, lang: string): string {
  const p = PRICE_FLOORS[key]
  return lang === 'en' ? `From $${p.usd.toLocaleString('en-US')} USD` : `Desde $${p.mxn.toLocaleString('en-US')} MXN`
}
