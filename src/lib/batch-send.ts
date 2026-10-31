/**
 * Batch email sending, one by one: contacts are picked in the CRM table, each one's
 * personalized draft is prepared and, after reviewing them, they're sent with a pause
 * between each send so they don't go out as a burst.
 */
import { isInvalidEmail } from './invalid-email.ts'

/**
 * A batch email can be prepared for the contact: it has an email, it isn't marked as
 * invalid and it hasn't been written to yet. Follow-ups don't go in batches: they're done
 * one by one or from "Buscar respuestas y seguimientos", which respects the dates.
 */
export function canReceiveEmail(c: { email?: string | null; tags?: string[] | null; invalid_emails?: string[] | null; emailStatus?: { type: string } | null }): boolean {
  if (!(c.email ?? '').trim() || isInvalidEmail(c)) return false
  return !c.emailStatus || c.emailStatus.type === 'none' || c.emailStatus.type === 'draft'
}

export interface DailyQuota {
  /** Daily cap of the ramp (15, 25 or 40). */
  cap: number
  sentToday: number
  /** Drafts already written that are waiting to be sent today. */
  pending: number
  /** How many new emails fit today, counting what was sent and what's already waiting. */
  fits: number
}

/** What's left of the daily cap for new emails. */
export function dailyQuota(cap: number, sentToday: number, pending: number): DailyQuota {
  return { cap, sentToday, pending, fits: Math.max(0, cap - sentToday - pending) }
}

/** Warning when more contacts are picked than fit today; null if they all fit. */
export function quotaWarning(picked: number, quota: DailyQuota): string | null {
  if (picked <= quota.fits) return null
  if (quota.fits === 0) return 'El límite de hoy ya está lleno con lo enviado y los borradores en espera: lo que prepares queda como borrador para mañana.'
  const extra = picked - quota.fits
  return `Elegiste ${picked} y hoy caben ${quota.fits}: ${extra === 1 ? 'el otro queda' : `los otros ${extra} quedan`} como borrador para mañana.`
}

export const PAUSE_MIN_MS = 20_000
export const PAUSE_MAX_MS = 45_000

/** Pause between two sends: 20 to 45 seconds, different each time. */
export function pauseBetweenSends(random: number = Math.random()): number {
  const a = Math.min(1, Math.max(0, random))
  return Math.round(PAUSE_MIN_MS + a * (PAUSE_MAX_MS - PAUSE_MIN_MS))
}

/** Approximate minutes a batch of `n` sends takes. */
export function batchMinutes(n: number): number {
  if (n <= 1) return 1
  return Math.max(1, Math.round(((n - 1) * (PAUSE_MIN_MS + PAUSE_MAX_MS)) / 2 / 60_000))
}

export interface BatchResult {
  /** New drafts, written in this batch. */
  ready: number
  /** They already had a pending draft: it's reused. */
  alreadyHad: number
  /** "Company: reason" for those that couldn't be prepared. */
  errors: string[]
}

export function batchSummary(r: BatchResult): string {
  const parts: string[] = []
  if (r.ready) parts.push(`${r.ready} ${r.ready === 1 ? 'borrador listo' : 'borradores listos'}`)
  if (r.alreadyHad) parts.push(`${r.alreadyHad} ya ${r.alreadyHad === 1 ? 'tenía' : 'tenían'} borrador`)
  if (r.errors.length) parts.push(`${r.errors.length} sin preparar`)
  return parts.length ? parts.join(' · ') : 'No se preparó ningún correo'
}

export interface Celebration {
  /** 'goal': the daily limit was reached. 'batch': the whole batch went out, without errors. */
  type: 'goal' | 'batch'
  title: string
  text: string
}

/**
 * Whether the send deserves a celebration: the daily limit was reached, or the batch went
 * out complete and without errors. A stopped batch, one with errors or a single email
 * doesn't celebrate.
 */
export function sendCelebration(r: { sent: number; total: number; errors: number; stopped: boolean; sentToday: number; cap: number }): Celebration | null {
  if (r.sent <= 0) return null
  if (r.sentToday >= r.cap) {
    return { type: 'goal', title: '¡Meta del día cumplida!', text: `Hoy salieron ${r.sentToday} de ${r.cap} correos, tu límite diario completo.` }
  }
  if (r.stopped || r.errors > 0 || r.sent < r.total || r.total < 2) return null
  return { type: 'batch', title: '¡Correos enviados!', text: `Salieron los ${r.sent} correos del lote, cada uno con su texto.` }
}

/**
 * Gmail limits each account's queries per minute (it's not the daily cap). When a send hits
 * that limit, waiting a minute and retrying the same email is enough. It happened when the
 * automatic reply check ran at the same time as a batch (2026-10-22).
 */
export const GMAIL_RATE_LIMIT_MESSAGE = 'Gmail pidió esperar un minuto: se alcanzó su límite de consultas por minuto.'
export const GMAIL_RATE_LIMIT_WAIT_MS = 65_000
export const GMAIL_RATE_LIMIT_RETRIES = 3

/** Gmail's response is a temporary per-minute limit (429, or 403 for quota or rate limit). */
export function isRateLimitResponse(status: number, body: string): boolean {
  if (status === 429) return true
  return status === 403 && /rate ?limit|quota exceeded|ratelimitexceeded|userratelimitexceeded/i.test(body)
}

/** The error that reaches the browser is the per-minute limit (wait and retry, don't stop the batch). */
export function isGmailRateLimit(message: string): boolean {
  return message.includes(GMAIL_RATE_LIMIT_MESSAGE) || /quota exceeded|rate ?limit/i.test(message)
}
