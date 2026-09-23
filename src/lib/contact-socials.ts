import type { Contact, SocialLink } from '@/types/database'

export type Plataforma = SocialLink['platform']

/** Opciones del filtro "Redes sociales" de la tabla del CRM. */
export type FiltroRedes = 'all' | 'any' | 'none' | Plataforma

export const PLATAFORMAS: Plataforma[] = ['instagram', 'facebook', 'linkedin', 'tiktok', 'whatsapp', 'twitter', 'youtube', 'website']

export const ETIQUETA_PLATAFORMA: Record<Plataforma, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  whatsapp: 'WhatsApp',
  twitter: 'X (Twitter)',
  youtube: 'YouTube',
  website: 'Sitio web',
}

/**
 * Redes del contacto: la lista `social_links` mas el campo suelto `instagram_url`
 * (lo que importan el CSV y el buscador de prospectos), sin repetir Instagram.
 */
export function redesDe(c: Pick<Contact, 'social_links' | 'instagram_url'>): SocialLink[] {
  const redes = (Array.isArray(c.social_links) ? c.social_links : []).filter((s) => s && s.url && s.url.trim())
  const ig = c.instagram_url?.trim()
  if (ig && !redes.some((s) => s.platform === 'instagram')) redes.push({ platform: 'instagram', url: ig })
  return redes
}

/** Decide si el contacto pasa el filtro de redes elegido en la tabla. */
export function pasaFiltroRedes(c: Pick<Contact, 'social_links' | 'instagram_url'>, filtro: FiltroRedes | '' | undefined): boolean {
  if (!filtro || filtro === 'all') return true
  const redes = redesDe(c)
  if (filtro === 'any') return redes.length > 0
  if (filtro === 'none') return redes.length === 0
  return redes.some((s) => s.platform === filtro)
}

/**
 * Formas de contactar a alguien: correo, red social o telefono (que da WhatsApp).
 * Un prospecto sin ninguna no sirve en el CRM: no hay por donde escribirle.
 */
export function formasDeContacto(c: Pick<Contact, 'social_links' | 'instagram_url'> & { email?: string | null; phone?: string | null }): Array<'correo' | 'red' | 'telefono'> {
  const out: Array<'correo' | 'red' | 'telefono'> = []
  if ((c.email ?? '').trim()) out.push('correo')
  if (redesDe(c).length) out.push('red')
  if ((c.phone ?? '').replace(/\D/g, '').length >= 10) out.push('telefono')
  return out
}

export const AVISO_SIN_CONTACTO = 'Agrega al menos un correo, una red social o un teléfono: sin eso no hay por dónde escribirle.'
