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
export const TAG_ZONA_PREMIUM = 'zona-premium'

/**
 * Giros de consumo con clientela que regresa: restaurantes y cafes, gimnasios, tiendas.
 * A esos no se les habla de Excel sino de su propia app (pedidos, puntos, promociones),
 * hecha a la medida. La idea salio de la app de Tukafe, en Puerta de Hierro (2026-10-09).
 */
const GIROS_APP = ['restaurantes', 'fitness', 'ecommerce']

export type Oferta = 'app'

/** Que se le ofrece a este prospecto segun sus etiquetas; null = el mensaje de siempre. */
export function ofertaDe(tags: string[] | null | undefined): Oferta | null {
  const lower = (tags ?? []).map((t) => t.toLowerCase())
  // Un corporativo tiene area de sistemas: su mensaje es otro aunque venda al publico.
  if (lower.some((t) => t === 'corporativo' || t.startsWith('corporativo-'))) return null
  return GIROS_APP.some((g) => lower.some((t) => t === g || t.startsWith(`${g}-`))) ? 'app' : null
}

export interface MensajeVars {
  nombre: string
  empresa: string
  gancho: string
  segmento?: string | null
  oferta?: Oferta | null
}

const presentacion = (segmento?: string | null, oferta?: Oferta | null) =>
  oferta === 'app'
    ? 'Soy Brandon, de imSoft. Hacemos apps a la medida en Guadalajara para negocios con clientela que regresa: pedidos, puntos y promociones con su propia marca, sin comisiones de terceros.'
    : segmento?.startsWith('logistica')
    ? 'Soy Brandon, de imSoft. Hacemos software a la medida en Guadalajara y varios de nuestros clientes son del sector aduanal y logístico.'
    : 'Soy Brandon, de imSoft. Hacemos software a la medida en Guadalajara para negocios que ya operan bien pero cargan con procesos a mano o en Excel.'

/** Texto listo para pegar en el chat del canal. */
export function renderMensajeRed(canal: Canal, v: MensajeVars): string {
  const saludo = v.nombre ? `Hola ${v.nombre}, ` : 'Hola, '
  const gancho = v.gancho.trim()
  const cierre = '¿Te doy 15 minutos esta semana para platicarlo? Si no es para ustedes, te lo digo de frente y no te vuelvo a escribir.'
  const partes: string[] = []
  switch (canal) {
    case 'linkedin':
      partes.push(`${saludo}vi el perfil de ${v.empresa || 'tu empresa'} y te escribo directo.`, presentacion(v.segmento, v.oferta), gancho, 'Trabajamos a precio fijo y el código queda 100 % de ustedes.', cierre)
      break
    case 'whatsapp':
      partes.push(`${saludo}${presentacion(v.segmento, v.oferta).replace(/^Soy/, 'soy')}`, gancho, cierre)
      break
    default:
      // Instagram, Facebook, TikTok y X: un DM corto; el detalle va en la llamada.
      partes.push(`${saludo}${presentacion(v.segmento, v.oferta).replace(/^Soy/, 'soy')}`, gancho, '¿Te doy 15 minutos esta semana para platicarlo? Si no es para ustedes, te lo digo de frente.')
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
 * premium: ahi es mas probable que haya presupuesto. Es puro: la pagina trae los contactos.
 */
export function colaDeRedes(contactos: ContactoDeCola[]): FilaCola[] {
  const filas: FilaCola[] = []
  for (const c of contactos) {
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
