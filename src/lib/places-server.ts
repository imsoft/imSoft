/**
 * Buscador de prospectos: Google Places (New) + rastreo de correos en el sitio de cada
 * negocio + alta en el CRM. Solo servidor. La logica pura esta en src/lib/places.ts.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { mapRowsToContacts } from './import-contacts.ts'
import { MUNICIPIOS, candidatoDe, contactoLinkedInDeResultados, enlacesDeContacto, extraerCorreo, extraerInstagram, extraerWhatsApp, facebookDeResultados, filaDesdeCandidato, giroDe, instagramDeResultados, marcarExistentes, telefonoParaWhatsApp, sePuedeEscribir, sinRepetidos, type Candidato, type ContactoExistente, type PlaceResult } from './places.ts'

const FIELD_MASK = 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.googleMapsUri,nextPageToken'

export function placesConfigurado(): boolean {
  return Boolean(process.env.GOOGLE_PLACES_API_KEY)
}

/** Hasta `max` lugares (Places da 20 por pagina, maximo 60 por consulta). */
export async function buscarLugares(query: string, municipio: string, max = 60): Promise<Candidato[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY
  if (!key) throw new Error('Falta GOOGLE_PLACES_API_KEY en el entorno.')
  const m = MUNICIPIOS[municipio] ?? MUNICIPIOS.zmg
  const textQuery = `${query} en ${m.nombre}, Jalisco`
  const out: Candidato[] = []
  let pageToken: string | undefined
  for (let pagina = 0; pagina < 3 && out.length < max; pagina++) {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key, 'X-Goog-FieldMask': FIELD_MASK },
      body: JSON.stringify({
        textQuery,
        languageCode: 'es',
        regionCode: 'MX',
        pageSize: 20,
        ...(pageToken ? { pageToken } : {}),
        locationBias: { circle: { center: { latitude: m.lat, longitude: m.lng }, radius: m.radio } },
      }),
    })
    if (!r.ok) throw new Error(`Places ${r.status}: ${(await r.text()).slice(0, 300)}`)
    const j = (await r.json()) as { places?: PlaceResult[]; nextPageToken?: string }
    out.push(...(j.places ?? []).map(candidatoDe))
    pageToken = j.nextPageToken
    if (!pageToken) break
  }
  return sinRepetidos(out).slice(0, max)
}

export async function contactosExistentes(db: SupabaseClient): Promise<ContactoExistente[]> {
  const [{ data }, { data: portafolio }] = await Promise.all([
    db.from('contacts').select('company, website_url, phone, email').limit(5000),
    db.from('portfolio').select('title_es, title, client, project_url').limit(500),
  ])
  // Los clientes del portafolio cuentan como existentes: no se les prospecta en frio
  // (Ferreacabados Jalisco entro como prospecto y recibio un correo el 30-sep-2026).
  const clientes: ContactoExistente[] = (portafolio ?? []).flatMap((p) => {
    const nombre = String(p.title_es ?? p.title ?? '').split(/ [-·] /)[0].trim()
    return [nombre, String(p.client ?? '').trim()].filter(Boolean).map((company) => ({ company, website_url: (p.project_url as string | null) ?? null, phone: null, email: null }))
  })
  return [...((data ?? []) as ContactoExistente[]), ...clientes]
}

async function descargar(url: string, ms = 8000): Promise<string | null> {
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

/** Correo, Instagram y WhatsApp del sitio: portada y hasta 4 paginas de contacto/nosotros. */
export async function contactoDelSitio(sitio: string): Promise<{ correo: string | null; instagram: string | null; whatsapp: string | null }> {
  const base = sitio.startsWith('http') ? sitio : `https://${sitio}`
  const dominio = new URL(base).hostname.replace(/^www\./, '')
  const home = await descargar(base)
  if (!home) return { correo: null, instagram: null, whatsapp: null }
  let correo = extraerCorreo(home, dominio)
  let instagram = extraerInstagram(home)
  let whatsapp = extraerWhatsApp(home)
  if (!correo || !whatsapp) {
    for (const url of enlacesDeContacto(home, base)) {
      const html = await descargar(url, 6000)
      if (!html) continue
      correo = correo ?? extraerCorreo(html, dominio)
      instagram = instagram ?? extraerInstagram(html)
      whatsapp = whatsapp ?? extraerWhatsApp(html)
      if (correo && whatsapp) break
    }
  }
  return { correo, instagram, whatsapp }
}

/**
 * Busqueda web para hallar el Instagram de un negocio sin sitio. Proveedores, en orden:
 * Brave Search API (BRAVE_SEARCH_API_KEY; 2,000 consultas gratis al mes) y Google
 * Programmable Search (GOOGLE_CSE_ID + llave), que Google ya cerro a clientes nuevos
 * (oct-2026) pero se deja por si el proyecto lo tuviera. Sin llaves no hace nada.
 */
export function busquedaWebConfigurada(): boolean {
  return Boolean(process.env.BRAVE_SEARCH_API_KEY) || Boolean(process.env.GOOGLE_CSE_ID && (process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_PLACES_API_KEY))
}

let avisoBusquedaWeb = false
/**
 * Topes de busquedas web por proceso y por uso: con 3 corridas por semana, ~80 por corrida
 * caben en los $5 USD gratis de Brave al mes (1,000 busquedas).
 */
const TOPES_BUSQUEDA = { instagram: Number(process.env.TOPE_BUSQUEDAS_WEB) || 55, facebook: 15, linkedin: 8 }
const busquedasHechas = { instagram: 0, facebook: 0, linkedin: 0 }
function hayCupo(uso: keyof typeof TOPES_BUSQUEDA): boolean {
  if (!busquedaWebConfigurada() || busquedasHechas[uso] >= TOPES_BUSQUEDA[uso]) return false
  busquedasHechas[uso] += 1
  return true
}

async function resultadosWeb(consulta: string): Promise<Array<{ link: string; title?: string; description?: string }>> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 8000)
  try {
    let r: Response
    if (process.env.BRAVE_SEARCH_API_KEY) {
      const q = new URLSearchParams({ q: consulta, count: '5', country: 'MX', search_lang: 'es' })
      r = await fetch(`https://api.search.brave.com/res/v1/web/search?${q}`, { signal: ctrl.signal, headers: { Accept: 'application/json', 'X-Subscription-Token': process.env.BRAVE_SEARCH_API_KEY } })
      if (!r.ok) throw new Error(`Brave HTTP ${r.status} ${(await r.text()).slice(0, 200)}`)
      const j = (await r.json()) as { web?: { results?: Array<{ url: string; title?: string; description?: string }> } }
      return (j.web?.results ?? []).map((x) => ({ link: x.url, title: x.title, description: x.description }))
    }
    const key = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_PLACES_API_KEY
    const q = new URLSearchParams({ key: key!, cx: process.env.GOOGLE_CSE_ID!, q: consulta, siteSearch: 'instagram.com', siteSearchFilter: 'i', num: '5' })
    r = await fetch(`https://www.googleapis.com/customsearch/v1?${q}`, { signal: ctrl.signal })
    if (!r.ok) throw new Error(`Google HTTP ${r.status} ${(await r.text()).slice(0, 200)}`)
    const j = (await r.json()) as { items?: Array<{ link: string; title?: string; snippet?: string }> }
    return (j.items ?? []).map((x) => ({ link: x.link, title: x.title, description: x.snippet }))
  } catch (err) {
    if (!avisoBusquedaWeb) {
      avisoBusquedaWeb = true
      console.warn(`Busqueda web de Instagram: ${err instanceof Error ? err.message : String(err)}`)
    }
    return []
  } finally {
    clearTimeout(t)
  }
}

export async function instagramPorGoogle(nombre: string, ciudad: string): Promise<string | null> {
  if (!hayCupo('instagram')) return null
  return instagramDeResultados(nombre, await resultadosWeb(`"${nombre}" ${ciudad} site:instagram.com`), ciudad)
}

/** Pagina de Facebook (y telefono o correo si el resumen los trae) de un negocio sin otro contacto. */
export async function facebookPorBusqueda(nombre: string, ciudad: string) {
  if (!hayCupo('facebook')) return null
  return facebookDeResultados(nombre, await resultadosWeb(`"${nombre}" ${ciudad} site:facebook.com`), ciudad)
}

/** Directivo de una empresa grande en LinkedIn: nombre y cargo para dirigir el correo. */
export async function linkedinPorBusqueda(empresa: string) {
  if (!hayCupo('linkedin')) return null
  return contactoLinkedInDeResultados(empresa, await resultadosWeb(`"${empresa}" (director OR gerente OR dueño) Guadalajara site:linkedin.com/in`))
}

/**
 * Enriquece en paralelo (de 5 en 5): correo, Instagram y WhatsApp del sitio, y para los
 * que se quedan sin Instagram, una busqueda web por nombre y ciudad.
 */
export async function enriquecer(candidatos: Candidato[], ciudad = 'Guadalajara', opts: { linkedin?: boolean } = {}): Promise<Candidato[]> {
  const out = [...candidatos]
  const indices = out.map((c, i) => (c.sitio && !c.enCrm ? i : -1)).filter((i) => i >= 0)
  for (let k = 0; k < indices.length; k += 5) {
    await Promise.all(
      indices.slice(k, k + 5).map(async (i) => {
        const { correo, instagram, whatsapp } = await contactoDelSitio(out[i].sitio!)
        out[i] = { ...out[i], correo, instagram, whatsapp }
      }),
    )
  }
  if (busquedaWebConfigurada()) {
    const sinIg = out.map((c, i) => (!c.enCrm && !c.instagram ? i : -1)).filter((i) => i >= 0)
    for (let k = 0; k < sinIg.length; k += 5) {
      await Promise.all(
        sinIg.slice(k, k + 5).map(async (i) => {
          const instagram = await instagramPorGoogle(out[i].nombre, ciudad)
          if (instagram) out[i] = { ...out[i], instagram }
        }),
      )
    }
    // Sin correo, Instagram ni WhatsApp el candidato se descarta: Facebook es el ultimo recurso.
    const sinNada = out.map((c, i) => (!c.enCrm && !c.correo && !c.instagram && !c.whatsapp && !telefonoParaWhatsApp(c.telefono) ? i : -1)).filter((i) => i >= 0)
    for (let k = 0; k < sinNada.length; k += 5) {
      await Promise.all(
        sinNada.slice(k, k + 5).map(async (i) => {
          const fb = await facebookPorBusqueda(out[i].nombre, ciudad)
          if (fb) out[i] = { ...out[i], facebook: fb.url, correo: out[i].correo ?? fb.correo, telefono: out[i].telefono ?? fb.telefono }
        }),
      )
    }
    if (opts.linkedin) {
      const grandes = out.map((c, i) => (!c.enCrm ? i : -1)).filter((i) => i >= 0)
      for (let k = 0; k < grandes.length; k += 4) {
        await Promise.all(
          grandes.slice(k, k + 4).map(async (i) => {
            const contacto = await linkedinPorBusqueda(out[i].nombre)
            if (contacto) out[i] = { ...out[i], contacto }
          }),
        )
      }
    }
  }
  return out
}

/** Busqueda completa: Places + marca de existentes (+ correos si se pide). */
export async function buscarProspectos(db: SupabaseClient, giroClave: string, municipio: string, opts: { max?: number; correos?: boolean; queryLibre?: string } = {}) {
  const giro = giroDe(giroClave)
  const query = opts.queryLibre?.trim() || giro?.query
  if (!query) throw new Error('Giro desconocido')
  const [lugares, existentes] = await Promise.all([buscarLugares(query, municipio, opts.max ?? 60), contactosExistentes(db)])
  let candidatos = marcarExistentes(lugares, existentes)
  if (opts.correos) candidatos = await enriquecer(candidatos, (MUNICIPIOS[municipio] ?? MUNICIPIOS.zmg).nombre.replace(/^Zona metropolitana de /, ''), { linkedin: giroClave === 'corporativo' })
  return { candidatos, segmento: giro?.segmento ?? 'otros', nuevos: candidatos.filter((c) => !c.enCrm).length }
}

/** Da de alta los candidatos elegidos como prospectos sin contactar. */
export async function importarCandidatos(db: SupabaseClient, candidatos: Candidato[], segmento: string, source: string, tagsExtra: string[] = []) {
  const sinContacto = candidatos.filter((c) => !c.enCrm && !sePuedeEscribir(c)).length
  const filas = candidatos.filter((c) => !c.enCrm && sePuedeEscribir(c)).map((c) => filaDesdeCandidato(c, segmento))
  const { contacts, skipped } = mapRowsToContacts(filas, { source, contactType: 'prospect', status: 'no_contact', tags: ['google-places', ...tagsExtra] })
  let insertados = 0
  const conCorreo = contacts.filter((c) => c.email)
  const sinCorreo = contacts.filter((c) => !c.email)
  if (conCorreo.length) {
    const { data, error } = await db.from('contacts').upsert(conCorreo, { onConflict: 'email', ignoreDuplicates: true }).select('id')
    if (error) throw new Error(error.message)
    insertados += data?.length ?? 0
  }
  if (sinCorreo.length) {
    const { data, error } = await db.from('contacts').insert(sinCorreo).select('id')
    if (error) throw new Error(error.message)
    insertados += data?.length ?? 0
  }
  return { insertados, omitidos: sinContacto + skipped.noContact.length + skipped.invalidEmail.length + skipped.duplicate.length }
}
