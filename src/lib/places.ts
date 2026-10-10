/**
 * Buscador de prospectos con Google Places: logica pura (sin red), probada con vitest.
 * La E/S (Places API, rastreo de sitios, Supabase) vive en src/lib/places-server.ts.
 */
import type { CsvRow } from './import-contacts.ts'
import { buzonNoComercial } from './correo-invalido.ts'

/** Municipios de la zona metropolitana de Guadalajara con su centro aproximado. */
export const MUNICIPIOS: Record<string, { nombre: string; lat: number; lng: number; radio: number }> = {
  guadalajara: { nombre: 'Guadalajara', lat: 20.6736, lng: -103.344, radio: 9000 },
  zapopan: { nombre: 'Zapopan', lat: 20.7214, lng: -103.3908, radio: 12000 },
  tlaquepaque: { nombre: 'San Pedro Tlaquepaque', lat: 20.6402, lng: -103.3117, radio: 8000 },
  tonala: { nombre: 'Tonalá', lat: 20.6247, lng: -103.2342, radio: 8000 },
  tlajomulco: { nombre: 'Tlajomulco de Zúñiga', lat: 20.4738, lng: -103.4433, radio: 12000 },
  elsalto: { nombre: 'El Salto', lat: 20.5199, lng: -103.1808, radio: 8000 },
  zmg: { nombre: 'Zona metropolitana de Guadalajara', lat: 20.6597, lng: -103.3496, radio: 30000 },
}

/** Giros que suelen comprar software a la medida, con la consulta que mejor funciona en Places. */
export const GIROS: { clave: string; nombre: string; query: string; segmento: string }[] = [
  { clave: 'abastos', nombre: 'Mercado de Abastos y mayoristas', query: 'distribuidora mayorista abarrotes frutas verduras Mercado de Abastos', segmento: 'abastos' },
  { clave: 'logistica', nombre: 'Logística y agencias aduanales', query: 'agencia aduanal empresa de logística transporte de carga', segmento: 'logistica' },
  { clave: 'abogados', nombre: 'Despachos de abogados', query: 'despacho de abogados bufete jurídico', segmento: 'abogados' },
  { clave: 'contabilidad', nombre: 'Despachos contables', query: 'despacho contable contadores públicos', segmento: 'contabilidad' },
  { clave: 'salud', nombre: 'Hospitales y clínicas', query: 'hospital privado clínica de especialidades', segmento: 'salud' },
  { clave: 'dental', nombre: 'Clínicas dentales', query: 'clínica dental', segmento: 'salud' },
  { clave: 'restaurantes', nombre: 'Restaurantes', query: 'restaurante', segmento: 'restaurantes' },
  { clave: 'ecommerce', nombre: 'Tiendas y boutiques (ecommerce)', query: 'boutique tienda de ropa calzado joyería', segmento: 'ecommerce' },
  { clave: 'construccion', nombre: 'Constructoras', query: 'empresa constructora', segmento: 'construccion' },
  { clave: 'ferreteria', nombre: 'Ferreterías y distribuidores industriales', query: 'ferretería industrial distribuidor', segmento: 'ferreteria' },
  { clave: 'inmobiliaria', nombre: 'Inmobiliarias', query: 'inmobiliaria bienes raíces', segmento: 'inmobiliaria' },
  { clave: 'fitness', nombre: 'Gimnasios', query: 'gimnasio', segmento: 'fitness' },
  { clave: 'escuelas', nombre: 'Escuelas privadas', query: 'colegio privado escuela particular', segmento: 'escuelas' },
  { clave: 'talleres', nombre: 'Talleres y refaccionarias', query: 'taller mecánico refaccionaria', segmento: 'automotriz' },
  { clave: 'clinicas-estetica', nombre: 'Clínicas de estética y spa', query: 'clínica de estética spa', segmento: 'salud' },
  // Para buscar empresas grandes por nombre ("Grupo Dalton") con la busqueda propia.
  { clave: 'corporativo', nombre: 'Empresas grandes y corporativos', query: 'corporativo oficinas corporativas', segmento: 'corporativo' },
]

export function giroDe(clave: string) {
  return GIROS.find((g) => g.clave === clave) ?? null
}

/** Lo que devuelve Places (campos que pedimos en el FieldMask). */
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

export interface Candidato {
  placeId: string
  nombre: string
  direccion: string
  telefono: string | null
  sitio: string | null
  dominio: string | null
  rating: number | null
  resenas: number
  tipo: string | null
  mapsUrl: string | null
  /** Ya existe en el CRM (por dominio, teléfono o nombre). */
  enCrm: boolean
  correo?: string | null
  instagram?: string | null
  /** Numero del enlace de WhatsApp que el negocio publica en su sitio (52 + 10 digitos). */
  whatsapp?: string | null
}

/**
 * De lo que devuelve Google al buscar una empresa por nombre, solo lo que de verdad es esa
 * empresa: "Farmacias Guadalajara" trae tambien farmacias vecinas. Una sola por marca.
 */
export function deLaMarca<T extends { nombre: string }>(candidatos: T[], clave: string): T[] {
  const k = nombreNormalizado(clave)
  const hit = candidatos.find((c) => nombreNormalizado(c.nombre).includes(k))
  return hit ? [hit] : []
}

/** Dias de la semana en que corre el buscador (0 = domingo): lunes, miercoles y viernes. */
export const DIAS_DE_CORRIDA = [1, 3, 5]

/**
 * Numero de corrida que toca hoy: cuantos lunes, miercoles y viernes han pasado desde el
 * 21-sep-2026. Sirve para que cada corrida tome el tramo siguiente de la lista sin guardar
 * estado; una corrida manual el mismo dia repite el tramo, que es lo deseable.
 */
export function numeroDeCorrida(fecha = new Date(), dias = DIAS_DE_CORRIDA): number {
  const inicio = Date.UTC(2026, 8, 21)
  const hoy = Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate())
  let n = 0
  for (let t = inicio; t <= hoy; t += 86_400_000) if (dias.includes(new Date(t).getUTCDay())) n++
  return n
}

/** Tramo de la lista que toca en la corrida dada; en ceil(lista/porCorrida) corridas se recorre completa. */
export function tramoDeBusquedas<T>(lista: T[], corrida: number, porCorrida: number): T[] {
  if (!lista.length || porCorrida <= 0) return []
  const n = Math.min(porCorrida, lista.length)
  const inicio = (((corrida * n) % lista.length) + lista.length) % lista.length
  return Array.from({ length: n }, (_, i) => lista[(inicio + i) % lista.length])
}

/**
 * Un candidato entra al CRM solo si hay por donde escribirle: correo, Instagram o el
 * WhatsApp que publica en su sitio. El telefono de Google solo no basta (decision de
 * Brandon, 23-sep-2026): suele ser fijo y los de puro telefono se quedaban sin contactar.
 */
export function sePuedeEscribir(c: Pick<Candidato, 'correo' | 'instagram' | 'whatsapp'>): boolean {
  return Boolean((c.correo ?? '').trim() || (c.instagram ?? '').trim() || (c.whatsapp ?? '').trim())
}

const DOMINIOS_GENERICOS = ['facebook.com', 'instagram.com', 'wa.me', 'whatsapp.com', 'linktr.ee', 'google.com', 'goo.gl', 'business.site', 'negocio.site', 'tiktok.com', 'youtube.com', 'x.com', 'twitter.com']

/** Dominio sin www ni ruta; null para redes sociales y perfiles de Google. */
export function dominioDe(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const h = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.toLowerCase().replace(/^www\./, '')
    if (!h.includes('.') || DOMINIOS_GENERICOS.some((g) => h === g || h.endsWith(`.${g}`))) return null
    return h
  } catch {
    return null
  }
}

export function soloDigitos(tel: string | null | undefined): string {
  const d = (tel ?? '').replace(/\D/g, '')
  return d.length > 10 ? d.slice(-10) : d
}

/** Teléfono como lo guarda el CRM: "33 1234 5678". */
export function formatoTelefono(tel: string | null | undefined): string | null {
  const d = soloDigitos(tel)
  if (d.length !== 10) return tel?.trim() || null
  return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`
}

export function nombreNormalizado(s: string | null | undefined): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\b(s a de c v|s a|s de r l( de c v)?|s c|de c v|c v|sapi de cv|sa de cv)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Nombre limpio: sin lemas tras "|", sin "(Sucursal ...)" ni emojis. */
export function limpiarNombre(s: string | null | undefined): string {
  return (s ?? '')
    .split('|')[0]
    .replace(/\((sucursal|suc\.?|matriz|plaza|local)[^)]*\)/gi, '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/,\s*(la|el)\s+(constructora|despacho|clínica|clinica|inmobiliaria)\b.*$/i, '')
    .replace(/\s+/g, ' ')
    .replace(/[\s\-–—·,]+$/, '')
    .trim()
}

export function candidatoDe(p: PlaceResult): Candidato {
  const sitio = p.websiteUri ?? null
  return {
    placeId: p.id,
    nombre: limpiarNombre(p.displayName?.text),
    direccion: p.formattedAddress ?? '',
    telefono: formatoTelefono(p.nationalPhoneNumber),
    sitio,
    dominio: dominioDe(sitio),
    rating: p.rating ?? null,
    resenas: p.userRatingCount ?? 0,
    tipo: p.primaryTypeDisplayName?.text ?? null,
    mapsUrl: p.googleMapsUri ?? null,
    enCrm: false,
  }
}

export interface ContactoExistente {
  company: string | null
  website_url: string | null
  phone: string | null
  email: string | null
}

/** Marca los candidatos que ya estan en el CRM: mismo dominio, mismo telefono o mismo nombre. */
export function marcarExistentes(candidatos: Candidato[], existentes: ContactoExistente[]): Candidato[] {
  const dominios = new Set(existentes.map((e) => dominioDe(e.website_url) ?? dominioDe(e.email ? `https://${e.email.split('@')[1]}` : null)).filter(Boolean))
  const telefonos = new Set(existentes.map((e) => soloDigitos(e.phone)).filter((d) => d.length === 10))
  const nombres = new Set(existentes.map((e) => nombreNormalizado(e.company)).filter((n) => n.length >= 4))
  return candidatos.map((c) => ({
    ...c,
    enCrm:
      (c.dominio !== null && dominios.has(c.dominio)) ||
      (soloDigitos(c.telefono).length === 10 && telefonos.has(soloDigitos(c.telefono))) ||
      nombres.has(nombreNormalizado(c.nombre)),
  }))
}

/** Quita duplicados dentro de una misma busqueda (Places repite lugares entre paginas). */
export function sinRepetidos(candidatos: Candidato[]): Candidato[] {
  const vistos = new Set<string>()
  return candidatos.filter((c) => {
    // Mismo lugar, mismo dominio o mismo nombre (sucursales): una sola vez.
    const claves = [c.placeId && `id:${c.placeId}`, c.dominio && `dom:${c.dominio}`, `nom:${nombreNormalizado(c.nombre)}`].filter(Boolean) as string[]
    if (claves.some((k) => vistos.has(k))) return false
    claves.forEach((k) => vistos.add(k))
    return true
  })
}

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi
const CORREOS_BASURA = /(noreply|no-reply|donotreply|example|sentry|wixpress|godaddy|squarespace|shopify|wordpress|@2x|\.png$|\.jpg$|\.svg$|\.webp$|\.gif$|^(usuario|correo|email|nombre|tu-?correo|tu-?email|ejemplo|test|john\.?doe|jane\.?doe|lorem|ipsum|your-?name|your-?email|someone|user|username|mail)@|@(dominio|tudominio|ejemplo|correo|email|test|sitio|demoagency|yourdomain|yoursite|yourcompany|domain|company|mysite|website)\.)/i
const PREFERIDOS = ['contacto', 'ventas', 'info', 'hola', 'informes', 'atencion', 'admin', 'direccion', 'gerencia']

/** Mejor correo de un HTML: del mismo dominio primero, luego el de prefijo mas util. */
export function extraerCorreo(html: string, dominio: string | null): string | null {
  // Un mailto con espacio codificado ("mailto:%20ventas@x.mx") dejaba el %20 pegado al correo
  // y el envio rebotaba (Piso Siete, 2026-10-08).
  const texto = html.replace(/%20/gi, ' ').replace(/&#64;|&commat;/g, '@').replace(/\s*\[at\]\s*|\s*\(at\)\s*/gi, '@').replace(/\s*\[dot\]\s*|\s*\(dot\)\s*/gi, '.')
  const todos = [...new Set((texto.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase()))].filter((e) => !CORREOS_BASURA.test(e) && !buzonNoComercial(e) && e.length < 80)
  if (todos.length === 0) return null
  const puntaje = (e: string) => {
    const [local, dom] = e.split('@')
    let s = 0
    if (dominio && (dom === dominio || dom.endsWith(`.${dominio}`))) s += 10
    const i = PREFERIDOS.indexOf(local)
    if (i >= 0) s += 5 - i * 0.3
    if (/gmail|hotmail|yahoo|outlook|live\.com/.test(dom)) s -= 2
    return s
  }
  return todos.sort((a, b) => puntaje(b) - puntaje(a))[0]
}

export function extraerInstagram(html: string): string | null {
  const m = html.match(/https?:\/\/(?:www\.)?instagram\.com\/([a-z0-9_.]{2,30})\/?/i)
  if (!m) return null
  const u = m[1].toLowerCase()
  if (['p', 'reel', 'explore', 'accounts', 'share', 'stories'].includes(u)) return null
  return `https://instagram.com/${u}`
}

/** Numero de Mexico en formato de WhatsApp (52 + 10 digitos); otros paises se dejan como vienen. */
function normalizarWhatsApp(digitos: string): string | null {
  const d = digitos.replace(/\D/g, '')
  if (d.length === 10) return `52${d}`
  if (d.length === 13 && d.startsWith('521')) return `52${d.slice(3)}`
  if (d.length >= 11 && d.length <= 13) return d
  return null
}

/**
 * WhatsApp que el negocio publica en su sitio: enlaces wa.me o api.whatsapp.com. A
 * diferencia del telefono de Google, este numero si es de WhatsApp y el negocio lo ofrece
 * para que le escriban.
 */
export function extraerWhatsApp(html: string): string | null {
  const texto = html.replace(/&amp;/g, '&')
  const re = /(?:wa\.me\/|(?:api|web)\.whatsapp\.com\/send\/?\?(?:[^"'\s>]*&)?phone=|whatsapp:\/\/send\?(?:[^"'\s>]*&)?phone=)(?:%2B|\+)?([\d][\d\s().-]{8,18}\d)/gi
  for (const m of texto.matchAll(re)) {
    const n = normalizarWhatsApp(m[1])
    if (n) return n
  }
  return null
}

/** Enlaces internos que suelen tener datos de contacto. */
export function enlacesDeContacto(html: string, base: string): string[] {
  const out = new Set<string>()
  for (const m of html.matchAll(/href=["']([^"'#?]+)["']/gi)) {
    const href = m[1]
    if (!/contact|contacto|nosotros|about|quienes|equipo|team|aviso|ubicacion|sucursal/i.test(href)) continue
    try {
      const u = new URL(href, base)
      if (dominioDe(u.href) === dominioDe(base)) out.add(u.href.split('#')[0])
    } catch {
      /* enlace invalido */
    }
    if (out.size >= 4) break
  }
  return [...out]
}

/** Fila lista para mapRowsToContacts, con el mismo formato que el CSV manual. */
/**
 * Colonias y plazas de la ZMG donde el negocio promedio tiene mas presupuesto. Sirve para
 * priorizar, no para descartar: un buen prospecto fuera de la lista sigue entrando.
 */
const ZONAS_PREMIUM = /puerta de hierro|andares|valle real|colinas de san javier|san javier|providencia|country club|lomas del valle|virreyes|royal country|zona real|jardines universidad|ciudad del sol|chapalita|vallarta norte|vallarta san jorge|monraz|terranova|lafayette|colonia americana|col\.? americana|bugambilias|santa anita|el palomar|rinconada del bosque|plaza patria|midtown|la rioja|solares/i

export function zonaPremium(direccion: string | null | undefined): boolean {
  return ZONAS_PREMIUM.test(direccion ?? '')
}

export function filaDesdeCandidato(c: Candidato, segmento: string): CsvRow {
  return {
    empresa: c.nombre,
    email: c.correo ?? '',
    telefono: c.telefono ?? '',
    instagram: c.instagram ?? '',
    whatsapp: c.whatsapp ?? '',
    sitio: c.sitio ?? '',
    segmento,
    zona: zonaPremium(c.direccion) ? 'zona-premium' : '',
    gancho: '',
  }
}
