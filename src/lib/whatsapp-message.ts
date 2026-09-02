import {
  CITY_LABELS,
  INDUSTRY_LABELS,
  LANDING_CITIES,
  LANDING_INDUSTRIES,
} from '@/config/landing-pages-index';
import type { City, Industry } from '@/types/landing-pages';

/**
 * Mensaje precargado del boton flotante de WhatsApp, segun la pagina.
 *
 * El mismo texto en todo el sitio desaprovecha lo unico que WhatsApp no te dice: de
 * donde venia quien escribe. Con el contexto en el propio mensaje, cada conversacion
 * llega ya sabiendo si el interes era una pagina web, una app o una industria concreta,
 * sin analitica de por medio.
 *
 * Solo se nombran las paginas donde el contexto cambia lo que se responde. Para el
 * resto, el mensaje generico de siempre.
 */

/**
 * Servicios que se nombran en el mensaje. No estan los 19 a proposito: estos son los
 * que se venden solos, y una lista corta es una lista que no se desincroniza con la
 * tabla `services`. Un slug que no este aqui cae en el mensaje generico.
 */
const SERVICIOS: Record<string, { es: string; en: string }> = {
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

const GENERICO = {
  es: 'Hola imSoft, me gustaría conocer más sobre sus servicios. ¿Podemos agendar una llamada?',
  en: 'Hi imSoft, I would like to learn more about your services. Can we schedule a call?',
};

const interesa = (lang: 'es' | 'en', que: string) =>
  lang === 'es'
    ? `Hola imSoft, los encontré en su sitio y me interesa ${que}. ¿Podemos platicar?`
    : `Hi imSoft, I found you on your site and I'm interested in ${que}. Can we talk?`;

export function whatsAppMessage(pathname: string, lang: string): string {
  const l: 'es' | 'en' = lang === 'en' ? 'en' : 'es';

  // Se quita el prefijo de idioma para razonar solo sobre la ruta.
  const ruta = pathname.replace(/^\/(es|en)(?=\/|$)/, '') || '/';
  const partes = ruta.split('/').filter(Boolean);

  // /services/<slug>
  if (partes[0] === 'services' && partes[1]) {
    const servicio = SERVICIOS[partes[1]];
    if (servicio) return interesa(l, servicio[l]);
  }

  // /zapopan/paginas-web
  if (partes[0] === 'zapopan' && partes[1] === 'paginas-web') {
    return l === 'es'
      ? 'Hola imSoft, vi su página de páginas web en Zapopan y me interesa. ¿Podemos platicar?'
      : 'Hi imSoft, I saw your Zapopan web design page and I am interested. Can we talk?';
  }

  // /<ciudad>/<industria>
  if (
    LANDING_CITIES.includes(partes[0] as City) &&
    LANDING_INDUSTRIES.includes(partes[1] as Industry)
  ) {
    const ciudad = CITY_LABELS[partes[0] as City][l];
    const industria = INDUSTRY_LABELS[partes[1] as Industry][l].toLowerCase();
    return l === 'es'
      ? `Hola imSoft, vi su página de software para ${industria} en ${ciudad}. Me gustaría platicar sobre un proyecto.`
      : `Hi imSoft, I saw your page about software for ${industria} in ${ciudad}. I would like to talk about a project.`;
  }

  if (partes[0] === 'portfolio') {
    return l === 'es'
      ? 'Hola imSoft, estaba viendo su portafolio y me gustaría platicar sobre un proyecto.'
      : 'Hi imSoft, I was looking at your portfolio and would like to discuss a project.';
  }

  if (partes[0] === 'blog') {
    return l === 'es'
      ? 'Hola imSoft, llegué por un artículo de su blog y me gustaría platicar sobre un proyecto.'
      : 'Hi imSoft, I came from an article on your blog and would like to discuss a project.';
  }

  return GENERICO[l];
}
