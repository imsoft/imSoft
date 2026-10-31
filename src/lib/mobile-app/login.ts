/**
 * Mobile app sign-in: email + one-time code.
 *
 * The website signs in with password and captcha; a native app can't solve the captcha, and
 * Supabase requires it to request any sign-in. So the server generates the code (with the
 * service key) and emails it; the app only verifies it, which needs no captcha. There's no
 * sign-up from the app: imSoft creates the accounts.
 */

export const CODE_COOLDOWN_MS = 60_000
export const MAX_CODES_PER_HOUR = 5
const HOUR_MS = 3_600_000

export function normalizeEmail(email: unknown): string | null {
  const e = String(email ?? '').trim().toLowerCase()
  return /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(e) && e.length <= 254 ? e : null
}

/**
 * Abuse brake (flooding someone with emails, or guessing codes by requesting many): one per
 * minute and five per hour per account. `history` holds the timestamps (ms) of codes already sent.
 */
export function canRequestCode(history: number[], now: number): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const recent = history.filter((t) => now - t < HOUR_MS).sort((a, b) => a - b)
  const last = recent[recent.length - 1]
  if (last !== undefined && now - last < CODE_COOLDOWN_MS) {
    return { ok: false, retryAfterSeconds: Math.ceil((CODE_COOLDOWN_MS - (now - last)) / 1000) }
  }
  if (recent.length >= MAX_CODES_PER_HOUR) {
    return { ok: false, retryAfterSeconds: Math.ceil((HOUR_MS - (now - recent[0])) / 1000) }
  }
  return { ok: true }
}

/** History to store after sending a code: only the last hour. */
export function historyAfter(history: number[], now: number): number[] {
  return [...history.filter((t) => now - t < HOUR_MS), now]
}

/**
 * Code history kept in the user's app_metadata. `codigos_app` is the old key: it's still read
 * so a cooldown in progress survives the rename, and it's dropped on the next write.
 */
export function codeHistory(appMetadata: Record<string, unknown> | undefined): number[] {
  const value = appMetadata?.app_codes ?? appMetadata?.codigos_app
  return Array.isArray(value) ? (value as number[]) : []
}

export function metadataWithHistory(appMetadata: Record<string, unknown> | undefined, history: number[]): Record<string, unknown> {
  const next: Record<string, unknown> = { ...appMetadata, app_codes: history }
  delete next.codigos_app
  return next
}
