import { describe, expect, it } from 'vitest'
import { GMAIL_RATE_LIMIT_MESSAGE, PAUSE_MAX_MS, PAUSE_MIN_MS, isGmailRateLimit, isRateLimitResponse, sendCelebration, quotaWarning, dailyQuota, batchMinutes, pauseBetweenSends, canReceiveEmail, batchSummary } from './batch-send'

describe('batch sending', () => {
  it('only contacts with an email that is not marked invalid can be picked', () => {
    expect(canReceiveEmail({ email: 'a@x.mx' })).toBe(true)
    expect(canReceiveEmail({ email: null })).toBe(false)
    expect(canReceiveEmail({ email: '  ' })).toBe(false)
    expect(canReceiveEmail({ email: 'a@x.mx', tags: ['invalid-email'] })).toBe(false)
    expect(canReceiveEmail({ email: 'a@x.mx', invalid_emails: ['A@x.mx'] })).toBe(false)
    // Someone already written to doesn't enter the batch: their follow-up goes separately and on its date.
    expect(canReceiveEmail({ email: 'a@x.mx', emailStatus: { type: 'sent' } })).toBe(false)
    expect(canReceiveEmail({ email: 'a@x.mx', emailStatus: { type: 'replied' } })).toBe(false)
    expect(canReceiveEmail({ email: 'a@x.mx', emailStatus: { type: 'draft' } })).toBe(true)
    expect(canReceiveEmail({ email: 'a@x.mx', emailStatus: { type: 'none' } })).toBe(true)
  })

  it('the pause between sends goes from 20 to 45 seconds and changes each time', () => {
    expect(pauseBetweenSends(0)).toBe(PAUSE_MIN_MS)
    expect(pauseBetweenSends(1)).toBe(PAUSE_MAX_MS)
    expect(pauseBetweenSends(0.5)).toBe(32_500)
    expect(pauseBetweenSends(7)).toBe(PAUSE_MAX_MS)
    for (let i = 0; i < 50; i++) {
      const p = pauseBetweenSends()
      expect(p).toBeGreaterThanOrEqual(PAUSE_MIN_MS)
      expect(p).toBeLessThanOrEqual(PAUSE_MAX_MS)
    }
  })

  it('estimates how long the batch takes', () => {
    expect(batchMinutes(1)).toBe(1)
    expect(batchMinutes(25)).toBe(13)
  })

  it('summarizes the batch in one line', () => {
    expect(batchSummary({ ready: 22, alreadyHad: 1, errors: ['X: ya se le escribió', 'Y: dominio sin correo'] })).toBe('22 borradores listos · 1 ya tenía borrador · 2 sin preparar')
    expect(batchSummary({ ready: 1, alreadyHad: 0, errors: [] })).toBe('1 borrador listo')
    expect(batchSummary({ ready: 0, alreadyHad: 0, errors: [] })).toBe('No se preparó ningún correo')
  })

  it("today's quota subtracts what was sent and the drafts already waiting", () => {
    expect(dailyQuota(25, 7, 2)).toEqual({ cap: 25, sentToday: 7, pending: 2, fits: 16 })
    expect(dailyQuota(25, 24, 5).fits).toBe(0)
  })

  it('warns when more are picked than fit today', () => {
    const quota = dailyQuota(25, 18, 2)
    expect(quotaWarning(5, quota)).toBeNull()
    expect(quotaWarning(8, quota)).toBe('Elegiste 8 y hoy caben 5: los otros 3 quedan como borrador para mañana.')
    expect(quotaWarning(6, quota)).toBe('Elegiste 6 y hoy caben 5: el otro queda como borrador para mañana.')
    expect(quotaWarning(3, dailyQuota(25, 19, 8))).toMatch(/^El límite de hoy ya está lleno/)
  })

  it("celebrates when the day's limit is reached or the batch goes out complete", () => {
    const base = { sent: 6, total: 6, errors: 0, stopped: false, sentToday: 25, cap: 25 }
    expect(sendCelebration(base)).toMatchObject({ type: 'goal', title: '¡Meta del día cumplida!' })
    expect(sendCelebration(base)!.text).toContain('25 de 25')
    expect(sendCelebration({ ...base, sentToday: 12 })).toMatchObject({ type: 'batch' })
    // A single send that reaches the limit also counts.
    expect(sendCelebration({ sent: 1, total: 1, errors: 0, stopped: false, sentToday: 25, cap: 25 })?.type).toBe('goal')
  })

  it('does not celebrate a stopped, failed, incomplete or single-email batch', () => {
    const base = { sent: 6, total: 6, errors: 0, stopped: false, sentToday: 12, cap: 25 }
    expect(sendCelebration({ ...base, stopped: true })).toBeNull()
    expect(sendCelebration({ ...base, errors: 1 })).toBeNull()
    expect(sendCelebration({ ...base, sent: 4 })).toBeNull()
    expect(sendCelebration({ ...base, sent: 1, total: 1 })).toBeNull()
    expect(sendCelebration({ ...base, sent: 0 })).toBeNull()
  })
})

describe('Gmail per-minute limit', () => {
  const quota = '{"error":{"code":403,"message":"Quota exceeded for quota metric \'Total Query Cost\' and limit \'Units per minute per user\' of service \'gmail.googleapis.com\'"}}'

  it("recognizes Gmail's response asking to wait (429, or 403 for quota or rate limit)", () => {
    expect(isRateLimitResponse(403, quota)).toBe(true)
    expect(isRateLimitResponse(429, '')).toBe(true)
    expect(isRateLimitResponse(403, '{"error":{"errors":[{"reason":"userRateLimitExceeded"}]}}')).toBe(true)
    // A 403 for permissions is not a limit: no retry.
    expect(isRateLimitResponse(403, '{"error":{"message":"Request had insufficient authentication scopes."}}')).toBe(false)
    expect(isRateLimitResponse(400, quota)).toBe(false)
  })

  it('the batch waits and retries on the limit, but stops if Gmail is disconnected or the cap was reached', () => {
    expect(isGmailRateLimit(GMAIL_RATE_LIMIT_MESSAGE)).toBe(true)
    expect(isGmailRateLimit(`Gmail send 403: ${quota}`)).toBe(true)
    expect(isGmailRateLimit('No hay una cuenta de Gmail conectada')).toBe(false)
    expect(isGmailRateLimit('Ya mandaste 40 hoy; el tope de hoy es 40.')).toBe(false)
  })
})
