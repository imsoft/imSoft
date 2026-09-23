/**
 * Buscador de prospectos: Google Places (New) + rastreo de correos en el sitio de cada
 * negocio + alta en el CRM. Solo servidor. La logica pura esta en src/lib/places.ts.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { mapRowsToContacts } from './import-contacts.ts'
import { MUNICIPIOS, candidatoDe, enlacesDeContacto, extraerCorreo, extraerInstagram, filaDesdeCandidato, giroDe, marcarExistentes, sePuedeEscribir, sinRepetidos, type Candidato, type ContactoExistente, type PlaceResult } from './places.ts'

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
  const { data } = await db.from('contacts').select('company, website_url, phone, email').limit(5000)
  return (data ?? []) as ContactoExistente[]
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

/** Correo e Instagram del sitio: portada y hasta 4 paginas de contacto/nosotros. */
export async function contactoDelSitio(sitio: string): Promise<{ correo: string | null; instagram: string | null }> {
  const base = sitio.startsWith('http') ? sitio : `https://${sitio}`
  const dominio = new URL(base).hostname.replace(/^www\./, '')
  const home = await descargar(base)
  if (!home) return { correo: null, instagram: null }
  let correo = extraerCorreo(home, dominio)
  let instagram = extraerInstagram(home)
  if (!correo) {
    for (const url of enlacesDeContacto(home, base)) {
      const html = await descargar(url, 6000)
      if (!html) continue
      correo = correo ?? extraerCorreo(html, dominio)
      instagram = instagram ?? extraerInstagram(html)
      if (correo) break
    }
  }
  return { correo, instagram }
}

/** Enriquece en paralelo (de 5 en 5) los candidatos con sitio. */
export async function enriquecer(candidatos: Candidato[]): Promise<Candidato[]> {
  const out = [...candidatos]
  const indices = out.map((c, i) => (c.sitio && !c.enCrm ? i : -1)).filter((i) => i >= 0)
  for (let k = 0; k < indices.length; k += 5) {
    await Promise.all(
      indices.slice(k, k + 5).map(async (i) => {
        const { correo, instagram } = await contactoDelSitio(out[i].sitio!)
        out[i] = { ...out[i], correo, instagram }
      }),
    )
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
  if (opts.correos) candidatos = await enriquecer(candidatos)
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
