/**
 * Prospecting messages for social networks (Instagram DM, WhatsApp, LinkedIn...).
 * Same hook as the email, but in the short format read in a chat: no subject, no
 * signature, no button, and with the length each network allows without cutting.
 */
import type { SocialLink } from '@/types/database'
import { socialsOf, type Platform } from '@/lib/contact-socials'

export type Channel = 'instagram' | 'whatsapp' | 'facebook' | 'linkedin' | 'tiktok' | 'twitter'

export const CHANNELS: Channel[] = ['instagram', 'whatsapp', 'facebook', 'linkedin', 'tiktok', 'twitter']

export const CHANNEL_LABEL: Record<Channel, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  twitter: 'X (Twitter)',
}

/** Maximum length each network shows in full in a first message. */
export const CHANNEL_MAX_LENGTH: Record<Channel, number> = {
  instagram: 1000,
  whatsapp: 4096,
  facebook: 1000,
  linkedin: 1900,
  tiktok: 500,
  twitter: 1000,
}

/**
 * First-contact messages per day and per network. They're conservative caps: WhatsApp and
 * Instagram restrict accounts that write to many strangers with similar texts.
 */
export const CHANNEL_DAILY_CAP: Record<Channel, number> = {
  instagram: 15,
  whatsapp: 15,
  facebook: 15,
  linkedin: 15,
  tiktok: 10,
  twitter: 10,
}

/** "Mensaje por Instagram" (subject each send is recorded with) -> channel. */
export function channelFromSubject(subject: string | null | undefined): Channel | null {
  const m = (subject ?? '').match(/^Mensaje por (.+)$/)
  if (!m) return null
  return CHANNELS.find((c) => CHANNEL_LABEL[c] === m[1].trim()) ?? null
}

export type ChannelCounts = Record<Channel, number>

/** How many messages were recorded per channel, from their subjects. */
export function countByChannel(subjects: Array<string | null | undefined>): ChannelCounts {
  const out = Object.fromEntries(CHANNELS.map((c) => [c, 0])) as ChannelCounts
  for (const s of subjects) {
    const c = channelFromSubject(s)
    if (c) out[c] += 1
  }
  return out
}

/** Status of today's cap for a channel. */
export function capStatus(sent: number, channel: Channel): 'ok' | 'near' | 'reached' {
  const cap = CHANNEL_DAILY_CAP[channel]
  if (sent >= cap) return 'reached'
  return sent >= cap - 3 ? 'near' : 'ok'
}

/** Tag of prospects in high-income neighborhoods (set by the prospect search). */
export const PREMIUM_ZONE_TAG = 'premium-zone'

/** Tag that takes the contact out of the social queue: its data is no good to write to it. */
export const SOCIAL_DISCARDED_TAG = 'social-discarded'

/** Why a contact is discarded from the social queue; it stays in its history. */
export const SOCIAL_DISCARD_REASONS = {
  'no-whatsapp': 'El número no está en WhatsApp',
  'profile-mismatch': 'El perfil de Instagram no es del negocio',
  'corporate': 'Corporativo o franquicia: no decide local',
  'already-contacted': 'Ya se le había escrito antes',
  'other': 'Otro motivo',
} as const
export type SocialDiscardReason = keyof typeof SOCIAL_DISCARD_REASONS

/**
 * Consumer industries with returning customers: restaurants and cafes, gyms, stores.
 * Those aren't pitched Excel but their own app (orders, points, promotions), custom made.
 * The idea came from Tukafe's app, in Puerta de Hierro (2026-10-09).
 */
const APP_INDUSTRIES = ['restaurants', 'fitness', 'ecommerce', 'wholesale-market']
/** Industries that sell product by photo: their thing is an online store with their brand (2026-10-26). */
const STORE_INDUSTRIES = ['jewelry']

export type Offer = 'app' | 'store'

/**
 * Industries with their own social introduction. segmentOf (outreach.ts) only recognizes
 * those with an email template, so the introduction for gyms or agro never reached the
 * message: the segment for social is taken from here (2026-10-27).
 */
const INDUSTRIES_WITH_PITCH = ['logistics', 'fitness', 'wholesale-market', 'agro', 'jewelry', 'dental', 'health', 'hardware-stores', 'restaurants', 'automotive', 'real-estate', 'construction', 'schools', 'law-firms', 'accounting', 'ecommerce', 'corporate']

export function socialIndustry(tags: string[] | null | undefined): string | null {
  const lower = (tags ?? []).map((t) => t.toLowerCase())
  return INDUSTRIES_WITH_PITCH.find((g) => lower.some((t) => t === g || t.startsWith(`${g}-`))) ?? null
}

/** "hacemos … en Guadalajara": the one-line introduction of the first message, per industry. */
export function whatWeDo(segment?: string | null, offer?: Offer | null): string {
  const g = (segment ?? '').toLowerCase()
  if (offer === 'store') return 'tiendas en línea para joyerías'
  if (g.startsWith('wholesale-market')) return 'apps de pedidos para mayoristas'
  if (g.startsWith('fitness')) return 'apps para gimnasios'
  if (g.startsWith('restaurants')) return 'apps para restaurantes y cafeterías'
  if (offer === 'app') return 'apps y tiendas en línea para comercios'
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

const hasIndustry = (lower: string[], industries: string[]) => industries.some((g) => lower.some((t) => t === g || t.startsWith(`${g}-`)))

/** What this prospect is offered according to its tags; null = the usual message. */
export function offerOf(tags: string[] | null | undefined): Offer | null {
  const lower = (tags ?? []).map((t) => t.toLowerCase())
  // A corporate has its own IT department: its message is different even if it sells to the public.
  if (lower.some((t) => t === 'corporate' || t.startsWith('corporate-'))) return null
  if (hasIndustry(lower, STORE_INDUSTRIES)) return 'store'
  return hasIndustry(lower, APP_INDUSTRIES) ? 'app' : null
}

export interface SocialMessageVars {
  name: string
  company: string
  hook: string
  segment?: string | null
  offer?: Offer | null
}

const introLine = (segment?: string | null, offer?: Offer | null) =>
  offer === 'store'
    ? 'Soy Brandon, de imSoft. Hacemos tiendas en línea a la medida en Guadalajara para joyerías: catálogo con fotos, apartado y pago a meses, con su propia marca.'
    : offer === 'app'
    ? segment?.startsWith('fitness')
      ? 'Soy Brandon, de imSoft. Hacemos apps a la medida en Guadalajara para negocios con clientela que regresa: reservas de clases, membresías y promociones con su propia marca.'
      : segment?.startsWith('wholesale-market')
      ? 'Soy Brandon, de imSoft. Hacemos apps a la medida en Guadalajara para mayoristas: tus clientes de tienda levantan el pedido desde su celular, con su lista de precios, y tú ves qué sale a reparto.'
      : 'Soy Brandon, de imSoft. Hacemos apps a la medida en Guadalajara para negocios con clientela que regresa: pedidos, puntos y promociones con su propia marca, sin comisiones de terceros.'
    : segment?.startsWith('logistics')
    ? 'Soy Brandon, de imSoft. Hacemos software a la medida en Guadalajara y varios de nuestros clientes son del sector aduanal y logístico.'
    : segment?.startsWith('agro')
    ? 'Soy Brandon, de imSoft. Hacemos software a la medida en Guadalajara para empresas del campo y la agroindustria: lotes, pesajes y trazabilidad en un solo lugar, sin libretas ni Excel.'
    : 'Soy Brandon, de imSoft. Hacemos software a la medida en Guadalajara para negocios que ya operan bien pero cargan con procesos a mano o en Excel.'

/**
 * Text ready to paste into the channel's chat. Since 2026-10-30 the first WhatsApp and
 * Instagram message is short: the opener (observation + question, which comes in `hook`)
 * and one line about who's writing. No pitch, no call, no link: that goes in the second
 * touch. LinkedIn keeps the long format.
 */
export function renderSocialMessage(channel: Channel, v: SocialMessageVars): string {
  const greeting = v.name ? `Hola ${v.name}, ` : 'Hola, '
  const hook = v.hook.trim()
  const closing = '¿Te doy 15 minutos esta semana para platicarlo? Si no es para ustedes, te lo digo de frente y no te vuelvo a escribir.'
  const parts: string[] = []
  switch (channel) {
    case 'linkedin':
      parts.push(`${greeting}vi el perfil de ${v.company || 'tu empresa'} y te escribo directo.`, introLine(v.segment, v.offer), hook, 'Trabajamos a precio fijo y el código queda 100 % de ustedes.', closing)
      break
    default: {
      // The opener already starts with "Hola"; if an old hook comes in (without greeting), we add it.
      const opener = /^hola/i.test(hook) ? hook : `${greeting}${hook.charAt(0).toLowerCase()}${hook.slice(1)}`
      parts.push(opener, `Soy Brandon, de imSoft; hacemos ${whatWeDo(v.segment, v.offer)} en Guadalajara.`)
    }
  }
  const text = parts.filter((p) => p.trim()).join('\n\n')
  return text.length > CHANNEL_MAX_LENGTH[channel] ? text.slice(0, CHANNEL_MAX_LENGTH[channel] - 1).replace(/\s+\S*$/, '') + '…' : text
}

/** WhatsApp number in international format (52 + 10 digits) or null if it's no good. */
export function whatsAppNumber(phone: string | null | undefined): string | null {
  const d = (phone ?? '').replace(/\D/g, '')
  if (d.length === 10) return `52${d}`
  if (d.length === 12 && d.startsWith('52')) return d
  if (d.length === 13 && d.startsWith('521')) return `52${d.slice(3)}`
  return null
}

/** URL of the profile or chat to open the network with the message at hand. */
export function socialUrl(link: SocialLink): string {
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

export interface AvailableChannel {
  channel: Channel
  /** Where to open the network; WhatsApp comes with the text preloaded. */
  url: string | null
}

/**
 * Channels through which this contact can be written to, in the order they should be
 * tried. WhatsApp comes in through the phone even if it isn't among its networks.
 */
export function channelsOf(c: { social_links?: SocialLink[] | null; instagram_url?: string | null; phone?: string | null }, text = ''): AvailableChannel[] {
  const networks = socialsOf({ social_links: c.social_links ?? undefined, instagram_url: c.instagram_url ?? undefined })
  const out: AvailableChannel[] = []
  const isChannel = (p: Platform): p is Channel => (CHANNELS as string[]).includes(p)
  for (const channel of CHANNELS) {
    const network = networks.find((r) => r.platform === channel && isChannel(r.platform))
    if (channel === 'whatsapp') {
      // The WhatsApp the business publishes beats the phone, which is often a landline.
      const num = (network ? network.url.replace(/\D/g, '') || null : null) ?? whatsAppNumber(c.phone)
      if (num) out.push({ channel, url: `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ''}` })
      continue
    }
    if (network) out.push({ channel, url: socialUrl(network) })
  }
  return out
}

/** Channels written to from the queue: the ones actually handled every day. */
export const QUEUE_CHANNELS: Channel[] = ['whatsapp', 'instagram']

export interface QueueContact {
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

export interface QueueRow {
  id: string
  name: string
  company: string
  /** Queue channels through which it can be written to, in order of preference. */
  channels: Channel[]
  /** No email: social is the only way to reach it, which is why it goes first. */
  noEmail: boolean
  /** In a high-income neighborhood: moves up within its group. */
  premiumZone: boolean
  contact: QueueContact
}

/**
 * Today's social message queue: uncontacted prospects that have WhatsApp or Instagram.
 * First those without email (there's no other way), then those with WhatsApp (more people
 * reply than by DM). Within each group, premium zone ones first: a budget is more likely
 * there. Discarded ones (`social-discarded` tag) don't get in. It's pure: the page fetches
 * the contacts.
 */
export function socialQueue(contacts: QueueContact[]): QueueRow[] {
  const rows: QueueRow[] = []
  for (const c of contacts) {
    if ((c.tags ?? []).includes(SOCIAL_DISCARDED_TAG)) continue
    const available = channelsOf(c).map((x) => x.channel)
    const channels = QUEUE_CHANNELS.filter((x) => available.includes(x))
    if (!channels.length) continue
    rows.push({
      id: c.id,
      name: [c.first_name, c.last_name].filter((x) => x && x.trim()).join(' ').trim(),
      company: (c.company ?? '').trim(),
      channels,
      noEmail: !(c.email ?? '').trim(),
      premiumZone: (c.tags ?? []).includes(PREMIUM_ZONE_TAG),
      contact: c,
    })
  }
  const weight = (f: QueueRow) => (f.noEmail ? 0 : 4) + (f.channels.includes('whatsapp') ? 0 : 2) + (f.premiumZone ? 0 : 1)
  return rows.sort((a, b) => weight(a) - weight(b))
}
