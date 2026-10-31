/**
 * Logica pura del generador automatico del blog (scripts/generate-blog.mjs).
 *
 * Aqui vive todo lo que se puede probar sin red: elegir el siguiente tema de la cola,
 * construir slugs, medir el solapamiento con titulos ya publicados y validar que el
 * articulo cumpla las reglas de fuentes antes de publicarlo.
 */

export interface QueueTopic {
  slug_es: string;
  slug_en: string;
  query: string;
  angle: string;
  category: string;
}

export interface ArticleSource {
  url: string;
  title: string;
  supports: string;
}

export interface GeneratedArticle {
  title_es: string;
  title_en: string;
  excerpt_es: string;
  excerpt_en: string;
  content_es: string;
  content_en: string;
  sources: ArticleSource[];
}

/** Primera entrada de la cola cuyo slug (es o en) no exista todavia en la tabla blog. */
export function pickNextTopic(queue: QueueTopic[], existingSlugs: Iterable<string>): QueueTopic | null {
  const used = new Set(Array.from(existingSlugs).filter(Boolean));
  return queue.find((t) => !used.has(t.slug_es) && !used.has(t.slug_en)) ?? null;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 80);
}

const STOP = new Set([
  'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'para', 'por', 'que', 'tu', 'tus', 'en', 'y', 'o',
  'como', 'cual', 'sin', 'con', 'mas', 'the', 'a', 'an', 'of', 'for', 'to', 'your', 'in', 'and', 'or',
  'how', 'what', 'why', 'without', 'with', 'more', 'es', 'is', 'al', 'lo', 'se',
  // Palabras de encuadre de la serie "cuanto cuesta X": no distinguen un tema de otro.
  'cuanto', 'cuesta', 'cuestan', 'costo', 'costos', 'precio', 'precios', 'rangos', 'reales', 'real',
  'mexico', 'guia', 'much', 'does', 'cost', 'costs', 'price', 'prices', 'ranges', 'mexican',
  '2025', '2026', '2027',
]);

function titleFingerprint(title: string): Set<string> {
  return new Set(
    (title || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

/** Solapamiento de palabras significativas entre dos titulos (0 a 1). */
export function titleOverlap(a: string, b: string): number {
  const A = titleFingerprint(a);
  const B = titleFingerprint(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared += 1;
  return shared / Math.min(A.size, B.size);
}

/** Solapamiento maximo tolerado con un titulo ya publicado. */
export const MAX_TITLE_OVERLAP = 0.6;
export const MIN_SOURCES = 2;
export const MIN_WORDS = 900;
export const MAX_WORDS = 1600;

const OWN_DOMAINS = ['imsoft.io', 'wa.me'];

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function isExternal(url: string): boolean {
  const h = hostOf(url);
  return !!h && !OWN_DOMAINS.some((d) => h === d || h.endsWith(`.${d}`));
}

export function plainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(html: string): number {
  const t = plainText(html);
  return t ? t.split(' ').length : 0;
}

/** Parrafos y elementos de lista que contienen una cifra "de dato": porcentaje, dinero o "segun". */
/** Números "de dato" tal como aparecen: 5,000 / 15.5% / 2026 no, los años no cuentan. */
const NUMBER_PATTERN = /(?<!\d)(?:\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(?:\s?%)?(?!\d)/g;
const FIGURE_PATTERN = /\d+(?:[.,]\d+)?\s?%|\$\s?\d|\bmxn\b|\busd\b|\bseg[uú]n\b|\bde acuerdo (?:a|con)\b/i;

/**
 * Reglas que un articulo debe cumplir antes de publicarse. Devuelve la lista de
 * problemas; vacia significa que pasa.
 *
 * La regla central: toda cifra tiene que ir acompanada de un enlace a la fuente en el
 * mismo parrafo o item de lista. El generador anterior pedia "datos concretos" sin
 * fuentes y el modelo se los inventaba ("segun datos de 2026, el 80%...").
 */
/**
 * Deja el HTML del articulo en la forma que espera el validador y el sitio: atributos con
 * comillas dobles y sin comillas escapadas. El modelo a veces entrega href='...' o
 * href=\\"...\\" (paso en el reintento del 3-oct-2026) y el validador, que solo veia
 * href="...", concluia que el articulo no enlazaba ninguna fuente.
 */
export function normalizeHtml(html: string): string {
  return (html ?? '')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/(\s(?:href|src|target|rel|class|title|alt)=)'([^'<>]*)'/gi, '$1"$2"');
}

/** Normaliza los dos idiomas del articulo. */
export function normalizeArticle<T extends { content_es: string; content_en: string }>(a: T): T {
  return { ...a, content_es: normalizeHtml(a.content_es), content_en: normalizeHtml(a.content_en) };
}

export function validateArticle(
  article: GeneratedArticle,
  lang: 'es' | 'en',
): string[] {
  const problems: string[] = [];
  const html = normalizeHtml(lang === 'es' ? article.content_es : article.content_en);
  const title = lang === 'es' ? article.title_es : article.title_en;
  const excerpt = lang === 'es' ? article.excerpt_es : article.excerpt_en;

  if (!title || title.length > 70) problems.push(`${lang}: título vacío o de más de 70 caracteres (${title?.length ?? 0})`);
  if (!excerpt || excerpt.length > 160) problems.push(`${lang}: extracto vacío o de más de 160 caracteres (${excerpt?.length ?? 0})`);
  if (/<h1[\s>]/i.test(html)) problems.push(`${lang}: el contenido trae <h1>; el título ya es el h1 de la página`);
  if (/```|^#{1,6}\s/m.test(html)) problems.push(`${lang}: el contenido trae markdown en vez de HTML`);

  const words = countWords(html);
  if (words < MIN_WORDS || words > MAX_WORDS) {
    problems.push(`${lang}: ${words} palabras; se esperan entre ${MIN_WORDS} y ${MAX_WORDS}`);
  }

  const sourceUrls = new Set(article.sources.map((f) => f.url));
  if (article.sources.length < MIN_SOURCES) problems.push(`solo ${article.sources.length} fuentes; mínimo ${MIN_SOURCES}`);
  for (const f of article.sources) {
    if (!isExternal(f.url)) problems.push(`fuente que no es externa: ${f.url}`);
  }

  const links = Array.from(html.matchAll(/<a\s[^>]*href="([^"]+)"/gi), (m) => m[1]);
  const external = links.filter(isExternal);
  if (external.length === 0) problems.push(`${lang}: el contenido no enlaza ninguna fuente`);
  for (const url of external) {
    if (!sourceUrls.has(url)) problems.push(`${lang}: enlace a ${url} que no está declarado en fuentes`);
  }
  for (const f of article.sources) {
    if (!links.includes(f.url)) problems.push(`${lang}: la fuente ${f.url} está declarada pero no se enlaza en el texto`);
  }

  // Cada bloque con cifra necesita su enlace en el mismo bloque, salvo que la cifra ya
  // haya aparecido antes en un bloque con fuente (repetirla al argumentar es legítimo).
  const blocks = Array.from(html.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi), (m) => m[2]);
  const sourcedFigures = new Set<string>();
  for (const b of blocks) {
    const text = plainText(b);
    const figures = text.match(NUMBER_PATTERN) ?? [];
    const hasLink = /<a\s[^>]*href="https?:\/\//i.test(b);
    if (hasLink) {
      for (const c of figures) sourcedFigures.add(c);
      continue;
    }
    if (!FIGURE_PATTERN.test(text)) continue;
    const alreadyCited = figures.length > 0 && figures.every((c) => sourcedFigures.has(c));
    const attributionOnly = figures.length === 0; // "según…" sin número tampoco pasa sin enlace
    if (!alreadyCited || attributionOnly) {
      problems.push(`${lang}: cifra sin fuente enlazada en el mismo párrafo: "${text.slice(0, 90)}…"`);
    }
  }

  return problems;
}
