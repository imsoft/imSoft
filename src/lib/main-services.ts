/**
 * Servicios que se venden en la portada. La seccion de servicios mostraba 19 tarjetas
 * iguales (13 de software, 6 de marketing) con foto de banco y solo el nombre, y en
 * celular eran seis pantallas de scroll. Desde el 26-oct-2026 la portada muestra cinco
 * servicios principales con problema, entregables, precio y un caso real, y el resto en
 * una lista compacta. La pagina /services sigue mostrando todo.
 *
 * Los precios "desde" salen de src/config/pricing.ts, la misma fuente que la referencia de
 * precios. Los ganchos usan el mismo lenguaje que los mensajes de prospeccion del CRM.
 */
import type { Service } from '@/types/database'
import { startingPriceLabel, type PriceKey } from '@/config/pricing'

export interface MainService {
  /** Slug del servicio en la tabla `services` (enlace a /services/<slug>). */
  slug: string
  title: { es: string; en: string }
  /** El problema del cliente, en una frase. */
  problem: { es: string; en: string }
  deliverables: { es: [string, string, string]; en: [string, string, string] }
  /** Clave del piso de precio en src/config/pricing.ts. */
  price: PriceKey
  /** Slug del proyecto del portafolio que ilustra el servicio, si hay uno. */
  showcase: { slug: string; name: string } | null
}

export const MAIN_SERVICES: MainService[] = [
  {
    slug: 'software-a-medida',
    title: { es: 'Software a la medida', en: 'Custom software' },
    problem: {
      es: 'Tu operación vive en Excel y WhatsApp, y saber en qué va cada cosa depende de preguntarle a alguien.',
      en: 'Your operation lives in spreadsheets and WhatsApp, and knowing where things stand means asking someone.',
    },
    deliverables: {
      es: ['Sistema web con usuarios y roles para tu equipo', 'Portal donde tus clientes consultan su estatus solos', 'Código 100% tuyo, sin licencias ni mensualidades'],
      en: ['Web system with users and roles for your team', 'Portal where your clients check their status themselves', '100% your code, no licenses or monthly fees'],
    },
    price: 'software-a-medida',
    showcase: { slug: 'jtp-logistics-inventory', name: 'JTP Logistics' },
  },
  {
    slug: 'desarrollo-de-mvp',
    title: { es: 'Plataforma o producto digital', en: 'Platform or digital product' },
    problem: {
      es: 'Tienes una idea de negocio que necesita pagos, cuentas y reservas, y quieres lanzarla sin construir de más.',
      en: 'You have a business idea that needs payments, accounts and bookings, and want to launch without overbuilding.',
    },
    deliverables: {
      es: ['Producto funcional en 6 a 8 semanas', 'Registro, pagos y panel de administración incluidos', 'Arquitectura que crece sin reescribir'],
      en: ['Working product in 6 to 8 weeks', 'Sign-up, payments and admin panel included', 'Architecture that grows without a rewrite'],
    },
    price: 'desarrollo-de-mvp',
    showcase: { slug: 'urbans', name: 'URBANS' },
  },
  {
    slug: 'aplicaciones-moviles',
    title: { es: 'App propia para tu negocio', en: 'Your own business app' },
    problem: {
      es: 'Tus pedidos entran por WhatsApp o por apps que cobran comisión, y a tus clientes frecuentes nadie los identifica.',
      en: 'Orders come in through WhatsApp or apps that charge commission, and nobody identifies your repeat customers.',
    },
    deliverables: {
      es: ['App iOS y Android con tu marca, publicada en las tiendas', 'Pedidos, puntos y promociones directas a quien ya te compra', 'Sin comisiones de terceros por cada venta'],
      en: ['iOS and Android app with your brand, published in the stores', 'Orders, points and promotions straight to existing customers', 'No third-party commission on each sale'],
    },
    price: 'aplicaciones-moviles',
    showcase: null,
  },
  {
    slug: 'tiendas-en-linea',
    title: { es: 'Tienda en línea', en: 'Online store' },
    problem: {
      es: 'Vendes por mensaje, uno por uno, y pierdes ventas fuera de tu horario y de tu ciudad.',
      en: 'You sell by direct message, one by one, and lose sales outside your hours and your city.',
    },
    deliverables: {
      es: ['Catálogo, carrito y pagos con tarjeta y meses sin intereses', 'Envíos a todo México e inventario al día', 'Dos idiomas y dos monedas si vendes fuera'],
      en: ['Catalog, cart and card payments with installments', 'Shipping across Mexico and up-to-date inventory', 'Two languages and two currencies if you sell abroad'],
    },
    price: 'tiendas-en-linea',
    showcase: { slug: 'starfilters', name: 'Star Filters' },
  },
  {
    slug: 'web-pages',
    title: { es: 'Página web', en: 'Website' },
    problem: {
      es: 'Te buscan en Google y encuentran solo tu Facebook, o un sitio viejo que no refleja lo que haces hoy.',
      en: 'People search for you on Google and find only your Facebook, or an old site that does not reflect what you do today.',
    },
    deliverables: {
      es: ['Diseño propio, rápido y pensado para celular', 'Posicionamiento en Google para tu ciudad', 'Dominio, hosting y certificado incluidos'],
      en: ['Custom design, fast and built for mobile', 'Google positioning for your city', 'Domain, hosting and SSL included'],
    },
    price: 'web-pages',
    showcase: { slug: 'cijj', name: 'Ingenieros Jóvenes de Jalisco' },
  },
]

/** Etiqueta "Desde $X" del servicio en el idioma pedido. */
export function startingPriceOf(service: MainService, lang: string): string {
  return startingPriceLabel(service.price, lang)
}

export interface ShowcaseCase {
  slug: string
  name: string
  image: string
}

/** Imagen del portafolio para el caso de cada servicio; null si el proyecto no esta. */
export function showcaseCase(service: MainService, portfolio: Array<{ slug?: string | null; image_url?: string | null }>): ShowcaseCase | null {
  if (!service.showcase) return null
  const p = portfolio.find((x) => x.slug === service.showcase!.slug)
  if (!p?.image_url) return null
  return { slug: service.showcase.slug, name: service.showcase.name, image: p.image_url }
}

export interface SecondaryService {
  slug: string
  title: string
  icon: string
}

/**
 * Lo demas que se ofrece, para la lista compacta: servicios de tecnologia que no son
 * principales, en el orden en que estan en la base. El marketing va aparte, en una linea.
 */
export function secondaryServices(services: Service[], lang: string): SecondaryService[] {
  const mainSlugs = new Set(MAIN_SERVICES.map((s) => s.slug))
  return services
    .filter((s) => (s.category ?? 'technology') === 'technology' && s.slug && !mainSlugs.has(s.slug))
    .map((s) => ({ slug: s.slug!, title: (lang === 'en' ? s.title_en : s.title_es) || s.title || s.slug!, icon: s.icon || '' }))
}

export function marketingServices(services: Service[], lang: string): SecondaryService[] {
  return services
    .filter((s) => s.category === 'marketing' && s.slug)
    .map((s) => ({ slug: s.slug!, title: (lang === 'en' ? s.title_en : s.title_es) || s.title || s.slug!, icon: s.icon || '' }))
}
