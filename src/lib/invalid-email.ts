/**
 * An email becomes invalid in two ways: the `invalid-email` tag (bounces and domains
 * without mail detected by prospecting) or the `invalid_emails` list (marked by hand on
 * the contact page). The table, the contact page and the board ask here so they don't
 * offer "Escribir correo" to someone already known to bounce.
 */
export const INVALID_EMAIL_TAG = 'invalid-email'

export function isInvalidEmail(c: { email?: string | null; tags?: string[] | null; invalid_emails?: string[] | null }): boolean {
  const email = (c.email ?? '').trim().toLowerCase()
  if (!email) return false
  if ((c.tags ?? []).includes(INVALID_EMAIL_TAG)) return true
  return (c.invalid_emails ?? []).some((e) => e.trim().toLowerCase() === email)
}

/** Contact tags after changing its main email: the new one hasn't bounced yet. */
export function tagsAfterEmailChange(tags: string[] | null | undefined, previous: string | null | undefined, next: string | null | undefined): string[] | null {
  const same = (previous ?? '').trim().toLowerCase() === (next ?? '').trim().toLowerCase()
  const out = same ? [...(tags ?? [])] : (tags ?? []).filter((t) => t !== INVALID_EMAIL_TAG)
  return out.length ? out : null
}

/**
 * Mailboxes that exist for something else: personal data, billing, job applications,
 * complaints, legal. A sales email there reaches nobody who decides and can annoy. Long
 * words count even when glued to another ("privacidaddatos@"); short ones only if they're
 * the whole mailbox ("rh@", "legal@").
 */
const NON_SALES_MAILBOX_EXACT = /^(arco|derechos-?arco|transparencia|facturas?|cfdi|cobranza|pagos|rh|rrhh|empleo|empleos|cv|curriculum|talento|quejas|denuncias|etica|linea-?etica|compliance|legal|juridico|abuse|postmaster|webmaster)@/i
const NON_SALES_MAILBOX_CONTAINS = /(privacidad|datos-?personales|proteccion-?de-?datos|facturacion|factura-?electronica|recursos-?humanos|reclutamiento|bolsa-?de-?trabajo|vacantes)/i

export function isNonSalesMailbox(email: string | null | undefined): boolean {
  const e = (email ?? '').trim().toLowerCase()
  const local = e.split('@')[0] ?? ''
  if (!e.includes('@') || !local) return false
  return NON_SALES_MAILBOX_EXACT.test(e) || NON_SALES_MAILBOX_CONTAINS.test(local)
}
