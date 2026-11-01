import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { isAdmin, roleOf } from './roles'

describe('roles', () => {
  it('only someone who has it in app_metadata is admin', () => {
    expect(isAdmin({ app_metadata: { role: 'admin' } })).toBe(true)
    expect(roleOf({ app_metadata: { role: 'admin' } })).toBe('admin')
    expect(roleOf({ app_metadata: { provider: 'google' } })).toBe('client')
    expect(roleOf(null)).toBe('client')
  })

  it('whatever the user writes in user_metadata does not make them admin', () => {
    // supabase.auth.updateUser({ data: { role: 'admin' } }) can be done by anyone on themselves.
    const cheater = { user_metadata: { role: 'admin' }, app_metadata: {} }
    expect(isAdmin(cheater)).toBe(false)
  })

  it('no file decides permissions by reading the role from user_metadata', () => {
    const root = path.join(__dirname, '..')
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) walk(p)
        else if (/\.(ts|tsx)$/.test(e.name) && !e.name.includes('.test.')) {
          const s = fs.readFileSync(p, 'utf8')
          // Only exception: the Google callbacks use `!user_metadata.role` as a "first time" marker, not as a permission.
          const withoutMarker = s.replace(/!user\.user_metadata\?\.role/g, '')
          if (/user_metadata\??\.role/.test(withoutMarker)) offenders.push(path.relative(root, p))
        }
      }
    }
    walk(root)
    expect(offenders).toEqual([])
  })
})
