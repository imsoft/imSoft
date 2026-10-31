import { describe, expect, it } from 'vitest'
import { MAIN_SERVICES, showcaseCase, startingPriceOf, marketingServices, secondaryServices } from './main-services'
import { PRICE_FLOORS, withTransferDiscount, startingPriceLabel } from '@/config/pricing'

const servicios = [
  { id: '1', slug: 'web-pages', title_es: 'Páginas Web', title_en: 'Web Pages', icon: '🖥️', category: 'technology' },
  { id: '2', slug: 'data-analysis', title_es: 'Análisis de Datos', title_en: 'Data Analysis', icon: '📊', category: 'technology' },
  { id: '3', slug: 'software-a-medida', title_es: 'Software a Medida', title_en: 'Custom Software', icon: '💻', category: 'technology' },
  { id: '4', slug: 'desarrollo-seguro', title_es: 'Desarrollo Seguro', title_en: 'Secure Development', icon: '🔒', category: 'technology' },
  { id: '5', slug: 'paid-media', title_es: 'Paid Media', title_en: 'Paid Media', icon: '💰', category: 'marketing' },
  { id: '6', slug: 'sin-categoria', title_es: 'Viejo', title: 'Legacy', icon: '' },
]

describe('servicios principales de la portada', () => {
  it('son cinco, todos con enlace a un servicio existente y tres entregables', () => {
    expect(MAIN_SERVICES).toHaveLength(5)
    for (const s of MAIN_SERVICES) {
      expect(s.slug).toMatch(/^[a-z-]+$/)
      expect(s.deliverables.es).toHaveLength(3)
      expect(s.deliverables.en).toHaveLength(3)
      expect(s.problem.es.length).toBeGreaterThan(30)
    }
  })

  it('cada tarjeta muestra el piso de precio de la fuente única, en pesos o en dólares', () => {
    const desde = Object.fromEntries(MAIN_SERVICES.map((s) => [s.slug, startingPriceOf(s, 'es')]))
    // Lista con la comision de tarjeta incluida (31-oct-2026); por transferencia, 5 % menos.
    expect(desde['web-pages']).toBe('Desde $16,000 MXN')
    expect(desde['tiendas-en-linea']).toBe('Desde $32,000 MXN')
    expect(desde['software-a-medida']).toBe('Desde $63,000 MXN')
    expect(desde['aplicaciones-moviles']).toBe('Desde $95,000 MXN')
    expect(desde['desarrollo-de-mvp']).toBe('Desde $63,000 MXN')
    expect(startingPriceOf(MAIN_SERVICES[0], 'en')).toBe('From $3,400 USD')
    expect(withTransferDiscount(PRICE_FLOORS['software-a-medida'].mxn)).toBe(59850)
    // Software a la medida ya no arranca en el nivel de las plataformas completas.
    expect(PRICE_FLOORS['software-a-medida'].mxn).toBeLessThan(PRICE_FLOORS['plataforma-completa'].mxn)
    expect(startingPriceLabel('plataforma-completa', 'es')).toBe('Desde $158,000 MXN')
  })

  it('toma la imagen del caso desde el portafolio y no truena si el proyecto no está', () => {
    const portafolio = [{ slug: 'cijj', image_url: 'https://x/cijj.png' }, { slug: 'urbans', image_url: null }]
    const web = MAIN_SERVICES.find((s) => s.slug === 'web-pages')!
    expect(showcaseCase(web, portafolio)).toEqual({ slug: 'cijj', name: 'Ingenieros Jóvenes de Jalisco', image: 'https://x/cijj.png' })
    const mvp = MAIN_SERVICES.find((s) => s.slug === 'desarrollo-de-mvp')!
    expect(showcaseCase(mvp, portafolio)).toBeNull()
    const app = MAIN_SERVICES.find((s) => s.slug === 'aplicaciones-moviles')!
    expect(showcaseCase(app, portafolio)).toBeNull()
  })

  it('la lista compacta trae la tecnología que no es principal, en el idioma pedido; el marketing va aparte', () => {
    expect(secondaryServices(servicios as never, 'es').map((s) => s.slug)).toEqual(['data-analysis', 'desarrollo-seguro', 'sin-categoria'])
    expect(secondaryServices(servicios as never, 'en')[0].title).toBe('Data Analysis')
    expect(secondaryServices(servicios as never, 'en')[2].title).toBe('Legacy')
    expect(marketingServices(servicios as never, 'es')).toEqual([{ slug: 'paid-media', title: 'Paid Media', icon: '💰' }])
  })
})
