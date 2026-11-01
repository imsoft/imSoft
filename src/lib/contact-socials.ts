import type { Contact, SocialLink } from '@/types/database'

export type Platform = SocialLink['platform']

/** Options of the "Redes sociales" filter in the CRM table. */
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
 * Socials of the contact: the `social_links` list plus the loose `instagram_url` field
 * (what the CSV import and the prospect search fill in), without repeating Instagram.
 */
export function socialsOf(c: Pick<Contact, 'social_links' | 'instagram_url'>): SocialLink[] {
  const socials = (Array.isArray(c.social_links) ? c.social_links : []).filter((s) => s && s.url && s.url.trim())
  const ig = c.instagram_url?.trim()
  if (ig && !socials.some((s) => s.platform === 'instagram')) socials.push({ platform: 'instagram', url: ig })
  return socials
}

/** Whether the contact passes the socials filter picked in the table. */
export function matchesSocialFilter(c: Pick<Contact, 'social_links' | 'instagram_url'>, filter: SocialFilter | '' | undefined): boolean {
  if (!filter || filter === 'all') return true
  const socials = socialsOf(c)
  if (filter === 'any') return socials.length > 0
  if (filter === 'none') return socials.length === 0
  return socials.some((s) => s.platform === filter)
}

/**
 * Ways to reach someone: email, social network or phone (which gives WhatsApp).
 * A prospect with none is useless in the CRM: there's no way to write to them.
 */
export function contactMethods(c: Pick<Contact, 'social_links' | 'instagram_url'> & { email?: string | null; phone?: string | null }): Array<'email' | 'social' | 'phone'> {
  const out: Array<'email' | 'social' | 'phone'> = []
  if ((c.email ?? '').trim()) out.push('email')
  if (socialsOf(c).length) out.push('social')
  if ((c.phone ?? '').replace(/\D/g, '').length >= 10) out.push('phone')
  return out
}

export const NO_CONTACT_WARNING = 'Agrega al menos un correo, una red social o un teléfono: sin eso no hay por dónde escribirle.'
