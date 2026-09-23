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
