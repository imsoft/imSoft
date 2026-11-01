import { describe, expect, it } from 'vitest'
import { MAIN_SERVICES, showcaseCase, startingPriceOf, marketingServices, secondaryServices } from './main-services'
import { PRICE_FLOORS, withTransferDiscount, startingPriceLabel } from '@/config/pricing'

const services = [
  { id: '1', slug: 'web-pages', title_es: 'Páginas Web', title_en: 'Web Pages', icon: '🖥️', category: 'technology' },
  { id: '2', slug: 'data-analysis', title_es: 'Análisis de Datos', title_en: 'Data Analysis', icon: '📊', category: 'technology' },
  { id: '3', slug: 'software-a-medida', title_es: 'Software a Medida', title_en: 'Custom Software', icon: '💻', category: 'technology' },
  { id: '4', slug: 'desarrollo-seguro', title_es: 'Desarrollo Seguro', title_en: 'Secure Development', icon: '🔒', category: 'technology' },
  { id: '5', slug: 'paid-media', title_es: 'Paid Media', title_en: 'Paid Media', icon: '💰', category: 'marketing' },
  { id: '6', slug: 'sin-categoria', title_es: 'Viejo', title: 'Legacy', icon: '' },
]

describe('main services on the home page', () => {
  it('there are five, all linking to an existing service and with three deliverables', () => {
    expect(MAIN_SERVICES).toHaveLength(5)
    for (const s of MAIN_SERVICES) {
      expect(s.slug).toMatch(/^[a-z-]+$/)
      expect(s.deliverables.es).toHaveLength(3)
      expect(s.deliverables.en).toHaveLength(3)
      expect(s.problem.es.length).toBeGreaterThan(30)
    }
  })

  it('each card shows the price floor from the single source, in pesos or dollars', () => {
    const startingPrices = Object.fromEntries(MAIN_SERVICES.map((s) => [s.slug, startingPriceOf(s, 'es')]))
    // List price with the card fee included (2026-10-31); by transfer, 5 % less.
    expect(startingPrices['web-pages']).toBe('Desde $16,000 MXN')
    expect(startingPrices['tiendas-en-linea']).toBe('Desde $32,000 MXN')
    expect(startingPrices['software-a-medida']).toBe('Desde $63,000 MXN')
    expect(startingPrices['aplicaciones-moviles']).toBe('Desde $95,000 MXN')
    expect(startingPrices['desarrollo-de-mvp']).toBe('Desde $63,000 MXN')
    expect(startingPriceOf(MAIN_SERVICES[0], 'en')).toBe('From $3,400 USD')
    expect(withTransferDiscount(PRICE_FLOORS['software-a-medida'].mxn)).toBe(59850)
    // Custom software no longer starts at the level of full platforms.
    expect(PRICE_FLOORS['software-a-medida'].mxn).toBeLessThan(PRICE_FLOORS['plataforma-completa'].mxn)
    expect(startingPriceLabel('plataforma-completa', 'es')).toBe('Desde $158,000 MXN')
  })

  it('takes the case image from the portfolio and does not break if the project is missing', () => {
    const portfolio = [{ slug: 'cijj', image_url: 'https://x/cijj.png' }, { slug: 'urbans', image_url: null }]
    const web = MAIN_SERVICES.find((s) => s.slug === 'web-pages')!
    expect(showcaseCase(web, portfolio)).toEqual({ slug: 'cijj', name: 'Ingenieros Jóvenes de Jalisco', image: 'https://x/cijj.png' })
    const mvp = MAIN_SERVICES.find((s) => s.slug === 'desarrollo-de-mvp')!
    expect(showcaseCase(mvp, portfolio)).toBeNull()
    const app = MAIN_SERVICES.find((s) => s.slug === 'aplicaciones-moviles')!
    expect(showcaseCase(app, portfolio)).toBeNull()
  })

  it('the compact list has the non-main technology services, in the requested language; marketing goes separately', () => {
    expect(secondaryServices(services as never, 'es').map((s) => s.slug)).toEqual(['data-analysis', 'desarrollo-seguro', 'sin-categoria'])
    expect(secondaryServices(services as never, 'en')[0].title).toBe('Data Analysis')
    expect(secondaryServices(services as never, 'en')[2].title).toBe('Legacy')
    expect(marketingServices(services as never, 'es')).toEqual([{ slug: 'paid-media', title: 'Paid Media', icon: '💰' }])
  })
})
