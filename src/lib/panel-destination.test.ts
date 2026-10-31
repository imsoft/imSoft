import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { panelFor } from './panel-destination'

const leer = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8')

describe('sesion abierta', () => {
  it('cada rol va a su panel, en el idioma pedido', () => {
    expect(panelFor('admin', 'es')).toBe('/es/dashboard/admin')
    expect(panelFor('client', 'en')).toBe('/en/dashboard/client')
    expect(panelFor(undefined, 'fr')).toBe('/es/dashboard/client')
  })

  it('login y registro mandan al panel a quien ya tiene sesion, en vez de pedirle entrar otra vez', () => {
    for (const p of ['src/app/[lang]/login/page.tsx', 'src/app/[lang]/signup/page.tsx']) {
      const s = leer(p)
      expect(s, p).toContain('auth.getUser()')
      expect(s, p).toMatch(/if \(user\) redirect\(panelFor\(/)
    }
  })

  it('el proxy pasa a la pagina la sesion que acaba de renovar', () => {
    // Con NextResponse.next() sin la peticion, la pagina leia las cookies vencidas.
    const s = leer('src/proxy.ts')
    expect(s).toContain('NextResponse.next({ request })')
    expect(s).toMatch(/setAll\(cookiesToSet\) \{\s*cookiesToSet\.forEach\(\(\{ name, value \}\) => request\.cookies\.set\(name, value\)\)\s*response = crear\(\)/)
  })
})
