import {
  BUSINESS,
  BUSINESS_AREA_SERVED,
  businessIds,
  postalAddress,
} from '@/config/business';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';
const LOGO = `${SITE_URL}/logos/logo-imsoft-blue.png`;

/**
 * Identidad del negocio en JSON-LD, emitida una sola vez en el layout raiz.
 *
 * Un unico nodo con DOS tipos. `ProfessionalService` ya es subclase de `Organization`
 * (via LocalBusiness), asi que publicar dos nodos separados y enlazarlos con
 * `parentOrganization` le declara a Google que imSoft tiene una matriz llamada imSoft.
 * Es la misma empresa: se declara con ambos tipos y un solo `@id`, que es lo que
 * referencian `WebSite.publisher` y `Service.provider`.
 */

export function businessSchema(lang: string) {
  const ids = businessIds(SITE_URL);
  const isEs = lang === 'es';
  return {
    '@context': 'https://schema.org',
    '@type': ['ProfessionalService', 'Organization'],
    '@id': ids.organization,
    name: BUSINESS.name,
    legalName: BUSINESS.legalName,
    description: isEs
      ? 'Agencia de desarrollo de software en Guadalajara. Creamos software a la medida, aplicaciones móviles, páginas web y tiendas en línea para empresas de Jalisco y todo México.'
      : 'Software development agency based in Guadalajara, Mexico. We build custom software, mobile apps, websites and online stores for growing businesses.',
    url: SITE_URL,
    logo: LOGO,
    image: LOGO,
    email: BUSINESS.email,
    telephone: BUSINESS.telephone,
    address: postalAddress(),
    areaServed: [...BUSINESS_AREA_SERVED],
    sameAs: [...BUSINESS.sameAs],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: BUSINESS.email,
      telephone: BUSINESS.telephone,
      areaServed: 'MX',
      availableLanguage: [...BUSINESS.languages],
    },
    // `knowsLanguage` si es valido en Organization; `availableLanguage` no lo es en
    // LocalBusiness ni sus subtipos, solo dentro de ContactPoint.
    knowsLanguage: isEs ? ['es-MX', 'en'] : ['en', 'es-MX'],
  };
}


export function websiteSchema(lang: string) {
  const ids = businessIds(SITE_URL);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': ids.website,
    name: BUSINESS.name,
    url: SITE_URL,
    inLanguage: lang === 'es' ? 'es-MX' : 'en',
    publisher: { '@id': ids.organization },
  };
}
