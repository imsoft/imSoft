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
  // Los Altos: capital nacional del huevo y del cerdo; a 80 km, pero sus granjas y empacadoras no estan en la ZMG.
  tepatitlan: { nombre: 'Tepatitlán de Morelos', lat: 20.8167, lng: -102.7667, radio: 25000 },
}

/** Giros que suelen comprar software a la medida, con la consulta que mejor funciona en Places. */
export const GIROS: { clave: string; nombre: string; query: string; segmento: string }[] = [
  { clave: 'wholesale-market', nombre: 'Mercado de Abastos y mayoristas', query: 'distribuidora mayorista abarrotes frutas verduras Mercado de Abastos', segmento: 'wholesale-market' },
  // Las bodegas del Mercado de Abastos por tipo de producto; Places no las saca con la consulta general.
  { clave: 'wholesalers', nombre: 'Bodegas mayoristas (cárnicos, lácteos, desechables)', query: 'distribuidora mayorista cárnicos lácteos desechables', segmento: 'wholesale-market' },
  { clave: 'logistics', nombre: 'Logística y agencias aduanales', query: 'agencia aduanal empresa de logística transporte de carga', segmento: 'logistics' },
  { clave: 'law-firms', nombre: 'Despachos de abogados', query: 'despacho de abogados bufete jurídico', segmento: 'law-firms' },
  { clave: 'accounting', nombre: 'Despachos contables', query: 'despacho contable contadores públicos', segmento: 'accounting' },
  { clave: 'health', nombre: 'Hospitales y clínicas', query: 'hospital privado clínica de especialidades', segmento: 'health' },
  { clave: 'dental', nombre: 'Clínicas dentales', query: 'clínica dental', segmento: 'health' },
  { clave: 'restaurants', nombre: 'Restaurantes', query: 'restaurante', segmento: 'restaurants' },
  { clave: 'ecommerce', nombre: 'Tiendas y boutiques (ecommerce)', query: 'boutique tienda de ropa calzado', segmento: 'ecommerce' },
  // Se concentran en el Centro Joyero y San Juan de Dios; su oferta es tienda en linea, no app.
  { clave: 'jewelry', nombre: 'Joyerías y centros joyeros', query: 'joyería centro joyero', segmento: 'jewelry' },
  { clave: 'construction', nombre: 'Constructoras', query: 'empresa constructora', segmento: 'construction' },
  // Agro: en la ZMG estan las oficinas, distribuidoras y empacadoras; las granjas, en Los Altos.
  { clave: 'agro', nombre: 'Agroindustria, empacadoras y distribuidoras agrícolas', query: 'empacadora comercializadora agrícola distribuidora agroquímicos semillas forrajes', segmento: 'agro' },
  { clave: 'farms', nombre: 'Granjas avícolas y porcícolas', query: 'granja avícola huevo', segmento: 'agro' },
  { clave: 'hardware-stores', nombre: 'Ferreterías y distribuidores industriales', query: 'ferretería industrial distribuidor', segmento: 'hardware-stores' },
  { clave: 'real-estate', nombre: 'Inmobiliarias', query: 'inmobiliaria bienes raíces', segmento: 'real-estate' },
  { clave: 'fitness', nombre: 'Gimnasios', query: 'gimnasio', segmento: 'fitness' },
  { clave: 'schools', nombre: 'Escuelas privadas', query: 'colegio privado escuela particular', segmento: 'schools' },
  { clave: 'auto-repair-shops', nombre: 'Talleres y refaccionarias', query: 'taller mecánico refaccionaria', segmento: 'automotive' },
  { clave: 'aesthetic-clinics', nombre: 'Clínicas de estética y spa', query: 'clínica de estética spa', segmento: 'health' },
  // Para buscar empresas grandes por nombre ("Grupo Dalton") con la busqueda propia.
  { clave: 'corporate', nombre: 'Empresas grandes y corporativos', query: 'corporativo oficinas corporativas', segmento: 'corporate' },
]

/** Negocios que salen en las busquedas pero no compran software a la medida (notarias, bufetes gratuitos, dependencias). */
const NOMBRES_FUERA = /\b(notar[ií]a|notario|bufete jur[ií]dico gratuito|defensor[ií]a|procuradur[ií]a|juzgado|tribunal|iteso|universidad|udg|imss|issste|secretar[ií]a de)\b/i

export function fueraDePerfil(nombre: string): boolean {
  return NOMBRES_FUERA.test(nombre)
}

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
  /** Pagina de Facebook hallada por busqueda web (fuente de telefono y correo, no canal). */
  facebook?: string | null
  /** Directivo hallado en LinkedIn (solo corporativos). */
  contacto?: ContactoLinkedIn | null
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
 * El telefono de Google como posible WhatsApp (52 + 10 digitos). En Mexico no se distingue
 * un fijo de un celular por el numero, asi que muchos no tendran WhatsApp: la tanda de
 * redes los detecta al enviar y los descarta. Los 800/900 nunca son WhatsApp.
 */
export function telefonoParaWhatsApp(telefono: string | null | undefined): string | null {
  let d = (telefono ?? '').replace(/\D/g, '')
  if (d.length === 13 && d.startsWith('521')) d = d.slice(3)
  else if (d.length === 12 && d.startsWith('52')) d = d.slice(2)
  if (d.length !== 10) return null
  if (/^(800|900|01)/.test(d)) return null
  if (/^(\d)\1+$/.test(d) || d === '1234567890') return null
  return `52${d}`
}

/**
 * Un candidato entra al CRM si hay por donde escribirle: correo, Instagram, el WhatsApp que
 * publica en su sitio o su telefono de Google. Antes el telefono solo no bastaba (23-sep-2026),
 * pero asi entraban 10 de 214 negocios nuevos por corrida: casi ninguno publica contacto en su
 * sitio. Desde el 26-oct-2026 el telefono cuenta (decision de Brandon) y la tanda de WhatsApp
 * descarta los fijos al enviar.
 */
export function sePuedeEscribir(c: Pick<Candidato, 'correo' | 'instagram' | 'whatsapp'> & { telefono?: string | null }): boolean {
  return Boolean((c.correo ?? '').trim() || (c.instagram ?? '').trim() || (c.whatsapp ?? '').trim() || telefonoParaWhatsApp(c.telefono))
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
const CORREOS_BASURA = /(noreply|no-reply|donotreply|example|sentry|wixpress|godaddy|squarespace|shopify|wordpress|@2x|\.png$|\.jpg$|\.svg$|\.webp$|\.gif$|^(usuario|correo|email|nombre|tu-?correo|tu-?email|ejemplo|test|john\.?doe|jane\.?doe|lorem|ipsum|your-?name|your-?email|someone|user|username|mail|sample|demo|name|your-?mail|prueba|placeholder|abc|xyz|first\.?last|firstname\.?lastname)@|@(dominio|tudominio|ejemplo|correo|email|test|sitio|demoagency|yourdomain|yoursite|yourcompany|domain|company|mysite|website)\.)/i
const PREFERIDOS = ['contacto', 'ventas', 'info', 'hola', 'informes', 'atencion', 'admin', 'direccion', 'gerencia']

/** Mejor correo de un HTML: del mismo dominio primero, luego el de prefijo mas util. */
export function extraerCorreo(html: string, dominio: string | null): string | null {
  // Un mailto con espacio codificado ("mailto:%20ventas@x.mx") dejaba el %20 pegado al correo
  // y el envio rebotaba (Piso Siete, 2026-10-08).
  const texto = html.replace(/%20/gi, ' ').replace(/&#64;|&commat;/g, '@').replace(/\s*\[at\]\s*|\s*\(at\)\s*/gi, '@').replace(/\s*\[dot\]\s*|\s*\(dot\)\s*/gi, '.')
  // "placejoys.com@gmail.com" o "33123456@..." son texto pegado, no buzones (rebotes del 28-oct-2026).
  const localRara = (e: string) => /\.(com|mx|net|org|io)@/.test(e) || /^\d+@/.test(e)
  const todos = [...new Set((texto.match(EMAIL_RE) ?? []).map((e) => e.toLowerCase()))].filter((e) => !CORREOS_BASURA.test(e) && !buzonNoComercial(e) && !localRara(e) && e.length < 80)
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

/**
 * Rutas de instagram.com que no son el perfil del negocio. "instagram" es el icono generico
 * que traen muchas plantillas de sitios: 7 de 24 prospectos llegaron con ese perfil el
 * 23-oct-2026. Se toma el primer enlace que si sea un perfil.
 */
const RUTAS_INSTAGRAM_AJENAS = ['p', 'reel', 'reels', 'explore', 'accounts', 'share', 'stories', 'tv', 'instagram', 'about', 'legal', 'developer', 'direct', 'web']

/**
 * Instagram del negocio a partir de los resultados de una busqueda web ("Nombre Ciudad
 * instagram"). La mayoria de los negocios chicos no tiene sitio, asi que extraerInstagram
 * no les encuentra nada; Google si suele tener su perfil indexado (2026-10-29). Se acepta
 * un resultado solo si es un perfil (no un post) y su usuario o su titulo contienen alguna
 * palabra distintiva del nombre; "clinica" o "taller" solas no cuentan.
 */
const PALABRAS_GENERICAS = new Set(['clinica', 'dental', 'consultorio', 'taller', 'mecanico', 'automotriz', 'refaccionaria', 'restaurante', 'restaurant', 'cafe', 'cafeteria', 'ferreteria', 'ferretera', 'grupo', 'servicio', 'servicios', 'centro', 'casa', 'bienes', 'raices', 'inmobiliaria', 'constructora', 'construccion', 'construcciones', 'despacho', 'abogados', 'contadores', 'contable', 'spa', 'gym', 'fitness', 'estetica', 'belleza', 'salon', 'tienda', 'boutique', 'joyeria', 'distribuidora', 'comercializadora', 'industrial', 'contador', 'contadores', 'publico', 'publicos', 'hospital', 'abarrotes', 'carniceria', 'cremeria', 'guadalajara', 'zapopan', 'tlaquepaque', 'tonala', 'tlajomulco', 'jalisco', 'mexico', 'sucursal', 'plaza', 'oficial', 'the', 'and', 'para', 'con', 'del', 'los', 'las', 'una', 'por'])

export function fichasDelNombre(nombre: string): string[] {
  return nombreNormalizado(nombre).split(' ').filter((t) => t.length >= 4 && !PALABRAS_GENERICAS.has(t))
}

const SENAS_LOCALES = /\b(guadalajara|gdl|zapopan|tlaquepaque|tonala|tlajomulco|el salto|jalisco|zmg|tepatitlan|los altos)\b/
const SUFIJOS_AJENOS = /(\.|_)(cl|co|ar|pe|ec|uy|ve|es|us|cr|gt|bo|py|do)$/

interface ResultadoWeb { link: string; title?: string | null; description?: string | null }

/**
 * Si un resultado de busqueda corresponde al negocio: alguna palabra distintiva del nombre
 * en el usuario o el titulo, y ademas seña de la zona en el texto o un usuario casi igual
 * al nombre (si sobra mucho tras quitar el nombre, es otro negocio parecido).
 */
function cuadraConElNegocio(nombre: string, usuario: string, r: ResultadoWeb, ciudad?: string): boolean {
  const fichas = fichasDelNombre(nombre)
  if (!fichas.length) return false
  const genericas = nombreNormalizado(nombre).split(' ').filter((t) => !fichas.includes(t))
  const plano = usuario.toLowerCase().replace(/[._-]/g, '')
  const titulo = nombreNormalizado(r.title ?? '').replace(/ /g, '')
  if (!fichas.some((f) => plano.includes(f) || titulo.includes(f))) return false
  let resto = plano
  for (const t of [...fichas, ...genericas]) resto = resto.replace(t, '')
  resto = resto.replace(/(mx|gdl|oficial|official|mexico|\d+)/g, '')
  const texto = nombreNormalizado(`${r.title ?? ''} ${r.description ?? ''} ${usuario.replace(/[._-]/g, ' ')}`)
  const local = SENAS_LOCALES.test(texto) || (ciudad ? texto.includes(nombreNormalizado(ciudad)) : false)
  return local || resto.length <= 3
}

export function instagramDeResultados(nombre: string, resultados: ResultadoWeb[], ciudad?: string): string | null {
  for (const r of resultados) {
    const m = /^https?:\/\/(?:www\.)?instagram\.com\/([a-z0-9_.]{2,30})\/?(?:[?#].*)?$/i.exec(r.link ?? '')
    if (!m) continue
    const usuario = m[1].toLowerCase()
    if (RUTAS_INSTAGRAM_AJENAS.includes(usuario) || SUFIJOS_AJENOS.test(usuario)) continue
    if (cuadraConElNegocio(nombre, usuario, r, ciudad)) return `https://instagram.com/${usuario}`
  }
  return null
}

const RUTAS_FACEBOOK_AJENAS = ['people', 'groups', 'events', 'pages', 'public', 'profile.php', 'login', 'share', 'watch', 'reel', 'marketplace', 'hashtag', 'search']

/**
 * Pagina de Facebook del negocio y, si el resumen de la busqueda los trae, su telefono y
 * correo. Facebook no es canal de prospeccion (no se escribe por Messenger); es la fuente
 * de datos para los negocios sin sitio que de otro modo quedarian fuera (2026-10-29).
 */
export function facebookDeResultados(nombre: string, resultados: ResultadoWeb[], ciudad?: string): { url: string; telefono: string | null; correo: string | null } | null {
  for (const r of resultados) {
    const m = /^https?:\/\/(?:www\.|m\.|es-la\.)?facebook\.com\/(?:p\/)?([A-Za-z0-9_.-]{2,80})\/?(?:[?#].*)?$/i.exec(r.link ?? '')
    if (!m) continue
    const slug = m[1]
    if (RUTAS_FACEBOOK_AJENAS.includes(slug.toLowerCase())) continue
    // "/p/Maroffa-Restaurante-61557672856757" trae el nombre; una pagina numerica solo trae el id.
    const usuario = /^\d+$/.test(slug) ? nombreNormalizado(r.title ?? '').replace(/ /g, '') : slug.replace(/-?\d{8,}$/, '')
    if (!cuadraConElNegocio(nombre, usuario, r, ciudad)) continue
    const desc = r.description ?? ''
    const tel = desc.match(/(?:\+?52\s?)?(?:\(?\d{2,3}\)?[\s.-]?)\d{3,4}[\s.-]?\d{4}\b/g)?.map((t) => t.replace(/\D/g, '')).map((d) => (d.length === 12 && d.startsWith('52') ? d.slice(2) : d)).find((d) => d.length === 10) ?? null
    return { url: `https://facebook.com/${slug}`, telefono: tel ? formatoTelefono(tel) : null, correo: extraerCorreo(desc, null) }
  }
  return null
}

export interface ContactoLinkedIn { nombre: string; apellido: string; cargo: string; url: string }

/** Cargos que deciden una compra de software, del mas al menos decisivo. */
const CARGOS_DECISION: RegExp[] = [
  /\b(director|directora|dueñ[oa]|propietari[oa]|fundador|fundadora|founder|ceo|presidente|administrador general|administradora general)\b/,
  /\b(gerente general|general manager|coo|cfo|cto|cio)\b/,
  /\b(gerente|jefe|jefa|coordinador|coordinadora|head)\b.*\b(sistemas|ti|it|tecnolog|operaciones|administraci|finanzas)/,
  /\b(gerente|subdirector|subdirectora|socio|socia)\b/,
]

/**
 * Directivo de la empresa a partir de los titulos de LinkedIn ("Nombre - Cargo - Empresa |
 * LinkedIn"). Solo para corporativos: ahi el correo generico no llega a nadie y el nombre
 * del director si. No se escribe por LinkedIn; se usa para el correo o la llamada.
 */
export function contactoLinkedInDeResultados(empresa: string, resultados: ResultadoWeb[]): ContactoLinkedIn | null {
  const fichas = fichasDelNombre(empresa)
  if (!fichas.length) return null
  let mejor: { rango: number; c: ContactoLinkedIn } | null = null
  for (const r of resultados) {
    if (!/^https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/in\//i.test(r.link ?? '')) continue
    const titulo = (r.title ?? '').replace(/\s*[|·-]\s*LinkedIn\s*$/i, '').trim()
    const partes = titulo.split(/\s+[-–]\s+/).map((x) => x.trim()).filter(Boolean)
    if (partes.length < 2) continue
    const persona = partes[0]
    const cargo = partes.length >= 3 ? partes.slice(1, -1).join(' - ') : ''
    const empresaTitulo = partes[partes.length - 1]
    const texto = nombreNormalizado(`${empresaTitulo} ${r.description ?? ''}`).replace(/ /g, '')
    if (!fichas.some((f) => texto.includes(f))) continue
    const cargoNorm = nombreNormalizado(cargo)
    const rango = CARGOS_DECISION.findIndex((re) => re.test(cargoNorm))
    if (rango < 0) continue
    if (/\b(driver|operador|chofer|auxiliar|practicante|becario|intern|asistente)\b/.test(cargoNorm)) continue
    if (!mejor || rango < mejor.rango) {
      const [nombre, ...resto] = persona.replace(/^(lic|ing|arq|dr|dra|mtro|mtra|c\.?p|lae|mba)\.?\s+/i, '').split(/\s+/)
      mejor = { rango, c: { nombre, apellido: resto.join(' '), cargo, url: r.link.replace(/\?.*$/, '') } }
    }
  }
  return mejor?.c ?? null
}

export function extraerInstagram(html: string): string | null {
  for (const m of html.matchAll(/https?:\/\/(?:www\.)?instagram\.com\/([a-z0-9_.]{2,30})\/?/gi)) {
    const u = m[1].toLowerCase()
    if (!RUTAS_INSTAGRAM_AJENAS.includes(u)) return `https://instagram.com/${u}`
  }
  return null
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

/**
 * Lo que Google sabe del negocio, en una linea, para que el primer mensaje hable de algo
 * real suyo ("4.8 con 200 reseñas", "dos sucursales") y no de una plantilla. Va en las
 * notas del contacto con el prefijo FICHA_GOOGLE; ganchoDesdeNotas la ignora.
 */
export const FICHA_GOOGLE = 'Google Maps:'

export function fichaGoogle(c: Pick<Candidato, 'rating' | 'resenas' | 'tipo' | 'direccion'>): string | null {
  const partes: string[] = []
  if (c.rating) partes.push(`${c.rating} estrellas (${c.resenas} reseñas)`)
  if (c.tipo) partes.push(c.tipo)
  if (c.direccion) partes.push(c.direccion.replace(/, M[ée]xico$/, '').replace(/\d{5}\s*/, ''))
  return partes.length ? `${FICHA_GOOGLE} ${partes.join(' · ')}` : null
}

export function filaDesdeCandidato(c: Candidato, segmento: string): CsvRow {
  return {
    empresa: c.nombre,
    nombre: c.contacto?.nombre ?? '',
    apellido: c.contacto?.apellido ?? '',
    puesto: c.contacto?.cargo ?? '',
    linkedin: c.contacto?.url ?? '',
    email: c.correo ?? '',
    telefono: c.telefono ?? '',
    instagram: c.instagram ?? '',
    whatsapp: c.whatsapp ?? '',
    facebook: c.facebook ?? '',
    sitio: c.sitio ?? '',
    segmento,
    zona: zonaPremium(c.direccion) ? 'premium-zone' : '',
    gancho: fichaGoogle(c) ?? '',
  }
}
