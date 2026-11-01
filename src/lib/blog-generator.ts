/**
 * Pure logic of the automatic blog generator (scripts/generate-blog.mjs).
 *
 * Everything that can be tested without network lives here: picking the next topic in the
 * queue, building slugs, measuring overlap with already published titles and checking that
 * the article meets the sourcing rules before publishing it.
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

/** First queue entry whose slug (es or en) doesn't exist yet in the blog table. */
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
  // Framing words of the "cuanto cuesta X" series: they don't tell one topic from another.
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

/** Overlap of meaningful words between two titles (0 to 1). */
export function titleOverlap(a: string, b: string): number {
  const A = titleFingerprint(a);
  const B = titleFingerprint(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const w of A) if (B.has(w)) shared += 1;
  return shared / Math.min(A.size, B.size);
}

/** Maximum overlap tolerated with an already published title. */
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

/** Paragraphs and list items that contain a "data" figure: percentage, money or "según". */
/** "Data" numbers as they appear: 5,000 / 15.5% / not 2026, years don't count. */
const NUMBER_PATTERN = /(?<!\d)(?:\d{1,3}(?:[.,]\d{3})+|\d+(?:[.,]\d+)?)(?:\s?%)?(?!\d)/g;
const FIGURE_PATTERN = /\d+(?:[.,]\d+)?\s?%|\$\s?\d|\bmxn\b|\busd\b|\bseg[uú]n\b|\bde acuerdo (?:a|con)\b/i;

/**
 * Rules an article must meet before being published. Returns the list of
 * problems; empty means it passes.
 *
 * The core rule: every figure must come with a link to the source in the
 * same paragraph or list item. The previous generator asked for "concrete data" without
 * sources and the model made it up ("segun datos de 2026, el 80%...").
 */
/**
 * Puts the article HTML in the shape the validator and the site expect: attributes in
 * double quotes and no escaped quotes. The model sometimes returns href='...' or
 * href=\\"...\\" (it happened on the 2026-10-03 retry) and the validator, which only saw
 * href="...", concluded the article linked no source at all.
 */
export function normalizeHtml(html: string): string {
  return (html ?? '')
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/(\s(?:href|src|target|rel|class|title|alt)=)'([^'<>]*)'/gi, '$1"$2"');
}

/** Normalizes both languages of the article. */
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

  // Each block with a figure needs its link in the same block, unless the figure already
  // appeared earlier in a block with a source (repeating it while arguing is legitimate).
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
    const attributionOnly = figures.length === 0; // "según…" without a number does not pass without a link either
    if (!alreadyCited || attributionOnly) {
      problems.push(`${lang}: cifra sin fuente enlazada en el mismo párrafo: "${text.slice(0, 90)}…"`);
    }
  }

  return problems;
}
