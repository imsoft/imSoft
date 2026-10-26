import { describe, expect, it } from 'vitest'
import { SERVICIOS_PRINCIPALES, casoIlustrado, serviciosDeMarketing, serviciosSecundarios } from './servicios-principales'

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
    expect(SERVICIOS_PRINCIPALES).toHaveLength(5)
    for (const s of SERVICIOS_PRINCIPALES) {
      expect(s.slug).toMatch(/^[a-z-]+$/)
      expect(s.entregables.es).toHaveLength(3)
      expect(s.entregables.en).toHaveLength(3)
      expect(s.problema.es.length).toBeGreaterThan(30)
    }
  })

  it('los precios publicados coinciden con la referencia de precios de la portada', () => {
    const desde = Object.fromEntries(SERVICIOS_PRINCIPALES.map((s) => [s.slug, s.desde?.es ?? null]))
    expect(desde['web-pages']).toBe('Desde $15,000 MXN')
    expect(desde['desarrollo-de-mvp']).toBe('Desde $60,000 MXN')
    expect(desde['software-a-medida']).toBe('Desde $150,000 MXN')
    // Donde no hay precio publicado no se inventa: se promete el precio fijo en 48 h.
    expect(desde['aplicaciones-moviles']).toBeNull()
    expect(desde['tiendas-en-linea']).toBeNull()
  })

  it('toma la imagen del caso desde el portafolio y no truena si el proyecto no está', () => {
    const portafolio = [{ slug: 'cijj', image_url: 'https://x/cijj.png' }, { slug: 'urbans', image_url: null }]
    const web = SERVICIOS_PRINCIPALES.find((s) => s.slug === 'web-pages')!
    expect(casoIlustrado(web, portafolio)).toEqual({ slug: 'cijj', nombre: 'Ingenieros Jóvenes de Jalisco', imagen: 'https://x/cijj.png' })
    const mvp = SERVICIOS_PRINCIPALES.find((s) => s.slug === 'desarrollo-de-mvp')!
    expect(casoIlustrado(mvp, portafolio)).toBeNull()
    const app = SERVICIOS_PRINCIPALES.find((s) => s.slug === 'aplicaciones-moviles')!
    expect(casoIlustrado(app, portafolio)).toBeNull()
  })

  it('la lista compacta trae la tecnología que no es principal, en el idioma pedido; el marketing va aparte', () => {
    expect(serviciosSecundarios(servicios as never, 'es').map((s) => s.slug)).toEqual(['data-analysis', 'desarrollo-seguro', 'sin-categoria'])
    expect(serviciosSecundarios(servicios as never, 'en')[0].titulo).toBe('Data Analysis')
    expect(serviciosSecundarios(servicios as never, 'en')[2].titulo).toBe('Legacy')
    expect(serviciosDeMarketing(servicios as never, 'es')).toEqual([{ slug: 'paid-media', titulo: 'Paid Media', icono: '💰' }])
  })
})
