import { describe, expect, it } from 'vitest'
import robots, { BLOCKED_BOTS } from './robots'

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

  it('blocks AI training and SEO crawlers but not search engines or AI search bots', () => {
    const blocked = rules.find((x) => Array.isArray(x.userAgent))!
    expect(blocked.disallow).toBe('/')
    expect(blocked.userAgent).toEqual(BLOCKED_BOTS)
    for (const bot of ['GPTBot', 'CCBot', 'Bytespider', 'AhrefsBot']) expect(BLOCKED_BOTS).toContain(bot)
    for (const bot of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'Claude-SearchBot']) expect(BLOCKED_BOTS).not.toContain(bot)
  })
})
