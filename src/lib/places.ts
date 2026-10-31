/**
 * Prospect search with Google Places: pure logic (no network), tested with vitest.
 * The I/O (Places API, website crawling, Supabase) lives in src/lib/places-server.ts.
 */
import type { CsvRow } from './import-contacts.ts'
import { isNonSalesMailbox } from './invalid-email.ts'

/** Municipalities of the Guadalajara metro area with their approximate center. */
export const MUNICIPALITIES: Record<string, { name: string; lat: number; lng: number; radius: number }> = {
  guadalajara: { name: 'Guadalajara', lat: 20.6736, lng: -103.344, radius: 9000 },
  zapopan: { name: 'Zapopan', lat: 20.7214, lng: -103.3908, radius: 12000 },
  tlaquepaque: { name: 'San Pedro Tlaquepaque', lat: 20.6402, lng: -103.3117, radius: 8000 },
  tonala: { name: 'Tonalá', lat: 20.6247, lng: -103.2342, radius: 8000 },
  tlajomulco: { name: 'Tlajomulco de Zúñiga', lat: 20.4738, lng: -103.4433, radius: 12000 },
  elsalto: { name: 'El Salto', lat: 20.5199, lng: -103.1808, radius: 8000 },
  zmg: { name: 'Zona metropolitana de Guadalajara', lat: 20.6597, lng: -103.3496, radius: 30000 },
  // Los Altos: national capital of eggs and pork; 80 km away, but its farms and packers aren't in the metro area.
  tepatitlan: { name: 'Tepatitlán de Morelos', lat: 20.8167, lng: -102.7667, radius: 25000 },
}

/** Industries that tend to buy custom software, with the query that works best in Places. */
export const INDUSTRIES: { key: string; name: string; query: string; segment: string }[] = [
  { key: 'wholesale-market', name: 'Mercado de Abastos y mayoristas', query: 'distribuidora mayorista abarrotes frutas verduras Mercado de Abastos', segment: 'wholesale-market' },
  // Mercado de Abastos warehouses by product type; Places doesn't return them with the general query.
  { key: 'wholesalers', name: 'Bodegas mayoristas (cárnicos, lácteos, desechables)', query: 'distribuidora mayorista cárnicos lácteos desechables', segment: 'wholesale-market' },
  { key: 'logistics', name: 'Logística y agencias aduanales', query: 'agencia aduanal empresa de logística transporte de carga', segment: 'logistics' },
  { key: 'law-firms', name: 'Despachos de abogados', query: 'despacho de abogados bufete jurídico', segment: 'law-firms' },
  { key: 'accounting', name: 'Despachos contables', query: 'despacho contable contadores públicos', segment: 'accounting' },
  { key: 'health', name: 'Hospitales y clínicas', query: 'hospital privado clínica de especialidades', segment: 'health' },
  { key: 'dental', name: 'Clínicas dentales', query: 'clínica dental', segment: 'health' },
  { key: 'restaurants', name: 'Restaurantes', query: 'restaurante', segment: 'restaurants' },
  { key: 'ecommerce', name: 'Tiendas y boutiques (ecommerce)', query: 'boutique tienda de ropa calzado', segment: 'ecommerce' },
  // Concentrated in Centro Joyero and San Juan de Dios; their offer is an online store, not an app.
  { key: 'jewelry', name: 'Joyerías y centros joyeros', query: 'joyería centro joyero', segment: 'jewelry' },
  { key: 'construction', name: 'Constructoras', query: 'empresa constructora', segment: 'construction' },
  // Agro: offices, distributors and packers are in the metro area; the farms, in Los Altos.
  { key: 'agro', name: 'Agroindustria, empacadoras y distribuidoras agrícolas', query: 'empacadora comercializadora agrícola distribuidora agroquímicos semillas forrajes', segment: 'agro' },
  { key: 'farms', name: 'Granjas avícolas y porcícolas', query: 'granja avícola huevo', segment: 'agro' },
  { key: 'hardware-stores', name: 'Ferreterías y distribuidores industriales', query: 'ferretería industrial distribuidor', segment: 'hardware-stores' },
  { key: 'real-estate', name: 'Inmobiliarias', query: 'inmobiliaria bienes raíces', segment: 'real-estate' },
  { key: 'fitness', name: 'Gimnasios', query: 'gimnasio', segment: 'fitness' },
  { key: 'schools', name: 'Escuelas privadas', query: 'colegio privado escuela particular', segment: 'schools' },
  { key: 'auto-repair-shops', name: 'Talleres y refaccionarias', query: 'taller mecánico refaccionaria', segment: 'automotive' },
  { key: 'aesthetic-clinics', name: 'Clínicas de estética y spa', query: 'clínica de estética spa', segment: 'health' },
  // To look up large companies by name ("Grupo Dalton") with the custom search.
  { key: 'corporate', name: 'Empresas grandes y corporativos', query: 'corporativo oficinas corporativas', segment: 'corporate' },
]

/** Businesses that show up in searches but don't buy custom software (notaries, free legal aid, government offices). */
const OFF_PROFILE_NAMES = /\b(notar[ií]a|notario|bufete jur[ií]dico gratuito|defensor[ií]a|procuradur[ií]a|juzgado|tribunal|iteso|universidad|udg|imss|issste|secretar[ií]a de)\b/i

export function isOffProfile(name: string): boolean {
  return OFF_PROFILE_NAMES.test(name)
}

export function industryByKey(key: string) {
  return INDUSTRIES.find((g) => g.key === key) ?? null
}

/** What Places returns (the fields we request in the FieldMask). */
export interface PlaceResult {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  websiteUri?: string
  nationalPhoneNumber?: string
  rating?: number
  userRatingCount?: number
  primaryTypeDisplayName?: { text: string }
  googleMapsUri?: string
}

export interface Candidate {
  placeId: string
  name: string
  address: string
  phone: string | null
  website: string | null
  domain: string | null
  rating: number | null
  reviews: number
  type: string | null
  mapsUrl: string | null
  /** Already in the CRM (by domain, phone or name). */
  inCrm: boolean
  email?: string | null
  instagram?: string | null
  /** Number from the WhatsApp link the business publishes on its website (52 + 10 digits). */
  whatsapp?: string | null
  /** Facebook page found by web search (source of phone and email, not a channel). */
  facebook?: string | null
  /** Executive found on LinkedIn (corporate only). */
  contact?: LinkedInContact | null
}

/**
 * Out of what Google returns when searching a company by name, only what really is that
 * company: "Farmacias Guadalajara" also brings nearby pharmacies. One per brand.
 */
export function matchingBrand<T extends { name: string }>(candidates: T[], key: string): T[] {
  const k = normalizedName(key)
  const hit = candidates.find((c) => normalizedName(c.name).includes(k))
  return hit ? [hit] : []
}

/** Weekdays the prospect search runs (0 = Sunday): Monday, Wednesday and Friday. */
export const RUN_DAYS = [1, 3, 5]

/**
 * Today's run number: how many Mondays, Wednesdays and Fridays have passed since
 * 2026-09-21. Lets each run take the next slice of the list without storing state; a
 * manual run on the same day repeats the slice, which is what we want.
 */
export function runNumber(date = new Date(), days = RUN_DAYS): number {
  const start = Date.UTC(2026, 8, 21)
  const today = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  let n = 0
  for (let t = start; t <= today; t += 86_400_000) if (days.includes(new Date(t).getUTCDay())) n++
  return n
}

/** Slice of the list for the given run; the whole list is covered in ceil(list/perRun) runs. */
export function searchSlice<T>(list: T[], run: number, perRun: number): T[] {
  if (!list.length || perRun <= 0) return []
  const n = Math.min(perRun, list.length)
  const start = (((run * n) % list.length) + list.length) % list.length
  return Array.from({ length: n }, (_, i) => list[(start + i) % list.length])
}

/**
 * Google's phone as a possible WhatsApp (52 + 10 digits). In Mexico a landline can't be
 * told from a mobile by the number, so many won't have WhatsApp: the social batch detects
 * them when sending and discards them. 800/900 numbers are never WhatsApp.
 */
export function phoneAsWhatsApp(phone: string | null | undefined): string | null {
  let d = (phone ?? '').replace(/\D/g, '')
  if (d.length === 13 && d.startsWith('521')) d = d.slice(3)
  else if (d.length === 12 && d.startsWith('52')) d = d.slice(2)
  if (d.length !== 10) return null
  if (/^(800|900|01)/.test(d)) return null
  if (/^(\d)\1+$/.test(d) || d === '1234567890') return null
  return `52${d}`
}

/**
 * A candidate enters the CRM if there's a way to write to it: email, Instagram, the
 * WhatsApp it publishes on its website or its Google phone. The phone alone used not to be
 * enough (2026-09-23), but then only 10 of 214 new businesses got in per run: almost none
 * publish contact info on their site. Since 2026-10-26 the phone counts (Brandon's
 * decision) and the WhatsApp batch discards landlines when sending.
 */
export function isReachable(c: Pick<Candidate, 'email' | 'instagram' | 'whatsapp'> & { phone?: string | null }): boolean {
  return Boolean((c.email ?? '').trim() || (c.instagram ?? '').trim() || (c.whatsapp ?? '').trim() || phoneAsWhatsApp(c.phone))
}

const GENERIC_DOMAINS = ['facebook.com', 'instagram.com', 'wa.me', 'whatsapp.com', 'linktr.ee', 'google.com', 'goo.gl', 'business.site', 'negocio.site', 'tiktok.com', 'youtube.com', 'x.com', 'twitter.com']

/** Domain without www or path; null for social networks and Google profiles. */
export function domainOf(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const h = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.toLowerCase().replace(/^www\./, '')
    if (!h.includes('.') || GENERIC_DOMAINS.some((g) => h === g || h.endsWith(`.${g}`))) return null
    return h
  } catch {
    return null
  }
}

export function digitsOnly(phone: string | null | undefined): string {
  const d = (phone ?? '').replace(/\D/g, '')
  return d.length > 10 ? d.slice(-10) : d
}

/** Phone as the CRM stores it: "33 1234 5678". */
export function formatPhone(phone: string | null | undefined): string | null {
  const d = digitsOnly(phone)
  if (d.length !== 10) return phone?.trim() || null
  return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`
}

export function normalizedName(s: string | null | undefined): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(s a de c v|s a|s de r l( de c v)?|s c|de c v|c v|sapi de cv|sa de cv)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Clean name: without taglines after "|", "(Sucursal ...)" or emojis. */
export function cleanName(s: string | null | undefined): string {
  return (s ?? '')
    .split('|')[0]
    .replace(/\((sucursal|suc\.?|matriz|plaza|local)[^)]*\)/gi, '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/,\s*(la|el)\s+(constructora|despacho|clínica|clinica|inmobiliaria)\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .replace(/[\s\-–—·,]+$/, '')
    .trim()
}

export function candidateFrom(p: PlaceResult): Candidate {
  const website = p.websiteUri ?? null
  return {
    placeId: p.id,
    name: cleanName(p.displayName?.text),
    address: p.formattedAddress ?? '',
    phone: formatPhone(p.nationalPhoneNumber),
    website,
    domain: domainOf(website),
    rating: p.rating ?? null,
    reviews: p.userRatingCount ?? 0,
    type: p.primaryTypeDisplayName?.text ?? null,
    mapsUrl: p.googleMapsUri ?? null,
    inCrm: false,
  }
}

export interface ExistingContact {
  company: string | null
  website_url: string | null
  phone: string | null
  email: string | null
}

/** Marks the candidates that are already in the CRM: same domain, same phone or same name. */
export function markExisting(candidates: Candidate[], existing: ExistingContact[]): Candidate[] {
  const domains = new Set(existing.map((e) => domainOf(e.website_url) ?? domainOf(e.email ? `https://${e.email.split('@')[1]}` : null)).filter(Boolean))
  const phones = new Set(existing.map((e) => digitsOnly(e.phone)).filter((d) => d.length === 10))
  const names = new Set(existing.map((e) => normalizedName(e.company)).filter((n) => n.length >= 4))
  return candidates.map((c) => ({
    ...c,
    inCrm:
      (c.domain !== null && domains.has(c.domain)) ||
      (digitsOnly(c.phone).length === 10 && phones.has(digitsOnly(c.phone))) ||
      names.has(normalizedName(c.name)),
  }))
}

/** Removes duplicates within a single search (Places repeats places across pages). */
export function dedupe(candidates: Candidate[]): Candidate[] {
  const seen = new Set<string>()
  return candidates.filter((c) => {
    // Same place, same domain or same name (branches): only once.
    const keys = [c.placeId && `id:${c.placeId}`, c.domain && `dom:${c.domain}`, `name:${normalizedName(c.name)}`].filter(Boolean) as string[]
    if (keys.some((k) => seen.has(k))) return false
    keys.forEach((k) => seen.add(k))
    return true
  })
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
const JUNK_EMAILS = /(noreply|no-reply|donotreply|example|sentry|wixpress|godaddy|squarespace|shopify|wordpress|@2x|\.png$|\.jpg$|\.svg$|\.webp$|\.gif$|^(usuario|correo|email|nombre|tu-?correo|tu-?email|ejemplo|test|john\.?doe|jane\.?doe|lorem|ipsum|your-?name|your-?email|someone|user|username|mail|sample|demo|name|your-?mail|prueba|placeholder|abc|xyz|first\.?last|firstname\.?lastname)@|@(dominio|tudominio|ejemplo|correo|email|test|sitio|demoagency|yourdomain|yoursite|yourcompany|domain|company|mysite|website)\.)/i
const PREFERRED_PREFIXES = ['contacto', 'ventas', 'info', 'hola', 'informes', 'atencion', 'admin', 'direccion', 'gerencia']

/** Best email in an HTML page: same domain first, then the one with the most useful prefix. */
export function extractEmail(html: string, domain: string | null): string | null {
  // A mailto with an encoded space ("mailto:%20ventas@x.mx") left the %20 stuck to the
  // address and the send bounced (Piso Siete, 2026-10-08).
  const text = html.replace(/%20/gi, ' ').replace(/&#64;|&commat;/g, '@').replace(/\s*\[at\]\s*|\s*\(at\)\s*/gi, '@').replace(/\s*\[dot\]\s*|\s*\(dot\)\s*/gi, '.')
  // "placejoys.com@gmail.com" or "33123456@..." are glued text, not mailboxes (bounces of 2026-10-28).
  const oddLocalPart = (e: string) => /\.(com|mx|net|org|io)@/.test(e) || /^\d+@/.test(e)
  const all = [...new Set((text.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase()))].filter((e) => !JUNK_EMAILS.test(e) && !isNonSalesMailbox(e) && !oddLocalPart(e) && e.length < 80)
  if (all.length === 0) return null
  const score = (e: string) => {
    const [local, dom] = e.split('@')
    let s = 0
    if (domain && (dom === domain || dom.endsWith(`.${domain}`))) s += 10
    const i = PREFERRED_PREFIXES.indexOf(local)
    if (i >= 0) s += 5 - i * 0.3
    if (/gmail|hotmail|yahoo|outlook|live\.com/.test(dom)) s -= 2
    return s
  }
  return all.sort((a, b) => score(b) - score(a))[0]
}

/**
 * instagram.com paths that aren't the business profile. "instagram" is the generic icon
 * many site templates ship with: 7 of 24 prospects came in with that profile on
 * 2026-10-23. The first link that really is a profile is taken.
 */
const NON_PROFILE_INSTAGRAM_PATHS = ['p', 'reel', 'reels', 'explore', 'accounts', 'share', 'stories', 'tv', 'instagram', 'about', 'legal', 'developer', 'direct', 'web']

/**
 * Business Instagram from the results of a web search ("Name City instagram"). Most small
 * businesses have no website, so extractInstagram finds nothing for them; Google usually
 * has their profile indexed (2026-10-29). A result is accepted only if it's a profile (not
 * a post) and its username or title contain some distinctive word of the name; "clinica"
 * or "taller" alone don't count.
 */
const GENERIC_WORDS = new Set(['clinica', 'dental', 'consultorio', 'taller', 'mecanico', 'automotriz', 'refaccionaria', 'restaurante', 'restaurant', 'cafe', 'cafeteria', 'ferreteria', 'ferretera', 'grupo', 'servicio', 'servicios', 'centro', 'casa', 'bienes', 'raices', 'inmobiliaria', 'constructora', 'construccion', 'construcciones', 'despacho', 'abogados', 'contadores', 'contable', 'spa', 'gym', 'fitness', 'estetica', 'belleza', 'salon', 'tienda', 'boutique', 'joyeria', 'distribuidora', 'comercializadora', 'industrial', 'contador', 'contadores', 'publico', 'publicos', 'hospital', 'abarrotes', 'carniceria', 'cremeria', 'guadalajara', 'zapopan', 'tlaquepaque', 'tonala', 'tlajomulco', 'jalisco', 'mexico', 'sucursal', 'plaza', 'oficial', 'the', 'and', 'para', 'con', 'del', 'los', 'las', 'una', 'por'])

export function distinctiveTokens(name: string): string[] {
  return normalizedName(name).split(' ').filter((t) => t.length >= 4 && !GENERIC_WORDS.has(t))
}

const LOCAL_HINTS = /\b(guadalajara|gdl|zapopan|tlaquepaque|tonala|tlajomulco|el salto|jalisco|zmg|tepatitlan|los altos)\b/
const FOREIGN_SUFFIXES = /(\.|_)(cl|co|ar|pe|ec|uy|ve|es|us|cr|gt|bo|py|do)$/

interface WebResult { link: string; title?: string | null; description?: string | null }

/**
 * Whether a search result belongs to the business: some distinctive word of the name in
 * the username or the title, plus a local hint in the text or a username almost equal to
 * the name (if a lot is left after removing the name, it's another similar business).
 */
function matchesBusiness(name: string, username: string, r: WebResult, city?: string): boolean {
  const tokens = distinctiveTokens(name)
  if (!tokens.length) return false
  const generic = normalizedName(name).split(' ').filter((t) => !tokens.includes(t))
  const flat = username.toLowerCase().replace(/[._-]/g, '')
  const title = normalizedName(r.title ?? '').replace(/ /g, '')
  if (!tokens.some((f) => flat.includes(f) || title.includes(f))) return false
  let rest = flat
  for (const t of [...tokens, ...generic]) rest = rest.replace(t, '')
  rest = rest.replace(/(mx|gdl|oficial|official|mexico|\d+)/g, '')
  const text = normalizedName(`${r.title ?? ''} ${r.description ?? ''} ${username.replace(/[._-]/g, ' ')}`)
  const local = LOCAL_HINTS.test(text) || (city ? text.includes(normalizedName(city)) : false)
  return local || rest.length <= 3
}

export function instagramFromResults(name: string, results: WebResult[], city?: string): string | null {
  for (const r of results) {
    const m = /^https?:\/\/(?:www\.)?instagram\.com\/([a-z0-9_.]{2,30})\/?(?:[?#].*)?$/i.exec(r.link ?? '')
    if (!m) continue
    const username = m[1].toLowerCase()
    if (NON_PROFILE_INSTAGRAM_PATHS.includes(username) || FOREIGN_SUFFIXES.test(username)) continue
    if (matchesBusiness(name, username, r, city)) return `https://instagram.com/${username}`
  }
  return null
}

const NON_PAGE_FACEBOOK_PATHS = ['people', 'groups', 'events', 'pages', 'public', 'profile.php', 'login', 'share', 'watch', 'reel', 'marketplace', 'hashtag', 'search']

/**
 * The business's Facebook page and, if the search snippet has them, its phone and email.
 * Facebook isn't a prospecting channel (we don't write on Messenger); it's the data source
 * for businesses without a website that would otherwise be left out (2026-10-29).
 */
export function facebookFromResults(name: string, results: WebResult[], city?: string): { url: string; phone: string | null; email: string | null } | null {
  for (const r of results) {
    const m = /^https?:\/\/(?:www\.|m\.|es-la\.)?facebook\.com\/(?:p\/)?([A-Za-z0-9_.-]{2,80})\/?(?:[?#].*)?$/i.exec(r.link ?? '')
    if (!m) continue
    const slug = m[1]
    if (NON_PAGE_FACEBOOK_PATHS.includes(slug.toLowerCase())) continue
    // "/p/Maroffa-Restaurante-61557672856757" carries the name; a numeric page only carries the id.
    const username = /^\d+$/.test(slug) ? normalizedName(r.title ?? '').replace(/ /g, '') : slug.replace(/-?\d{8,}$/, '')
    if (!matchesBusiness(name, username, r, city)) continue
    const desc = r.description ?? ''
    const phone = desc.match(/(?:\+?52\s?)?(?:\(?\d{2,3}\)?[\s.-]?)\d{3,4}[\s.-]?\d{4}\b/g)?.map((t) => t.replace(/\D/g, '')).map((d) => (d.length === 12 && d.startsWith('52') ? d.slice(2) : d)).find((d) => d.length === 10) ?? null
    return { url: `https://facebook.com/${slug}`, phone: phone ? formatPhone(phone) : null, email: extractEmail(desc, null) }
  }
  return null
}

export interface LinkedInContact { firstName: string; lastName: string; jobTitle: string; url: string }

/** Job titles that decide a software purchase, from most to least decisive. */
const DECISION_TITLES: RegExp[] = [
  /\b(director|directora|dueñ[oa]|propietari[oa]|fundador|fundadora|founder|ceo|presidente|administrador general|administradora general)\b/,
  /\b(gerente general|general manager|coo|cfo|cto|cio)\b/,
  /\b(gerente|jefe|jefa|coordinador|coordinadora|head)\b.*\b(sistemas|ti|it|tecnolog|operaciones|administraci|finanzas)/,
  /\b(gerente|subdirector|subdirectora|socio|socia)\b/,
]

/**
 * The company's executive from LinkedIn titles ("Name - Title - Company | LinkedIn").
 * Corporate only: there the generic email reaches nobody and the director's name does.
 * We don't write on LinkedIn; it's used for the email or the call.
 */
export function linkedInContactFromResults(company: string, results: WebResult[]): LinkedInContact | null {
  const tokens = distinctiveTokens(company)
  if (!tokens.length) return null
  let best: { rank: number; c: LinkedInContact } | null = null
  for (const r of results) {
    if (!/^https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/in\//i.test(r.link ?? '')) continue
    const title = (r.title ?? '').replace(/\s*[|·-]\s*LinkedIn\s*$/i, '').trim()
    const parts = title.split(/\s+[-–]\s+/).map((x) => x.trim()).filter(Boolean)
    if (parts.length < 2) continue
    const person = parts[0]
    const jobTitle = parts.length >= 3 ? parts.slice(1, -1).join(' - ') : ''
    const titleCompany = parts[parts.length - 1]
    const text = normalizedName(`${titleCompany} ${r.description ?? ''}`).replace(/ /g, '')
    if (!tokens.some((f) => text.includes(f))) continue
    const normalizedTitle = normalizedName(jobTitle)
    const rank = DECISION_TITLES.findIndex((re) => re.test(normalizedTitle))
    if (rank < 0) continue
    if (/\b(driver|operador|chofer|auxiliar|practicante|becario|intern|asistente)\b/.test(normalizedTitle)) continue
    if (!best || rank < best.rank) {
      const [firstName, ...rest] = person.replace(/^(lic|ing|arq|dr|dra|mtro|mtra|c\.?p|lae|mba)\.?\s+/i, '').split(/\s+/)
      best = { rank, c: { firstName, lastName: rest.join(' '), jobTitle, url: r.link.replace(/\?.*$/, '') } }
    }
  }
  return best?.c ?? null
}

export function extractInstagram(html: string): string | null {
  for (const m of html.matchAll(/https?:\/\/(?:www\.)?instagram\.com\/([a-z0-9_.]{2,30})\/?/gi)) {
    const u = m[1].toLowerCase()
    if (!NON_PROFILE_INSTAGRAM_PATHS.includes(u)) return `https://instagram.com/${u}`
  }
  return null
}

/** Mexican number in WhatsApp format (52 + 10 digits); other countries are left as they come. */
function normalizeWhatsApp(digits: string): string | null {
  const d = digits.replace(/\D/g, '')
  if (d.length === 10) return `52${d}`
  if (d.length === 13 && d.startsWith('521')) return `52${d.slice(3)}`
  if (d.length >= 11 && d.length <= 13) return d
  return null
}

/**
 * WhatsApp the business publishes on its website: wa.me or api.whatsapp.com links. Unlike
 * Google's phone, this number really is on WhatsApp and the business offers it to be
 * written to.
 */
export function extractWhatsApp(html: string): string | null {
  const text = html.replace(/&amp;/g, '&')
  const re = /(?:wa\.me\/|(?:api|web)\.whatsapp\.com\/send\/?\?(?:[^"'\s>]*&)?phone=|whatsapp:\/\/send\?(?:[^"'\s>]*&)?phone=)(?:%2B|\+)?([\d][\d\s().-]{8,18}\d)/gi
  for (const m of text.matchAll(re)) {
    const n = normalizeWhatsApp(m[1])
    if (n) return n
  }
  return null
}

/** Internal links that usually have contact details. */
export function contactLinks(html: string, base: string): string[] {
  const out = new Set<string>()
  for (const m of html.matchAll(/href=["']([^"'#?]+)["']/gi)) {
    const href = m[1]
    if (!/contact|contacto|nosotros|about|quienes|equipo|team|aviso|ubicacion|sucursal/i.test(href)) continue
    try {
      const u = new URL(href, base)
      if (domainOf(u.href) === domainOf(base)) out.add(u.href.split('#')[0])
    } catch {
      /* invalid link */
    }
    if (out.size >= 4) break
  }
  return [...out]
}

/**
 * Neighborhoods and malls in the metro area where the average business has a bigger
 * budget. Used to prioritize, not to discard: a good prospect outside the list still gets in.
 */
const PREMIUM_ZONES = /puerta de hierro|andares|valle real|colinas de san javier|san javier|providencia|country club|lomas del valle|virreyes|royal country|zona real|jardines universidad|ciudad del sol|chapalita|vallarta norte|vallarta san jorge|monraz|terranova|lafayette|colonia americana|col\.? americana|bugambilias|santa anita|el palomar|rinconada del bosque|plaza patria|midtown|la rioja|solares/i

export function isPremiumZone(address: string | null | undefined): boolean {
  return PREMIUM_ZONES.test(address ?? '')
}

/**
 * What Google knows about the business, in one line, so the first message talks about
 * something real of theirs ("4.8 con 200 reseñas", "dos sucursales") and not a template.
 * Goes in the contact's notes with the GOOGLE_LISTING_PREFIX prefix; hookFromNotes ignores it.
 */
export const GOOGLE_LISTING_PREFIX = 'Google Maps:'

export function googleListing(c: Pick<Candidate, 'rating' | 'reviews' | 'type' | 'address'>): string | null {
  const parts: string[] = []
  if (c.rating) parts.push(`${c.rating} estrellas (${c.reviews} reseñas)`)
  if (c.type) parts.push(c.type)
  if (c.address) parts.push(c.address.replace(/, M[ée]xico$/, '').replace(/\d{5}\s*/, ''))
  return parts.length ? `${GOOGLE_LISTING_PREFIX} ${parts.join(' · ')}` : null
}

/** Row ready for mapRowsToContacts, in the same format as the manual CSV. */
export function rowFromCandidate(c: Candidate, segment: string): CsvRow {
  return {
    company: c.name,
    first_name: c.contact?.firstName ?? '',
    last_name: c.contact?.lastName ?? '',
    job_title: c.contact?.jobTitle ?? '',
    linkedin: c.contact?.url ?? '',
    email: c.email ?? '',
    phone: c.phone ?? '',
    instagram: c.instagram ?? '',
    whatsapp: c.whatsapp ?? '',
    facebook: c.facebook ?? '',
    website: c.website ?? '',
    segment,
    zone: isPremiumZone(c.address) ? 'premium-zone' : '',
    hook: googleListing(c) ?? '',
  }
}
