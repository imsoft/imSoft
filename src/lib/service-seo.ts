import { truncateDescription } from './seo';
import { BUSINESS } from '@/config/business';

/**
 * Local titles and descriptions for the service pages.
 *
 * The 19 /services/<slug> pages were titled with just the service name
 * ("Páginas Web | imSoft"), with no geographic signal, so they didn't compete for the
 * queries that do have commercial intent ("desarrollo web en Guadalajara").
 *
 * The existing pages are optimized instead of creating a variant per city:
 * duplicating the URL would put two of our own pages fighting for the same query, which is
 * exactly the cannibalization problem that already cost removing 36 blog articles.
 */

const CITY_ES = 'Guadalajara';

/**
 * Verb each service is named with in the title. Not all of them are "desarrollo":
 * paid media or video production aren't "developed", and forcing it sounds like a template.
 */
const PREFIX_ES: Record<string, string> = {
  'web-pages': 'Desarrollo de',
  'aplicaciones-web': 'Desarrollo de',
  'aplicaciones-moviles': 'Desarrollo de',
  'software-a-medida': 'Desarrollo de',
  'tiendas-en-linea': 'Desarrollo de',
  'desarrollo-de-mvp': '',
  'desarrollo-seguro': '',
  'integraciones-de-sistemas': '',
  'automatizacion-de-procesos': '',
  'inteligencia-artificial': '',
  'data-analysis': '',
  'diseno-ux-ui': '',
  'consultoria-tecnologica': '',
  'mantenimiento-y-soporte': '',
};

const PREFIX_EN: Record<string, string> = {
  'web-pages': 'Web Development',
  'aplicaciones-web': 'Web App Development',
  'aplicaciones-moviles': 'Mobile App Development',
  'software-a-medida': 'Custom Software Development',
  'tiendas-en-linea': 'E-commerce Development',
};

/** "Desarrollo de Páginas Web en Guadalajara", or "Paid Media en Guadalajara". */
export function localizedServiceTitle(slug: string, title: string, lang: string): string {
  if (!title) return title;
  if (lang === 'en') {
    const name = PREFIX_EN[slug] || title;
    return `${name} in Guadalajara, Mexico`;
  }
  const prefix = PREFIX_ES[slug] ?? '';
  return `${prefix ? `${prefix} ` : ''}${title} en ${CITY_ES}`;
}

/**
 * Meta description with a local signal. The city is prepended to the service's real
 * description instead of replacing it, so nothing the offer already describes is lost.
 */
export function localizedServiceDescription(description: string, lang: string): string {
  const clean = (description || '').replace(/\s+/g, ' ').trim();
  const lead =
    lang === 'en'
      ? 'Software agency based in Guadalajara, Jalisco. '
      : `Agencia de software en ${CITY_ES}, Jalisco. `;
  // Google's useful limit is around 155 characters.
  return truncateDescription(`${lead}${clean}`);
}

/** Service area as text, for the visible local block of the page. */
export function serviceAreaSentence(lang: string): string {
  return lang === 'en'
    ? 'We work with companies across the Guadalajara metro area — Zapopan, Tlaquepaque, Tonalá and Tlajomulco — and remotely throughout Mexico. We are available Monday to Saturday from 09:00 to 18:00, and Sundays from 09:00 to 13:00.'
    : `Trabajamos con empresas de toda la Zona Metropolitana de ${CITY_ES}: Zapopan, Tlaquepaque, Tonalá y Tlajomulco, y en remoto con el resto de México. Atendemos de lunes a sábado de ${BUSINESS.openingHours[0].opens} a ${BUSINESS.openingHours[0].closes}, y los domingos de ${BUSINESS.openingHours[1].opens} a ${BUSINESS.openingHours[1].closes}.`;
}
