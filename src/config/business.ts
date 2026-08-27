/**
 * Datos del negocio para schema.org. Fuente unica de verdad.
 *
 * Regla: aqui solo entran datos confirmados. Nada de coordenadas aproximadas, horarios
 * supuestos ni rangos de precio a ojo — schema.org es una declaracion sobre el negocio
 * y un dato inventado que no coincide con Google Business Profile resta confianza en
 * vez de sumarla. Si falta un campo, se omite: un schema corto y cierto vale mas que
 * uno largo y a medias.
 */

export const BUSINESS = {
  name: 'imSoft',
  legalName: 'imSoft',
  email: 'contacto@imsoft.io',
  /** E.164, que es lo que espera schema.org. */
  telephone: '+523325365558',
  address: {
    locality: 'Guadalajara',
    region: 'Jalisco',
    country: 'MX',
  },
  /** Perfiles publicos. La URL de LinkedIn es la publica, no el panel de administracion. */
  sameAs: [
    'https://www.facebook.com/weareimsoft',
    'https://x.com/weareimsoft',
    'https://www.instagram.com/weareimsoft/',
    'https://www.linkedin.com/company/93322900/',
    'https://www.youtube.com/@weareimsoft',
    'https://www.tiktok.com/@weareimsoft',
    'https://www.threads.com/@weareimsoft',
  ],
  languages: ['Spanish', 'English'],
} as const;

/** Zona de servicio declarada: el area metropolitana de Guadalajara y, por encima, el pais. */
export const BUSINESS_AREA_SERVED = [
  { '@type': 'City', name: 'Guadalajara' },
  { '@type': 'City', name: 'Zapopan' },
  { '@type': 'City', name: 'Tlaquepaque' },
  { '@type': 'City', name: 'Tonalá' },
  { '@type': 'City', name: 'Tlajomulco de Zúñiga' },
  { '@type': 'State', name: 'Jalisco' },
  { '@type': 'Country', name: 'Mexico' },
] as const;

/** Identificadores estables para poder referenciar las entidades entre bloques JSON-LD. */
export function businessIds(siteUrl: string) {
  return {
    organization: `${siteUrl}/#organization`,
    professionalService: `${siteUrl}/#professionalservice`,
    website: `${siteUrl}/#website`,
  };
}

export function postalAddress() {
  return {
    '@type': 'PostalAddress',
    addressLocality: BUSINESS.address.locality,
    addressRegion: BUSINESS.address.region,
    addressCountry: BUSINESS.address.country,
  };
}
