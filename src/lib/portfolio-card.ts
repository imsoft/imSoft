/**
 * Turns a row of the `portfolio` table into what the /portfolio card shows.
 *
 * The list only showed each project's short sentence and Google flagged it as
 * "crawled, not indexed" for thin content. The challenge and results were already
 * in the database (the detail page uses them); here they're brought to the list too.
 */

export interface PortfolioRow {
  id: string;
  slug?: string | null;
  title?: string | null;
  title_es?: string | null;
  title_en?: string | null;
  description?: string | null;
  description_es?: string | null;
  description_en?: string | null;
  challenge_es?: string | null;
  challenge_en?: string | null;
  results_es?: string[] | null;
  results_en?: string[] | null;
  image_url?: string | null;
  project_url?: string | null;
  client?: string | null;
  year?: number | null;
}

export interface PortfolioCard {
  id: string;
  /** URL segment of the detail page: the named slug, or the id if there's no slug. */
  slug: string;
  title: string;
  description: string;
  challenge: string | null;
  results: string[];
  image: string;
  project_url?: string;
  client: string | null;
  year: number | null;
}

/** Three are enough to give the card substance without turning it into a full detail page. */
export const MAX_CARD_RESULTS = 3;

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop';

function byLang(lang: string, es?: string | null, en?: string | null, neutral?: string | null) {
  const order = lang === 'en' ? [en, es, neutral] : [es, en, neutral];
  return order.find((v) => typeof v === 'string' && v.trim() !== '')?.trim() ?? '';
}

export function portfolioCard(row: PortfolioRow, lang: string): PortfolioCard {
  const results = (lang === 'en' ? row.results_en : row.results_es) ?? [];
  const challenge = byLang(lang, row.challenge_es, row.challenge_en);
  return {
    id: row.id,
    slug: row.slug?.trim() || row.id,
    title: byLang(lang, row.title_es, row.title_en, row.title),
    description: byLang(lang, row.description_es, row.description_en, row.description),
    challenge: challenge || null,
    results: results.filter((r) => typeof r === 'string' && r.trim() !== '').slice(0, MAX_CARD_RESULTS),
    image: row.image_url || DEFAULT_IMAGE,
    project_url: row.project_url ?? undefined,
    client: row.client?.trim() || null,
    year: row.year ?? null,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Which column to look up the detail page by. Old URLs carry the uuid and new ones the slug;
 * sending a slug to the `id` column makes Postgres fail ("invalid input syntax for
 * type uuid") and the detail page returned 404.
 */
export function portfolioLookup(segment: string): { column: 'id' | 'slug'; value: string } {
  const value = segment.trim();
  return { column: UUID.test(value) ? 'id' : 'slug', value };
}

/**
 * Meta description of the detail page. Several descriptions are one line ("Aplicacion web
 * para la generacion de pedidos"): it's completed with the challenge to reach a useful length.
 * generateMetadata trims it to ~155.
 */
export function portfolioMetaDescription(row: PortfolioRow, lang: string): string {
  const description = byLang(lang, row.description_es, row.description_en, row.description);
  const challenge = byLang(lang, row.challenge_es, row.challenge_en);
  return description.length >= 70 || !challenge ? description : `${description.replace(/\.?$/, '.')} ${challenge}`;
}
