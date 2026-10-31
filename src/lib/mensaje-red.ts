/**
 * Mensajes de prospeccion para redes sociales (DM de Instagram, WhatsApp, LinkedIn...).
 * Mismo gancho que el correo, pero en el formato corto que se lee en un chat: sin asunto,
 * sin firma, sin boton, y con el largo que cada red permite sin cortar.
 */
import type { SocialLink } from '@/types/database'
import { redesDe, type Plataforma } from '@/lib/contact-socials'

export type Canal = 'instagram' | 'whatsapp' | 'facebook' | 'linkedin' | 'tiktok' | 'twitter'

export const CANALES: Canal[] = ['instagram', 'whatsapp', 'facebook', 'linkedin', 'tiktok', 'twitter']

export const ETIQUETA_CANAL: Record<Canal, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  twitter: 'X (Twitter)',
}

/** Largo maximo que cada red muestra completo en un primer mensaje. */
export const TOPE_CANAL: Record<Canal, number> = {
  instagram: 1000,
  whatsapp: 4096,
  facebook: 1000,
  linkedin: 1900,
  tiktok: 500,
  twitter: 1000,
}

/**
 * Mensajes de primer contacto por dia y por red. Son topes conservadores: WhatsApp e
 * Instagram restringen cuentas que escriben a muchos desconocidos con textos parecidos.
 */
export const TOPE_DIARIO_CANAL: Record<Canal, number> = {
  instagram: 15,
  whatsapp: 15,
  facebook: 15,
  linkedin: 15,
  tiktok: 10,
  twitter: 10,
}

/** "Mensaje por Instagram" (asunto con que se registra cada envio) -> canal. */
export function canalDeAsunto(subject: string | null | undefined): Canal | null {
  const m = (subject ?? '').match(/^Mensaje por (.+)$/)
  if (!m) return null
  return CANALES.find((c) => ETIQUETA_CANAL[c] === m[1].trim()) ?? null
}

export type ConteoPorCanal = Record<Canal, number>

/** Cuantos mensajes se registraron por canal a partir de sus asuntos. */
export function conteoPorCanal(asuntos: Array<string | null | undefined>): ConteoPorCanal {
  const out = Object.fromEntries(CANALES.map((c) => [c, 0])) as ConteoPorCanal
  for (const a of asuntos) {
    const c = canalDeAsunto(a)
    if (c) out[c] += 1
  }
  return out
}

/** Estado del tope de hoy para un canal. */
export function estadoDelTope(enviados: number, canal: Canal): 'bien' | 'cerca' | 'tope' {
  const tope = TOPE_DIARIO_CANAL[canal]
  if (enviados >= tope) return 'tope'
  return enviados >= tope - 3 ? 'cerca' : 'bien'
}

/** Etiqueta de los prospectos en colonias de alto poder adquisitivo (la pone el buscador). */
export const TAG_ZONA_PREMIUM = 'premium-zone'

/** Etiqueta que saca al contacto de la cola de redes: sus datos no sirven para escribirle. */
export const TAG_REDES_DESCARTADO = 'social-discarded'

/** Por que se descarta un contacto de la cola de redes; queda en su historial. */
export const MOTIVOS_DESCARTE_REDES = {
  'no-whatsapp': 'El número no está en WhatsApp',
  'profile-mismatch': 'El perfil de Instagram no es del negocio',
  'corporate': 'Corporativo o franquicia: no decide local',
  'already-contacted': 'Ya se le había escrito antes',
  'other': 'Otro motivo',
} as const
export type MotivoDescarteRedes = keyof typeof MOTIVOS_DESCARTE_REDES

/**
 * Giros de consumo con clientela que regresa: restaurantes y cafes, gimnasios, tiendas.
 * A esos no se les habla de Excel sino de su propia app (pedidos, puntos, promociones),
 * hecha a la medida. La idea salio de la app de Tukafe, en Puerta de Hierro (2026-10-09).
 */
const GIROS_APP = ['restaurants', 'fitness', 'ecommerce', 'wholesale-market']
/** Giros que venden producto con foto: lo suyo es una tienda en linea con su marca (2026-10-26). */
const GIROS_TIENDA = ['jewelry']

export type Oferta = 'app' | 'store'

/**
 * Giros con presentacion propia en redes. segmentoDe (outreach.ts) solo reconoce los
 * que tienen plantilla de correo, y por eso la presentacion de gimnasios o agro nunca
 * llegaba al mensaje: el segmento para redes se saca de aqui (2026-10-27).
 */
const GIROS_CON_PRESENTACION = ['logistics', 'fitness', 'wholesale-market', 'agro', 'jewelry', 'dental', 'health', 'hardware-stores', 'restaurants', 'automotive', 'real-estate', 'construction', 'schools', 'law-firms', 'accounting', 'ecommerce', 'corporate']

export function giroDeRedes(tags: string[] | null | undefined): string | null {
  const lower = (tags ?? []).map((t) => t.toLowerCase())
  return GIROS_CON_PRESENTACION.find((g) => lower.some((t) => t === g || t.startsWith(`${g}-`))) ?? null
}

/** "hacemos … en Guadalajara": la presentacion de una linea del primer mensaje, por giro. */
export function queHacemos(segmento?: string | null, oferta?: Oferta | null): string {
  const g = (segmento ?? '').toLowerCase()
  if (oferta === 'store') return 'tiendas en línea para joyerías'
  if (g.startsWith('wholesale-market')) return 'apps de pedidos para mayoristas'
  if (g.startsWith('fitness')) return 'apps para gimnasios'
  if (g.startsWith('restaurants')) return 'apps para restaurantes y cafeterías'
  if (oferta === 'app') return 'apps y tiendas en línea para comercios'
  if (g.startsWith('dental')) return 'software para consultorios dentales'
  if (g.startsWith('health')) return 'software para clínicas y consultorios'
  if (g.startsWith('hardware-stores')) return 'software para ferreterías y distribuidoras'
  if (g.startsWith('automotive')) return 'software para talleres y refaccionarias'
  if (g.startsWith('real-estate')) return 'software para inmobiliarias'
  if (g.startsWith('construction')) return 'software para constructoras'
  if (g.startsWith('logistics')) return 'software para agencias aduanales y logística'
  if (g.startsWith('agro')) return 'software para el campo y la agroindustria'
  if (g.startsWith('schools')) return 'software para colegios'
  if (g.startsWith('law-firms')) return 'software para despachos jurídicos'
  if (g.startsWith('accounting')) return 'software para despachos contables'
  return 'software a la medida para negocios'
}

const tieneGiro = (lower: string[], giros: string[]) => giros.some((g) => lower.some((t) => t === g || t.startsWith(`${g}-`)))

/** Que se le ofrece a este prospecto segun sus etiquetas; null = el mensaje de siempre. */
export function ofertaDe(tags: string[] | null | undefined): Oferta | null {
  const lower = (tags ?? []).map((t) => t.toLowerCase())
  // Un corporativo tiene area de sistemas: su mensaje es otro aunque venda al publico.
  if (lower.some((t) => t === 'corporate' || t.startsWith('corporate-'))) return null
  if (tieneGiro(lower, GIROS_TIENDA)) return 'store'
  return tieneGiro(lower, GIROS_APP) ? 'app' : null
}

export interface MensajeVars {
  nombre: string
  empresa: string
  gancho: string
  segmento?: string | null
  oferta?: Oferta | null
}

const presentacion = (segmento?: string | null, oferta?: Oferta | null) =>
  oferta === 'store'
    ? 'Soy Brandon, de imSoft. Hacemos tiendas en línea a la medida en Guadalajara para joyerías: catálogo con fotos, apartado y pago a meses, con su propia marca.'
    : oferta === 'app'
    ? segmento?.startsWith('fitness')
      ? 'Soy Brandon, de imSoft. Hacemos apps a la medida en Guadalajara para negocios con clientela que regresa: reservas de clases, membresías y promociones con su propia marca.'
      : segmento?.startsWith('wholesale-market')
      ? 'Soy Brandon, de imSoft. Hacemos apps a la medida en Guadalajara para mayoristas: tus clientes de tienda levantan el pedido desde su celular, con su lista de precios, y tú ves qué sale a reparto.'
      : 'Soy Brandon, de imSoft. Hacemos apps a la medida en Guadalajara para negocios con clientela que regresa: pedidos, puntos y promociones con su propia marca, sin comisiones de terceros.'
    : segmento?.startsWith('logistics')
    ? 'Soy Brandon, de imSoft. Hacemos software a la medida en Guadalajara y varios de nuestros clientes son del sector aduanal y logístico.'
    : segmento?.startsWith('agro')
    ? 'Soy Brandon, de imSoft. Hacemos software a la medida en Guadalajara para empresas del campo y la agroindustria: lotes, pesajes y trazabilidad en un solo lugar, sin libretas ni Excel.'
    : 'Soy Brandon, de imSoft. Hacemos software a la medida en Guadalajara para negocios que ya operan bien pero cargan con procesos a mano o en Excel.'

/**
 * Texto listo para pegar en el chat del canal. Desde el 30-oct-2026 el primer mensaje de
 * WhatsApp e Instagram es corto: la apertura (observacion + pregunta, que viene en
 * `gancho`) y una linea de quien escribe. Sin pitch, sin llamada, sin enlace: eso va en
 * el segundo toque. LinkedIn conserva el formato largo.
 */
export function renderMensajeRed(canal: Canal, v: MensajeVars): string {
  const saludo = v.nombre ? `Hola ${v.nombre}, ` : 'Hola, '
  const gancho = v.gancho.trim()
  const cierre = '¿Te doy 15 minutos esta semana para platicarlo? Si no es para ustedes, te lo digo de frente y no te vuelvo a escribir.'
  const partes: string[] = []
  switch (canal) {
    case 'linkedin':
      partes.push(`${saludo}vi el perfil de ${v.empresa || 'tu empresa'} y te escribo directo.`, presentacion(v.segmento, v.oferta), gancho, 'Trabajamos a precio fijo y el código queda 100 % de ustedes.', cierre)
      break
    default: {
      // La apertura ya empieza con "Hola"; si viene un gancho viejo (sin saludo), se lo ponemos.
      const apertura = /^hola/i.test(gancho) ? gancho : `${saludo}${gancho.charAt(0).toLowerCase()}${gancho.slice(1)}`
      partes.push(apertura, `Soy Brandon, de imSoft; hacemos ${queHacemos(v.segmento, v.oferta)} en Guadalajara.`)
    }
  }
  const texto = partes.filter((p) => p.trim()).join('\n\n')
  return texto.length > TOPE_CANAL[canal] ? texto.slice(0, TOPE_CANAL[canal] - 1).replace(/\s+\S*$/, '') + '…' : texto
}

/** Numero de WhatsApp en formato internacional (52 + 10 digitos) o null si no sirve. */
export function numeroWhatsApp(phone: string | null | undefined): string | null {
  const d = (phone ?? '').replace(/\D/g, '')
  if (d.length === 10) return `52${d}`
  if (d.length === 12 && d.startsWith('52')) return d
  if (d.length === 13 && d.startsWith('521')) return `52${d.slice(3)}`
  return null
}

/** URL del perfil o chat para abrir la red con el mensaje a la mano. */
export function urlDeRed(link: SocialLink): string {
  const u = link.url.trim().replace(/^@/, '')
  if (/^https?:\/\//.test(u)) return u
  switch (link.platform) {
    case 'instagram': return `https://instagram.com/${u}`
    case 'tiktok': return `https://tiktok.com/@${u}`
    case 'linkedin': return `https://linkedin.com/in/${u}`
    case 'facebook': return `https://facebook.com/${u}`
    case 'twitter': return `https://x.com/${u}`
    case 'youtube': return `https://youtube.com/@${u}`
    case 'whatsapp': return `https://wa.me/${u.replace(/\D/g, '')}`
    default: return `https://${u}`
  }
}

export interface CanalDisponible {
  canal: Canal
  /** Donde abrir la red; WhatsApp lleva el texto precargado. */
  url: string | null
}

/**
 * Canales por los que se le puede escribir a este contacto, en el orden en que conviene
 * intentarlos. WhatsApp entra por el telefono aunque no este en sus redes.
 */
export function canalesDe(c: { social_links?: SocialLink[] | null; instagram_url?: string | null; phone?: string | null }, texto = ''): CanalDisponible[] {
  const redes = redesDe({ social_links: c.social_links ?? undefined, instagram_url: c.instagram_url ?? undefined })
  const out: CanalDisponible[] = []
  const esCanal = (p: Plataforma): p is Canal => (CANALES as string[]).includes(p)
  for (const canal of CANALES) {
    const red = redes.find((r) => r.platform === canal && esCanal(r.platform))
    if (canal === 'whatsapp') {
      // El WhatsApp que el negocio publica gana al telefono, que muchas veces es fijo.
      const num = (red ? red.url.replace(/\D/g, '') || null : null) ?? numeroWhatsApp(c.phone)
      if (num) out.push({ canal, url: `https://wa.me/${num}${texto ? `?text=${encodeURIComponent(texto)}` : ''}` })
      continue
    }
    if (red) out.push({ canal, url: urlDeRed(red) })
  }
  return out
}

/** Canales en los que se escribe desde la cola: los que de verdad se atienden a diario. */
export const CANALES_COLA: Canal[] = ['whatsapp', 'instagram']

export interface ContactoDeCola {
  id: string
  first_name?: string | null
  last_name?: string | null
  company?: string | null
  email?: string | null
  phone?: string | null
  instagram_url?: string | null
  social_links?: SocialLink[] | null
  tags?: string[] | null
}

export interface FilaCola {
  id: string
  nombre: string
  empresa: string
  /** Canales de la cola por los que se le puede escribir, en orden de preferencia. */
  canales: Canal[]
  /** Sin correo: redes es la unica forma de llegarle, por eso va primero. */
  sinCorreo: boolean
  /** En una colonia de alto poder adquisitivo: sube dentro de su grupo. */
  zonaPremium: boolean
  contacto: ContactoDeCola
}

/**
 * Cola de mensajes por redes para hoy: prospectos sin contactar que tienen WhatsApp o
 * Instagram. Primero los que no tienen correo (no hay otro camino), luego los que tienen
 * WhatsApp (contesta mas gente que por DM). Dentro de cada grupo, primero los de zona
 * premium: ahi es mas probable que haya presupuesto. Los descartados (etiqueta
 * `social-discarded`) no entran. Es puro: la pagina trae los contactos.
 */
export function colaDeRedes(contactos: ContactoDeCola[]): FilaCola[] {
  const filas: FilaCola[] = []
  for (const c of contactos) {
    if ((c.tags ?? []).includes(TAG_REDES_DESCARTADO)) continue
    const disponibles = canalesDe(c).map((x) => x.canal)
    const canales = CANALES_COLA.filter((x) => disponibles.includes(x))
    if (!canales.length) continue
    filas.push({
      id: c.id,
      nombre: [c.first_name, c.last_name].filter((x) => x && x.trim()).join(' ').trim(),
      empresa: (c.company ?? '').trim(),
      canales,
      sinCorreo: !(c.email ?? '').trim(),
      zonaPremium: (c.tags ?? []).includes(TAG_ZONA_PREMIUM),
      contacto: c,
    })
  }
  const peso = (f: FilaCola) => (f.sinCorreo ? 0 : 4) + (f.canales.includes('whatsapp') ? 0 : 2) + (f.zonaPremium ? 0 : 1)
  return filas.sort((a, b) => peso(a) - peso(b))
}
