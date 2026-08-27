/**
 * Datos del negocio para schema.org. Fuente unica de verdad.
 *
 * Regla: aqui solo entran datos confirmados. Nada de coordenadas aproximadas ni rangos
 * de precio a ojo — schema.org es una declaracion sobre el negocio y un dato inventado
 * que no coincide con Google Business Profile resta confianza en vez de sumarla. Si
 * falta un campo, se omite: un schema corto y cierto vale mas que uno largo y a medias.
 *
 * imSoft NO tiene local donde reciba clientes: es un negocio de area de servicio. Por
 * eso el domicilio llega solo a ciudad/estado y no hay `geo` ni `hasMap`. Declarar una
 * direccion visitable que no existe es justo lo que Google penaliza en las fichas
 * locales, y ademas tiene que cuadrar con como este dado de alta en Business Profile
 * (ahi se registra ocultando el domicilio y declarando zona de servicio).
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
  /**
   * Horario de atencion confirmado: 9:00 a 18:00. Los dias no se especificaron, asi que
   * se asume lunes a viernes; si se trabaja en sabado hay que anadirlo aqui y que
   * coincida con Google Business Profile.
   */
  openingHours: {
    days: [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
    ],
    opens: '09:00',
    closes: '18:00',
  },
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
