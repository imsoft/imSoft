/**
 * Sample websites for fictitious businesses, shown to prospects who have no website
 * ("¿Les mando un ejemplo?"). They live at /es/demo/<slug>, are not indexed, and every
 * call to action goes to imSoft's WhatsApp with a message that says which sample the
 * person saw, so the conversation starts with that context.
 */

export const IMSOFT_WHATSAPP = '523325365558'

export const DEMO_SITES = {
  'consultorio-dental': { label: 'consultorio dental', title: 'Dental Alba · Odontología integral en Guadalajara' },
  'taller-mecanico': { label: 'taller mecánico', title: 'Taller Ledesma · Mecánica automotriz en Zapopan' },
} as const

export type DemoSlug = keyof typeof DEMO_SITES

export function isDemoSlug(slug: string): slug is DemoSlug {
  return Object.hasOwn(DEMO_SITES, slug)
}

/** WhatsApp link to imSoft that names the sample the visitor was looking at. */
export function demoWhatsAppHref(slug: DemoSlug): string {
  const text = `Hola imSoft, vi la página de ejemplo del ${DEMO_SITES[slug].label} y me interesa una así para mi negocio.`
  return `https://wa.me/${IMSOFT_WHATSAPP}?text=${encodeURIComponent(text)}`
}

/** Unsplash photo URL at a given width (the Unsplash license allows commercial use). */
export function unsplash(id: string, width: number): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`
}
