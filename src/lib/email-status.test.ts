import { describe, expect, it } from 'vitest'
import { emailAction, emailStatusOf, emailStatusLabel, shortDate, type EmailRow } from './email-status'

const f = (step: number, status: EmailRow['status'], sent_at: string | null = null): EmailRow => ({ id: `e${step}`, step, status, sent_at })

describe("status of a contact's email sequence", () => {
  it('with no emails, or only skipped ones, they can be written to', () => {
    expect(emailStatusOf([])).toEqual({ type: 'none' })
    expect(emailStatusOf([f(1, 'skipped')])).toEqual({ type: 'none' })
    expect(emailAction({ type: 'none' })).toBe('write')
  })

  it('with a pending draft, that draft is opened', () => {
    const e = emailStatusOf([f(1, 'draft')])
    expect(e).toEqual({ type: 'draft', step: 1, draftId: 'e1' })
    expect(emailAction(e)).toBe('open-draft')
    expect(emailStatusLabel(e, '2026-09-30')).toBe('Borrador listo para revisar')
    expect(emailStatusLabel(emailStatusOf([f(1, 'sent', '2026-09-20T16:00:00Z'), f(2, 'draft')]), '2026-09-30')).toBe('Seguimiento 1 listo para revisar')
  })

  it('sent: says when it was sent and when the follow-up is due (4 business days)', () => {
    // Thursday Sep 24 + 4 business days = Wednesday Sep 30.
    const e = emailStatusOf([f(1, 'sent', '2026-09-24T19:14:00Z')])
    expect(e).toEqual({ type: 'sent', step: 1, date: '2026-09-24', nextStep: 2, dueOn: '2026-09-30' })
    expect(emailAction(e)).toBe('follow-up')
    expect(emailStatusLabel(e, '2026-09-28')).toBe('Enviado el 24 sep · seguimiento el 30 sep')
    expect(emailStatusLabel(e, '2026-09-30')).toBe('Enviado el 24 sep · ya toca seguimiento')
  })

  it('after the first follow-up there is still one left', () => {
    const e = emailStatusOf([f(1, 'sent', '2026-09-15T16:00:00Z'), f(2, 'sent', '2026-09-21T16:00:00Z')])
    expect(e.type === 'sent' && e.nextStep).toBe(3)
    expect(emailStatusLabel(e, '2026-09-22')).toMatch(/^Seguimiento 1 enviado el 21 sep · seguimiento el /)
  })

  it('if they replied or all three were sent, nothing more is written from here', () => {
    const r = emailStatusOf([f(1, 'replied', '2026-09-24T19:14:00Z')])
    expect(r.type).toBe('replied')
    expect(emailAction(r)).toBeNull()
    const t = emailStatusOf([f(1, 'sent', '2026-09-01T16:00:00Z'), f(2, 'sent', '2026-09-07T16:00:00Z'), f(3, 'sent', '2026-09-15T16:00:00Z')])
    expect(t).toEqual({ type: 'finished', date: '2026-09-15' })
    expect(emailStatusLabel(t, '2026-09-30')).toBe('Secuencia terminada el 15 sep')
    // A bounce closes the sequence.
    expect(emailStatusOf([f(1, 'closed', '2026-09-24T19:14:00Z')]).type).toBe('finished')
    expect(emailAction(t)).toBeNull()
  })

  it("the date is Guadalajara's: a send at 8:30 pm does not fall on the next day", () => {
    const e = emailStatusOf([f(1, 'sent', '2026-09-25T02:30:00Z')])
    expect(e.type === 'sent' && e.date).toBe('2026-09-24')
  })

  it('short date', () => {
    expect(shortDate('2026-09-04')).toBe('4 sep')
    expect(shortDate(null)).toBe('')
  })
})
