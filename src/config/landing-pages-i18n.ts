import type { City, Industry, LandingPageData } from '@/types/landing-pages';
import { landingPagesData } from './landing-pages-data';

/**
 * Traducciones al ingles de las landings ciudad + industria.
 *
 * `landingPagesData` solo tiene español. Mientras una combinacion no este aqui, la ruta
 * /en/... sigue existiendo pero se marca como no traducida: canonicaliza a la version
 * /es/, se cae del sitemap en ingles y no declara hreflang propio. Asi Google consolida
 * la señal en una sola URL en vez de ver 15 duplicados.
 *
 * Al añadir una traduccion basta con rellenar la entrada: la pagina, el sitemap y el
 * hreflang se activan solos.
 */
export const landingPagesDataEn: Partial<Record<City, Partial<Record<Industry, LandingPageData>>>> = {};

export interface ResolvedLanding {
  data: LandingPageData;
  /** false cuando se pidio /en pero solo existe el contenido en español. */
  isTranslated: boolean;
  /** Idioma real del contenido que se va a renderizar. */
  contentLang: 'es' | 'en';
}

export function resolveLandingContent(
  lang: string,
  city: City,
  industry: Industry,
): ResolvedLanding | null {
  const es = landingPagesData[city]?.[industry];
  if (!es) return null;

  if (lang !== 'en') {
    return { data: es, isTranslated: true, contentLang: 'es' };
  }

  const en = landingPagesDataEn[city]?.[industry];
  return en
    ? { data: en, isTranslated: true, contentLang: 'en' }
    : { data: es, isTranslated: false, contentLang: 'es' };
}

export function hasEnglishLanding(city: City, industry: Industry): boolean {
  return Boolean(landingPagesDataEn[city]?.[industry]);
}
