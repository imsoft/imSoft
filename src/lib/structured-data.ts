import {
  BUSINESS,
  BUSINESS_AREA_SERVED,
  businessIds,
  postalAddress,
} from '@/config/business';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io';
const LOGO = `${SITE_URL}/logos/logo-imsoft-blue.png`;

/**
 * Business identity in JSON-LD, emitted once in the root layout.
 *
 * A single `ProfessionalService` node, which through inheritance (ProfessionalService <-
 * LocalBusiness <- Organization) already IS an Organization: it inherits name, url, logo,
 * sameAs, contactPoint, address, areaServed and legalName. That's why there's no need for a
 * second Organization node, and publishing it separately linked with `parentOrganization`
 * would be worse: it would declare that imSoft has a parent company called imSoft.
 *
 * `"@type": ["ProfessionalService", "Organization"]` was tried too. It's valid
 * JSON-LD, but validator.schema.org drops the whole node without an error, so it's
 * not worth risking Google's parser doing the same and the entity
 * becoming invisible.
 *
 * NO other block of the page may reference this node with `{'@id': ...}`.
 * Verified in production against validator.schema.org: as soon as `WebSite.publisher` or
 * `Service.provider` pointed here by @id, the validator dropped this whole node
 * without reporting an error and the company disappeared from the detected entities. Removing
 * those references brings it back. The other blocks describe imSoft inline with
 * name and url, which is what Google uses to reconcile the entity.
 */

export function businessSchema(lang: string) {
  const ids = businessIds(SITE_URL);
  const isEs = lang === 'es';
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
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
    openingHoursSpecification: BUSINESS.openingHours.map((slot) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...slot.days],
      opens: slot.opens,
      closes: slot.closes,
    })),
    sameAs: [...BUSINESS.sameAs],
    // One contact point per function: Google shows them in the knowledge panel.
    contactPoint: [
      { '@type': 'ContactPoint', contactType: 'customer service', email: BUSINESS.email, telephone: BUSINESS.telephone, areaServed: 'MX', availableLanguage: [...BUSINESS.languages] },
      { '@type': 'ContactPoint', contactType: 'sales', email: BUSINESS.contactEmails.sales, telephone: BUSINESS.telephone, areaServed: 'MX', availableLanguage: [...BUSINESS.languages] },
      { '@type': 'ContactPoint', contactType: 'billing support', email: BUSINESS.contactEmails.billing, areaServed: 'MX', availableLanguage: [...BUSINESS.languages] },
      { '@type': 'ContactPoint', contactType: 'technical support', email: BUSINESS.contactEmails.support, areaServed: 'MX', availableLanguage: [...BUSINESS.languages] },
    ],
    // `knowsLanguage` is valid on Organization; `availableLanguage` isn't on
    // LocalBusiness or its subtypes, only inside ContactPoint.
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
  };
}
