import { describe, expect, it } from 'vitest'
import robots from './robots'

describe('robots.txt', () => {
  const r = robots()
  const reglas = Array.isArray(r.rules) ? r.rules : [r.rules]

  it('deja a Google descargar CSS, JS e imagenes de /_next/ para renderizar las paginas', () => {
    for (const regla of reglas) expect([regla.disallow].flat()).not.toContain('/_next/')
  })

  it('sigue fuera del indice lo privado: panel, acceso y API', () => {
    const google = reglas.find((x) => x.userAgent === 'Googlebot')!
    const d = [google.disallow].flat()
    for (const p of ['/api/', '/es/dashboard', '/en/dashboard/', '/es/login', '/es/unsubscribe']) expect(d).toContain(p)
    expect(r.sitemap).toMatch(/\/sitemap\.xml$/)
  })
})
