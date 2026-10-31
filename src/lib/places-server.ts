/**
 * Prospect search: Google Places (New) + crawling each business's website for emails +
 * adding them to the CRM. Server only. The pure logic is in src/lib/places.ts.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { mapRowsToContacts } from './import-contacts.ts'
import { MUNICIPALITIES, candidateFrom, linkedInContactFromResults, contactLinks, extractEmail, extractInstagram, extractWhatsApp, facebookFromResults, rowFromCandidate, industryByKey, instagramFromResults, markExisting, phoneAsWhatsApp, isReachable, dedupe, type Candidate, type ExistingContact, type PlaceResult } from './places.ts'

const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.googleMapsUri,nextPageToken'

export function placesConfigured(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY)
}

/** Up to `max` places (Places gives 20 per page, at most 60 per query). */
export async function searchPlaces(query: string, municipality: string, max = 60): Promise<Candidate[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) throw new Error('Falta GOOGLE_PLACES_API_KEY en el entorno.')
  const m = MUNICIPALITIES[municipality] ?? MUNICIPALITIES.zmg
  const textQuery = `${query} en ${m.name}, Jalisco`
  const out: Candidate[] = []
  let pageToken: string | undefined
  for (let page = 0; page < 3 && out.length < max; page++) {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELD_MASK },
      body: JSON.stringify({
        textQuery,
        languageCode: 'es',
        regionCode: 'MX',
        pageSize: 20,
        ...(pageToken ? { pageToken } : {}),
        locationBias: { circle: { center: { latitude: m.lat, longitude: m.lng }, radius: m.radius } },
      }),
    })
    if (!r.ok) throw new Error(`Places ${r.status}: ${(await r.text()).slice(0, 300)}`)
    const j = (await r.json()) as { places?: PlaceResult[]; nextPageToken?: string }
    out.push(...(j.places ?? []).map(candidateFrom))
    pageToken = j.nextPageToken
    if (!pageToken) break
  }
  return dedupe(out).slice(0, max)
}

export async function existingContacts(db: SupabaseClient): Promise<ExistingContact[]> {
  const [{ data }, { data: portfolio }] = await Promise.all([
    db.from('contacts').select('company, website_url, phone, email').limit(5000),
    db.from('portfolio').select('title_es, title, client, project_url').limit(500),
  ])
  // Portfolio clients count as existing: they're not cold-prospected
  // (Ferreacabados Jalisco came in as a prospect and got an email on 2026-09-30).
  const clients: ExistingContact[] = (portfolio ?? []).flatMap((p) => {
    const name = String(p.title_es ?? p.title ?? '').split(/ [-·] /)[0].trim()
    return [name, String(p.client ?? '').trim()].filter(Boolean).map((company) => ({ company, website_url: (p.project_url as string | null) ?? null, phone: null, email: null }))
  })
  return [...((data ?? []) as ExistingContact[]), ...clients]
}

async function fetchHtml(url: string, ms = 8000): Promise<string | null> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const r = await fetch(url, { signal: ctrl.signal, redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; imSoftBot/1.0; +https://www.imsoft.io)', Accept: 'text/html' } })
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('html')) return null
    return (await r.text()).slice(0, 400_000)
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/** Email, Instagram and WhatsApp from the website: home page and up to 4 contact/about pages. */
export async function contactFromWebsite(website: string): Promise<{ email: string | null; instagram: string | null; whatsapp: string | null }> {
  const base = website.startsWith('http') ? website : `https://${website}`
  const domain = new URL(base).hostname.replace(/^www\./, '')
  const home = await fetchHtml(base)
  if (!home) return { email: null, instagram: null, whatsapp: null }
  let email = extractEmail(home, domain)
  let instagram = extractInstagram(home)
  let whatsapp = extractWhatsApp(home)
  if (!email || !whatsapp) {
    for (const url of contactLinks(home, base)) {
      const html = await fetchHtml(url, 6000)
      if (!html) continue
      email = email ?? extractEmail(html, domain)
      instagram = instagram ?? extractInstagram(html)
      whatsapp = whatsapp ?? extractWhatsApp(html)
      if (email && whatsapp) break
    }
  }
  return { email, instagram, whatsapp }
}

/**
 * Web search to find the Instagram of a business without a website. Providers, in order:
 * Brave Search API (BRAVE_SEARCH_API_KEY; 2,000 free queries a month) and Google
 * Programmable Search (GOOGLE_CSE_ID + key), which Google already closed to new customers
 * (Oct 2026) but is kept in case the project had it. Without keys it does nothing.
 */
export function webSearchConfigured(): boolean {
  return Boolean(process.env.BRAVE_SEARCH_API_KEY) || Boolean(process.env.GOOGLE_CSE_ID && (process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_PLACES_API_KEY))
}

let webSearchWarned = false
/**
 * Web search caps per process and per use: with 3 runs a week, ~80 per run fit in
 * Brave's free $5 USD a month (1,000 searches). TOPE_BUSQUEDAS_WEB is the old env var name.
 */
const SEARCH_CAPS = { instagram: Number(process.env.WEB_SEARCH_CAP || process.env.TOPE_BUSQUEDAS_WEB) || 55, facebook: 15, linkedin: 8 }
const searchesDone = { instagram: 0, facebook: 0, linkedin: 0 }
function hasQuota(use: keyof typeof SEARCH_CAPS): boolean {
  if (!webSearchConfigured() || searchesDone[use] >= SEARCH_CAPS[use]) return false
  searchesDone[use] += 1
  return true
}

async function webResults(query: string): Promise<Array<{ link: string; title?: string; description?: string }>> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 8000)
  try {
    let r: Response
    if (process.env.BRAVE_SEARCH_API_KEY) {
      const q = new URLSearchParams({ q: query, count: '5', country: 'MX', search_lang: 'es' })
      r = await fetch(`https://api.search.brave.com/res/v1/web/search?${q}`, { signal: ctrl.signal, headers: { Accept: 'application/json', 'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY } })
      if (!r.ok) throw new Error(`Brave HTTP ${r.status} ${(await r.text()).slice(0, 200)}`)
      const j = (await r.json()) as { web?: { results?: Array<{ url: string; title?: string; description?: string }> } }
      return (j.web?.results ?? []).map((x) => ({ link: x.url, title: x.title, description: x.description }))
    }
    const key = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_PLACES_API_KEY
    const q = new URLSearchParams({ key: key!, cx: process.env.GOOGLE_CSE_ID!, q: query, siteSearch: 'instagram.com', siteSearchFilter: 'i', num: '5' })
    r = await fetch(`https://www.googleapis.com/customsearch/v1?${q}`, { signal: ctrl.signal })
    if (!r.ok) throw new Error(`Google HTTP ${r.status} ${(await r.text()).slice(0, 200)}`)
    const j = (await r.json()) as { items?: Array<{ link: string; title?: string; snippet?: string }> }
    return (j.items ?? []).map((x) => ({ link: x.link, title: x.title, description: x.snippet }))
  } catch (err) {
    if (!webSearchWarned) {
      webSearchWarned = true
      console.warn(`Busqueda web de Instagram: ${err instanceof Error ? err.message : String(err)}`)
    }
    return []
  } finally {
    clearTimeout(t)
  }
}

export async function instagramBySearch(name: string, city: string): Promise<string | null> {
  if (!hasQuota('instagram')) return null
  return instagramFromResults(name, await webResults(`"${name}" ${city} site:instagram.com`), city)
}

/** Facebook page (and phone or email if the snippet has them) of a business with no other contact. */
export async function facebookBySearch(name: string, city: string) {
  if (!hasQuota('facebook')) return null
  return facebookFromResults(name, await webResults(`"${name}" ${city} site:facebook.com`), city)
}

/** Executive of a large company on LinkedIn: name and title to address the email. */
export async function linkedinBySearch(company: string) {
  if (!hasQuota('linkedin')) return null
  return linkedInContactFromResults(company, await webResults(`"${company}" (director OR gerente OR dueño) Guadalajara site:linkedin.com/in`))
}

/**
 * Enriches in parallel (5 at a time): email, Instagram and WhatsApp from the website, and
 * for those left without Instagram, a web search by name and city.
 */
export async function enrich(candidates: Candidate[], city = 'Guadalajara', opts: { linkedin?: boolean } = {}): Promise<Candidate[]> {
  const out = [...candidates]
  const indices = out.map((c, i) => (c.website && !c.inCrm ? i : -1)).filter((i) => i >= 0)
  for (let k = 0; k < indices.length; k += 5) {
    await Promise.all(
      indices.slice(k, k + 5).map(async (i) => {
        const { email, instagram, whatsapp } = await contactFromWebsite(out[i].website!)
        out[i] = { ...out[i], email, instagram, whatsapp }
      }),
    )
  }
  if (webSearchConfigured()) {
    const noInstagram = out.map((c, i) => (!c.inCrm && !c.instagram ? i : -1)).filter((i) => i >= 0)
    for (let k = 0; k < noInstagram.length; k += 5) {
      await Promise.all(
        noInstagram.slice(k, k + 5).map(async (i) => {
          const instagram = await instagramBySearch(out[i].name, city)
          if (instagram) out[i] = { ...out[i], instagram }
        }),
      )
    }
    // Without email, Instagram or WhatsApp the candidate is dropped: Facebook is the last resort.
    const nothing = out.map((c, i) => (!c.inCrm && !c.email && !c.instagram && !c.whatsapp && !phoneAsWhatsApp(c.phone) ? i : -1)).filter((i) => i >= 0)
    for (let k = 0; k < nothing.length; k += 5) {
      await Promise.all(
        nothing.slice(k, k + 5).map(async (i) => {
          const fb = await facebookBySearch(out[i].name, city)
          if (fb) out[i] = { ...out[i], facebook: fb.url, email: out[i].email ?? fb.email, phone: out[i].phone ?? fb.phone }
        }),
      )
    }
    if (opts.linkedin) {
      const large = out.map((c, i) => (!c.inCrm ? i : -1)).filter((i) => i >= 0)
      for (let k = 0; k < large.length; k += 4) {
        await Promise.all(
          large.slice(k, k + 4).map(async (i) => {
            const contact = await linkedinBySearch(out[i].name)
            if (contact) out[i] = { ...out[i], contact }
          }),
        )
      }
    }
  }
  return out
}

/** Full search: Places + marking existing ones (+ emails if asked). */
export async function searchProspects(db: SupabaseClient, industryKey: string, municipality: string, opts: { max?: number; emails?: boolean; freeQuery?: string } = {}) {
  const industry = industryByKey(industryKey)
  const query = opts.freeQuery?.trim() || industry?.query
  if (!query) throw new Error('Giro desconocido')
  const [places, existing] = await Promise.all([searchPlaces(query, municipality, opts.max ?? 60), existingContacts(db)])
  let candidates = markExisting(places, existing)
  if (opts.emails) candidates = await enrich(candidates, (MUNICIPALITIES[municipality] ?? MUNICIPALITIES.zmg).name.replace(/^Zona metropolitana de /, ''), { linkedin: industryKey === 'corporate' })
  return { candidates, segment: industry?.segment ?? 'other', newCount: candidates.filter((c) => !c.inCrm).length }
}

/** Adds the chosen candidates as uncontacted prospects. */
export async function importCandidates(db: SupabaseClient, candidates: Candidate[], segment: string, source: string, extraTags: string[] = []) {
  const unreachable = candidates.filter((c) => !c.inCrm && !isReachable(c)).length
  const rows = candidates.filter((c) => !c.inCrm && isReachable(c)).map((c) => rowFromCandidate(c, segment))
  const { contacts, skipped } = mapRowsToContacts(rows, { source, contactType: 'prospect', status: 'no_contact', tags: ['google-places', ...extraTags] })
  let inserted = 0
  const withEmail = contacts.filter((c) => c.email)
  const withoutEmail = contacts.filter((c) => !c.email)
  if (withEmail.length) {
    const { data, error } = await db.from('contacts').upsert(withEmail, { onConflict: 'email', ignoreDuplicates: true }).select('id')
    if (error) throw new Error(error.message)
    inserted += data?.length ?? 0
  }
  if (withoutEmail.length) {
    const { data, error } = await db.from('contacts').insert(withoutEmail).select('id')
    if (error) throw new Error(error.message)
    inserted += data?.length ?? 0
  }
  return { inserted, skipped: unreachable + skipped.noContact.length + skipped.invalidEmail.length + skipped.duplicate.length }
}
