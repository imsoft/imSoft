import { describe, it, expect } from 'vitest'
import { getServiceFallback, serviceStaticParams } from './service-fallbacks'

describe('serviceStaticParams', () => {
  it('prerenders the database services and the built-in fallbacks in both languages, without repeats', () => {
    const params = serviceStaticParams(['software-a-medida', 'servicio-nuevo', null, '  '])
    const es = params.filter((p) => p.lang === 'es').map((p) => p.slug)
    const en = params.filter((p) => p.lang === 'en').map((p) => p.slug)
    expect(es).toEqual(en)
    expect(es).toContain('servicio-nuevo')
    expect(new Set(es).size).toBe(es.length)
    expect(es.every(Boolean)).toBe(true)
    // Every fallback service is included even if the table is empty.
    for (const slug of serviceStaticParams([]).map((p) => p.slug)) expect(getServiceFallback(slug)).toBeDefined()
  })
})
