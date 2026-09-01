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
 * Un unico nodo `ProfessionalService`, que por herencia (ProfessionalService <-
 * LocalBusiness <- Organization) ya ES una Organization: hereda name, url, logo,
 * sameAs, contactPoint, address, areaServed y legalName. Por eso no hace falta un
 * segundo nodo Organization, y publicarlo aparte enlazado con `parentOrganization`
 * seria peor: declararia que imSoft tiene una empresa matriz llamada imSoft.
 *
 * Se probo tambien `"@type": ["ProfessionalService", "Organization"]`. Es JSON-LD
 * valido, pero validator.schema.org descarta el nodo entero sin dar error, asi que no
 * merece la pena arriesgarse a que el parser de Google haga lo mismo y la entidad
 * quede invisible.
 *
 * NINGUN otro bloque de la pagina debe referenciar este nodo con `{'@id': ...}`.
 * Verificado en produccion contra validator.schema.org: en cuanto `WebSite.publisher` o
 * `Service.provider` apuntaban aqui por @id, el validador descartaba este nodo entero
 * sin reportar error y la empresa desaparecia de las entidades detectadas. Al quitar
 * esas referencias reaparece. Los demas bloques describen a imSoft en linea con
 * nombre y url, que es lo que Google usa para reconciliar la entidad.
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
    openingHoursSpecification: BUSINESS.openingHours.map((tramo) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [...tramo.days],
      opens: tramo.opens,
      closes: tramo.closes,
    })),
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
  };
}
