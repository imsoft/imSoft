import type { City, Industry } from '@/types/landing-pages';

/**
 * Indice navegable de las landings ciudad + industria.
 *
 * Existe para resolver el problema de indexacion: las 30 landings solo vivian en el
 * sitemap, sin un solo enlace interno apuntandolas. Google las marcaba como
 * "Descubierta: actualmente sin indexar" y nunca las rastreaba. Cualquier pagina nueva
 * de este tipo debe quedar enlazada desde aqui.
 */

export const LANDING_CITIES: City[] = ['guadalajara', 'cdmx', 'monterrey'];

export const LANDING_INDUSTRIES: Industry[] = [
  'software-para-inmobiliarias',
  'software-para-constructoras',
  'software-para-restaurantes',
  'software-para-clinicas',
  'software-para-logistica',
];

export const CITY_LABELS: Record<City, { es: string; en: string }> = {
  guadalajara: { es: 'Guadalajara', en: 'Guadalajara' },
  cdmx: { es: 'Ciudad de México', en: 'Mexico City' },
  monterrey: { es: 'Monterrey', en: 'Monterrey' },
};

export const INDUSTRY_LABELS: Record<Industry, { es: string; en: string }> = {
  'software-para-inmobiliarias': { es: 'Inmobiliarias', en: 'Real Estate' },
  'software-para-constructoras': { es: 'Constructoras', en: 'Construction' },
  'software-para-restaurantes': { es: 'Restaurantes', en: 'Restaurants' },
  'software-para-clinicas': { es: 'Clínicas y Consultorios', en: 'Clinics & Practices' },
  'software-para-logistica': { es: 'Logística y Transporte', en: 'Logistics & Transport' },
};

export function landingHref(lang: string, city: City, industry: Industry): string {
  return `/${lang}/${city}/${industry}`;
}

/** Texto del enlace: "Software para Inmobiliarias en Guadalajara". */
export function landingLinkText(lang: string, city: City, industry: Industry): string {
  const l = lang === 'en' ? 'en' : 'es';
  const industryLabel = INDUSTRY_LABELS[industry][l];
  const cityLabel = CITY_LABELS[city][l];
  return l === 'es'
    ? `Software para ${industryLabel} en ${cityLabel}`
    : `Software for ${industryLabel} in ${cityLabel}`;
}
