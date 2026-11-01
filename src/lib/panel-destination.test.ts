import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { panelFor } from './panel-destination'

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8')

describe('signed-in session', () => {
  it('each role goes to its panel, in the requested language', () => {
    expect(panelFor('admin', 'es')).toBe('/es/dashboard/admin')
    expect(panelFor('client', 'en')).toBe('/en/dashboard/client')
    expect(panelFor(undefined, 'fr')).toBe('/es/dashboard/client')
  })

  it('login and signup send someone already signed in to the panel, instead of asking them to sign in again', () => {
    for (const p of ['src/app/[lang]/login/page.tsx', 'src/app/[lang]/signup/page.tsx']) {
      const s = read(p)
      expect(s, p).toContain('auth.getUser()')
      expect(s, p).toMatch(/if \(user\) redirect\(panelFor\(/)
    }
  })

  it('the proxy passes the session it just refreshed to the page', () => {
    // With NextResponse.next() without the request, the page read the expired cookies.
    const s = read('src/proxy.ts')
    expect(s).toContain('NextResponse.next({ request })')
    expect(s).toMatch(/setAll\(cookiesToSet\) \{\s*cookiesToSet\.forEach\(\(\{ name, value \}\) => request\.cookies\.set\(name, value\)\)\s*response = createResponse\(\)/)
  })
})
