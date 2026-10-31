/**
 * Where a contact's email sequence stands (first email and two follow-ups), so the CRM
 * table can show it and offer the action that's due: write, open the draft, follow up or
 * nothing.
 */
import { nextStepDate } from './outreach.ts'

export interface EmailRow {
  id: string
  step: number
  status: 'draft' | 'sent' | 'replied' | 'closed' | 'skipped'
  sent_at: string | null
}

export type EmailStatus =
  | { type: 'none' }
  | { type: 'draft'; step: number; draftId: string }
  | { type: 'sent'; step: number; date: string; nextStep: 2 | 3; dueOn: string }
  | { type: 'replied'; date: string | null }
  | { type: 'finished'; date: string | null }

/** Day (YYYY-MM-DD) in Guadalajara time: a send at 8 pm must not fall on the next day. */
function localDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
}

export function emailStatusOf(rows: EmailRow[]): EmailStatus {
  const live = rows.filter((f) => f.status !== 'skipped')
  if (live.length === 0) return { type: 'none' }
  const lastDate = live.map((f) => f.sent_at).filter(Boolean).sort().pop() ?? null
  if (live.some((f) => f.status === 'replied')) return { type: 'replied', date: lastDate ? localDay(lastDate) : null }
  const draft = live.filter((f) => f.status === 'draft').sort((a, b) => a.step - b.step)[0]
  if (draft) return { type: 'draft', step: draft.step, draftId: draft.id }
  const sent = live.filter((f) => f.status === 'sent' && f.sent_at).sort((a, b) => b.step - a.step)
  const last = sent[0]
  if (!last || last.step >= 3 || live.some((f) => f.status === 'closed')) return { type: 'finished', date: lastDate ? localDay(lastDate) : null }
  const nextStep = (last.step + 1) as 2 | 3
  return { type: 'sent', step: last.step, date: localDay(last.sent_at!), nextStep, dueOn: nextStepDate(new Date(last.sent_at!), nextStep) }
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** "2026-09-24" -> "24 sep". */
export function shortDate(iso: string | null | undefined): string {
  const m = (iso ?? '').match(/^\d{4}-(\d{2})-(\d{2})/)
  return m ? `${Number(m[2])} ${MONTHS[Number(m[1]) - 1]}` : ''
}

/** Line shown under the email in the table. `today` in YYYY-MM-DD format. */
export function emailStatusLabel(e: EmailStatus, today: string): string | null {
  switch (e.type) {
    case 'none': return null
    case 'draft': return e.step === 1 ? 'Borrador listo para revisar' : `Seguimiento ${e.step - 1} listo para revisar`
    case 'replied': return 'Respondió'
    case 'finished': return e.date ? `Secuencia terminada el ${shortDate(e.date)}` : 'Secuencia terminada'
    case 'sent': {
      const what = e.step === 1 ? 'Enviado' : `Seguimiento ${e.step - 1} enviado`
      return `${what} el ${shortDate(e.date)} · ${e.dueOn <= today ? 'ya toca seguimiento' : `seguimiento el ${shortDate(e.dueOn)}`}`
    }
  }
}

/** Whether something can be written now: first email, open its draft or follow up. */
export function emailAction(e: EmailStatus): 'write' | 'open-draft' | 'follow-up' | null {
  if (e.type === 'none') return 'write'
  if (e.type === 'draft') return 'open-draft'
  if (e.type === 'sent') return 'follow-up'
  return null
}
