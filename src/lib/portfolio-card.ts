/**
 * Convierte una fila de la tabla `portfolio` en lo que muestra la tarjeta de /portfolio.
 *
 * La lista solo enseñaba la frase corta de cada proyecto y Google la marcó como
 * "rastreada, sin indexar" por contenido delgado. El reto y los resultados ya estaban
 * en la base de datos (los usa la ficha de detalle); aqui se sacan tambien a la lista.
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
  /** Segmento de URL de la ficha: el slug con nombre, o el id si no hay slug. */
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

/** Con tres basta para dar sustancia a la tarjeta sin volverla una ficha completa. */
export const MAX_RESULTADOS_EN_TARJETA = 3;

const IMAGEN_POR_DEFECTO =
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop';

function porIdioma(lang: string, es?: string | null, en?: string | null, neutro?: string | null) {
  const orden = lang === 'en' ? [en, es, neutro] : [es, en, neutro];
  return orden.find((v) => typeof v === 'string' && v.trim() !== '')?.trim() ?? '';
}

export function portfolioCard(row: PortfolioRow, lang: string): PortfolioCard {
  const results = (lang === 'en' ? row.results_en : row.results_es) ?? [];
  const challenge = porIdioma(lang, row.challenge_es, row.challenge_en);
  return {
    id: row.id,
    slug: row.slug?.trim() || row.id,
    title: porIdioma(lang, row.title_es, row.title_en, row.title),
    description: porIdioma(lang, row.description_es, row.description_en, row.description),
    challenge: challenge || null,
    results: results.filter((r) => typeof r === 'string' && r.trim() !== '').slice(0, MAX_RESULTADOS_EN_TARJETA),
    image: row.image_url || IMAGEN_POR_DEFECTO,
    project_url: row.project_url ?? undefined,
    client: row.client?.trim() || null,
    year: row.year ?? null,
  };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Por que columna buscar la ficha. Las URLs viejas llevan el uuid y las nuevas el slug;
 * mandar un slug a la columna `id` hace que Postgres falle ("invalid input syntax for
 * type uuid") y la ficha devolvia 404.
 */
export function portfolioLookup(segment: string): { column: 'id' | 'slug'; value: string } {
  const value = segment.trim();
  return { column: UUID.test(value) ? 'id' : 'slug', value };
}
