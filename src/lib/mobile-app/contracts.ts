import type { ContractStatus } from '@/types/quotes'

/**
 * What the app and the client panel show of a contract. The full text, the signature and
 * its fingerprint are on the public page (the url).
 */
export interface AppContract {
  id: string
  number: string
  title: string
  /** Number of the quote it came from. */
  quoteNumber: string
  status: 'sent' | 'signed'
  /** Date (YYYY-MM-DD) the client signed it; null while pending. */
  signedOn: string | null
  signedBy: string | null
  url: string
}

export interface ContractRow {
  id: string
  folio: string
  status: ContractStatus
  token: string
  lang?: string | null
  signed_at?: string | null
  signed_name?: string | null
  quotes: { title: string; folio: string } | null
}

/** Turns database rows into what the client sees. Drafts and cancelled contracts don't go out. */
export function contractsForApp(rows: ContractRow[], site: string): AppContract[] {
  return rows
    .filter((c) => c.status === 'sent' || c.status === 'signed')
    .map((c) => {
      const signed = c.status === 'signed'
      return {
        id: c.id,
        number: c.folio,
        title: c.quotes?.title ?? '',
        quoteNumber: c.quotes?.folio ?? '',
        status: signed ? 'signed' : 'sent',
        signedOn: signed && c.signed_at ? c.signed_at.slice(0, 10) : null,
        signedBy: signed ? c.signed_name ?? null : null,
        url: `${site}/${c.lang || 'es'}/contrato/${c.token}`,
      }
    })
}
