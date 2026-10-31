import { describe, expect, it } from 'vitest'
import { canRequestCode, codeHistory, historyAfter, metadataWithHistory, normalizeEmail } from './login'

const NOW = 1_800_000_000_000
const ago = (sec: number) => NOW - sec * 1000

describe('app sign-in', () => {
  it('normalizes the email and rejects what is not one', () => {
    expect(normalizeEmail('  Ana@Empresa.MX ')).toBe('ana@empresa.mx')
    expect(normalizeEmail('no-at-sign')).toBeNull()
    expect(normalizeEmail(null)).toBeNull()
    expect(normalizeEmail({ email: 'a@b.mx' })).toBeNull()
  })

  it('allows the first code and another one after a minute', () => {
    expect(canRequestCode([], NOW)).toEqual({ ok: true })
    expect(canRequestCode([ago(61)], NOW)).toEqual({ ok: true })
  })

  it('blocks a second code within the same minute and says how long to wait', () => {
    expect(canRequestCode([ago(20)], NOW)).toEqual({ ok: false, retryAfterSeconds: 40 })
  })

  it('blocks the sixth code of the hour until the oldest one expires', () => {
    const five = [ago(3000), ago(2400), ago(1800), ago(1200), ago(600)]
    expect(canRequestCode(five, NOW)).toEqual({ ok: false, retryAfterSeconds: 600 })
    // Codes older than an hour no longer count.
    expect(canRequestCode([ago(4000), ago(3900), ago(3800), ago(3700), ago(3650), ago(120)], NOW)).toEqual({ ok: true })
  })

  it('the stored history only keeps the last hour', () => {
    expect(historyAfter([ago(4000), ago(100)], NOW)).toEqual([ago(100), NOW])
  })

  it('reads the history under the new or the old metadata key and stores only the new one', () => {
    expect(codeHistory({ app_codes: [1] })).toEqual([1])
    expect(codeHistory({ codigos_app: [2] })).toEqual([2])
    expect(codeHistory(undefined)).toEqual([])
    expect(metadataWithHistory({ provider: 'email', codigos_app: [2] }, [3])).toEqual({ provider: 'email', app_codes: [3] })
  })
})
