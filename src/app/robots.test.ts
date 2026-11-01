import { describe, expect, it } from 'vitest'
import robots from './robots'

describe('robots.txt', () => {
  const r = robots()
  const rules = Array.isArray(r.rules) ? r.rules : [r.rules]

  it('lets Google fetch CSS, JS and images from /_next/ to render the pages', () => {
    for (const rule of rules) expect([rule.disallow].flat()).not.toContain('/_next/')
  })

  it('keeps private areas out of the index: dashboard, login and API', () => {
    const google = rules.find((x) => x.userAgent === 'Googlebot')!
    const d = [google.disallow].flat()
    for (const p of ['/api/', '/es/dashboard', '/en/dashboard/', '/es/login', '/es/unsubscribe']) expect(d).toContain(p)
    expect(r.sitemap).toMatch(/\/sitemap\.xml$/)
  })
})
