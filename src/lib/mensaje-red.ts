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

export interface MensajeVars {
  nombre: string
  empresa: string
  gancho: string
  segmento?: string | null
}

const presentacion = (segmento?: string | null) =>
  segmento?.startsWith('logistica')
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
      partes.push(`${saludo}vi el perfil de ${v.empresa || 'tu empresa'} y te escribo directo.`, presentacion(v.segmento), gancho, 'Trabajamos a precio fijo y el código queda 100 % de ustedes.', cierre)
      break
    case 'whatsapp':
      partes.push(`${saludo}${presentacion(v.segmento).replace(/^Soy/, 'soy')}`, gancho, cierre)
      break
    default:
      // Instagram, Facebook, TikTok y X: un DM corto; el detalle va en la llamada.
      partes.push(`${saludo}${presentacion(v.segmento).replace(/^Soy/, 'soy')}`, gancho, '¿Te doy 15 minutos esta semana para platicarlo? Si no es para ustedes, te lo digo de frente.')
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
      const num = numeroWhatsApp(c.phone) ?? (red ? red.url.replace(/\D/g, '') : null)
      if (num) out.push({ canal, url: `https://wa.me/${num}${texto ? `?text=${encodeURIComponent(texto)}` : ''}` })
      continue
    }
    if (red) out.push({ canal, url: urlDeRed(red) })
  }
  return out
}
