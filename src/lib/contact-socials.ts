import type { Contact, SocialLink } from '@/types/database'

export type Platform = SocialLink['platform']

/** Opciones del filtro "Redes sociales" de la tabla del CRM. */
export type SocialFilter = 'all' | 'any' | 'none' | Platform

export const PLATFORMS: Platform[] = ['instagram', 'facebook', 'linkedin', 'tiktok', 'whatsapp', 'twitter', 'youtube', 'website']

export const PLATFORM_LABEL: Record<Platform, string> = {
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
export function socialsOf(c: Pick<Contact, 'social_links' | 'instagram_url'>): SocialLink[] {
  const socials = (Array.isArray(c.social_links) ? c.social_links : []).filter((s) => s && s.url && s.url.trim())
  const ig = c.instagram_url?.trim()
  if (ig && !socials.some((s) => s.platform === 'instagram')) socials.push({ platform: 'instagram', url: ig })
  return socials
}

/** Decide si el contacto pasa el filtro de redes elegido en la tabla. */
export function matchesSocialFilter(c: Pick<Contact, 'social_links' | 'instagram_url'>, filter: SocialFilter | '' | undefined): boolean {
  if (!filter || filter === 'all') return true
  const socials = socialsOf(c)
  if (filter === 'any') return socials.length > 0
  if (filter === 'none') return socials.length === 0
  return socials.some((s) => s.platform === filter)
}

/**
 * Formas de contactar a alguien: correo, red social o telefono (que da WhatsApp).
 * Un prospecto sin ninguna no sirve en el CRM: no hay por donde escribirle.
 */
export function contactMethods(c: Pick<Contact, 'social_links' | 'instagram_url'> & { email?: string | null; phone?: string | null }): Array<'email' | 'social' | 'phone'> {
  const out: Array<'email' | 'social' | 'phone'> = []
  if ((c.email ?? '').trim()) out.push('email')
  if (socialsOf(c).length) out.push('social')
  if ((c.phone ?? '').replace(/\D/g, '').length >= 10) out.push('phone')
  return out
}

export const NO_CONTACT_WARNING = 'Agrega al menos un correo, una red social o un teléfono: sin eso no hay por dónde escribirle.'
