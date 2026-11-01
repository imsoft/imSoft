import { cityServiceContent, cityServiceTitle, type CityKey, type CityServiceSlug } from '@/config/city-services';
import {
  CITY_LABELS,
  INDUSTRY_LABELS,
  LANDING_CITIES,
  LANDING_INDUSTRIES,
} from '@/config/landing-pages-index';
import type { City, Industry } from '@/types/landing-pages';

/**
 * Prefilled message of the floating WhatsApp button, depending on the page.
 *
 * The same text across the whole site wastes the one thing WhatsApp doesn't tell you: where
 * the person writing came from. With the context in the message itself, each conversation
 * arrives already knowing whether the interest was a website, an app or a specific industry,
 * with no analytics involved.
 *
 * Only the pages where the context changes the answer are named. For the
 * rest, the usual generic message.
 */

/**
 * Services named in the message. Not all 19 are here on purpose: these are the
 * ones that sell themselves, and a short list is a list that doesn't drift out of sync with the
 * `services` table. A slug that isn't here falls back to the generic message.
 */
const SERVICES: Record<string, { es: string; en: string }> = {
  'web-pages': { es: 'una página web', en: 'a website' },
  'aplicaciones-moviles': { es: 'una aplicación móvil', en: 'a mobile app' },
  'software-a-medida': { es: 'software a la medida', en: 'custom software' },
  'tiendas-en-linea': { es: 'una tienda en línea', en: 'an online store' },
  'consultoria-tecnologica': { es: 'consultoría tecnológica', en: 'technology consulting' },
  'inteligencia-artificial': { es: 'un proyecto de inteligencia artificial', en: 'an AI project' },
  'automatizacion-de-procesos': { es: 'automatizar procesos', en: 'process automation' },
  'diseno-ux-ui': { es: 'diseño UX/UI', en: 'UX/UI design' },
  'desarrollo-de-mvp': { es: 'desarrollar un MVP', en: 'building an MVP' },
};

const GENERIC = {
  es: 'Hola imSoft, me gustaría conocer más sobre sus servicios. ¿Podemos agendar una llamada?',
  en: 'Hi imSoft, I would like to learn more about your services. Can we schedule a call?',
};

const interestedIn = (lang: 'es' | 'en', topic: string) =>
  lang === 'es'
    ? `Hola imSoft, los encontré en su sitio y me interesa ${topic}. ¿Podemos platicar?`
    : `Hi imSoft, I found you on your site and I'm interested in ${topic}. Can we talk?`;

export function whatsAppMessage(pathname: string, lang: string): string {
  const l: 'es' | 'en' = lang === 'en' ? 'en' : 'es';

  // Strip the language prefix to reason only about the route.
  const route = pathname.replace(/^\/(es|en)(?=\/|$)/, '') || '/';
  const segments = route.split('/').filter(Boolean);

  // /services/<slug>
  if (segments[0] === 'services' && segments[1]) {
    const service = SERVICES[segments[1]];
    if (service) return interestedIn(l, service[l]);
  }

  // /<city>/<service> ("paginas web guadalajara"...)
  const cs = cityServiceContent(segments[0] ?? '', segments[1] ?? '');
  if (cs) {
    const topic = cityServiceTitle(segments[0] as CityKey, segments[1] as CityServiceSlug).toLowerCase();
    return l === 'es'
      ? `Hola imSoft, vi su página de ${topic} y me interesa. ¿Podemos platicar?`
      : `Hi imSoft, I saw your page about ${topic} and I am interested. Can we talk?`;
  }

  // /zapopan/paginas-web
  if (segments[0] === 'zapopan' && segments[1] === 'paginas-web') {
    return l === 'es'
      ? 'Hola imSoft, vi su página de páginas web en Zapopan y me interesa. ¿Podemos platicar?'
      : 'Hi imSoft, I saw your Zapopan web design page and I am interested. Can we talk?';
  }

  // /<city>/<industry>
  if (
    LANDING_CITIES.includes(segments[0] as City) &&
    LANDING_INDUSTRIES.includes(segments[1] as Industry)
  ) {
    const city = CITY_LABELS[segments[0] as City][l];
    const industry = INDUSTRY_LABELS[segments[1] as Industry][l].toLowerCase();
    return l === 'es'
      ? `Hola imSoft, vi su página de software para ${industry} en ${city}. Me gustaría platicar sobre un proyecto.`
      : `Hi imSoft, I saw your page about software for ${industry} in ${city}. I would like to talk about a project.`;
  }

  if (segments[0] === 'portfolio') {
    return l === 'es'
      ? 'Hola imSoft, estaba viendo su portafolio y me gustaría platicar sobre un proyecto.'
      : 'Hi imSoft, I was looking at your portfolio and would like to discuss a project.';
  }

  if (segments[0] === 'blog') {
    return l === 'es'
      ? 'Hola imSoft, llegué por un artículo de su blog y me gustaría platicar sobre un proyecto.'
      : 'Hi imSoft, I came from an article on your blog and would like to discuss a project.';
  }

  return GENERIC[l];
}
