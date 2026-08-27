import { BUSINESS } from '@/config/business';

/**
 * Titulos y descripciones locales para las paginas de servicio.
 *
 * Las 19 paginas de /services/<slug> se titulaban solo con el nombre del servicio
 * ("Páginas Web | imSoft"), sin ninguna senal geografica, asi que no competian por las
 * consultas que si tienen intencion comercial ("desarrollo web en Guadalajara").
 *
 * Se optimizan las paginas que ya existen en vez de crear una variante por ciudad:
 * duplicar la URL pondria dos paginas propias a pelear por la misma consulta, que es
 * exactamente el problema de canibalizacion que ya costo retirar 36 articulos del blog.
 */

const CITY_ES = 'Guadalajara';

/**
 * Verbo con el que se nombra cada servicio en el titulo. No todos son "desarrollo":
 * paid media o produccion audiovisual no se "desarrollan", y forzarlo suena a plantilla.
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

/** "Desarrollo de Páginas Web en Guadalajara" — o "Paid Media en Guadalajara". */
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
 * Meta description con senal local. Se antepone la ciudad a la descripcion real del
 * servicio en vez de sustituirla, para no perder lo que ya describe la oferta.
 */
export function localizedServiceDescription(description: string, lang: string): string {
  const clean = (description || '').replace(/\s+/g, ' ').trim();
  const lead =
    lang === 'en'
      ? 'Software agency based in Guadalajara, Jalisco. '
      : `Agencia de software en ${CITY_ES}, Jalisco. `;
  // El limite util de Google ronda los 155 caracteres.
  return `${lead}${clean}`.slice(0, 155).trim();
}

/** Zona de servicio en texto, para el bloque local visible de la pagina. */
export function serviceAreaSentence(lang: string): string {
  return lang === 'en'
    ? 'We work with companies across the Guadalajara metro area — Zapopan, Tlaquepaque, Tonalá and Tlajomulco — and remotely throughout Mexico.'
    : `Trabajamos con empresas de toda la Zona Metropolitana de ${CITY_ES}: Zapopan, Tlaquepaque, Tonalá y Tlajomulco, y en remoto con el resto de México. Atendemos de ${BUSINESS.openingHours.opens} a ${BUSINESS.openingHours.closes}, de lunes a viernes.`;
}
