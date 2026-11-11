import { describe, expect, it } from 'vitest'
import { hasSupabaseSession } from './proxy'

const req = (names: string[]) => ({ cookies: { getAll: () => names.map((name) => ({ name, value: 'x' })) } }) as never

describe('proxy: Supabase session detection', () => {
  it('detects the auth cookie, whole or split into chunks', () => {
    expect(hasSupabaseSession(req(['sb-abcd-auth-token']))).toBe(true)
    expect(hasSupabaseSession(req(['_ga', 'sb-abcd-auth-token.0', 'sb-abcd-auth-token.1']))).toBe(true)
  })

  it('bots and visitors without a session skip Supabase', () => {
    expect(hasSupabaseSession(req([]))).toBe(false)
    expect(hasSupabaseSession(req(['_ga', 'NEXT_LOCALE', 'sb-abcd-code-verifier']))).toBe(false)
  })
})
