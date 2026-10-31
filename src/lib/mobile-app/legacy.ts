import type { AppCompany } from './company'
import type { AppContract } from './contracts'
import type { AppComment, AppMessage } from './messages'
import type { AppQuote } from './quotes'

/**
 * Spanish-keyed shapes that the app versions already in the stores still decode. Every
 * /api/app response carries them next to the English keys. Delete this file (and its uses)
 * once no published iOS/Android version reads them.
 */

const QUOTE_STATUS = { sent: 'enviada', accepted: 'aceptada', rejected: 'rechazada', expired: 'vencida' } as const

export const legacyQuote = (q: AppQuote) => ({
  id: q.id,
  folio: q.number,
  titulo: q.title,
  estado: QUOTE_STATUS[q.status],
  total: q.total,
  formaDePago: q.paymentOption,
  moneda: q.currency,
  ivaIncluido: q.vatIncluded,
  vigencia: q.validUntil,
  enlace: q.url,
})

export const legacyContract = (c: AppContract) => ({
  id: c.id,
  folio: c.number,
  titulo: c.title,
  cotizacion: c.quoteNumber,
  estado: c.status === 'signed' ? 'firmado' : 'enviado',
  fechaFirma: c.signedOn,
  firmadoPor: c.signedBy,
  enlace: c.url,
})

export const legacyMessage = (m: AppMessage) => ({ id: m.id, texto: m.text, estado: m.status, fecha: m.date })

export const legacyComment = (c: AppComment) => ({ id: c.id, titulo: c.title, descripcion: c.description, estado: c.status, respuesta: c.reply, fecha: c.date })

export const legacyCompany = (c: AppCompany | null) => (c ? { id: c.id, nombre: c.name, logo: c.logo } : null)

/** Request body field under its English name, or under the Spanish one older apps send. */
export function bodyField(body: Record<string, unknown>, key: string, legacyKey: string): unknown {
  return body[key] ?? body[legacyKey]
}
