/**
 * Business data for schema.org. Single source of truth.
 *
 * Rule: only confirmed data goes here. No approximate coordinates or guessed price
 * ranges: schema.org is a statement about the business, and a made-up value that doesn't
 * match Google Business Profile costs trust instead of adding it. If a field is missing,
 * it's omitted: a short, true schema beats a long, half-true one.
 *
 * imSoft has NO premises where it receives clients: it's a service-area business. So the
 * address only goes down to city/state and there's no `geo` or `hasMap`. Declaring a
 * visitable address that doesn't exist is exactly what Google penalizes in local
 * listings, and it also has to match how it's registered in Business Profile (there the
 * address is hidden and a service area is declared).
 */

export const BUSINESS = {
  name: 'imSoft',
  legalName: 'imSoft',
  email: 'contacto@imsoft.io',
  /** Per-role aliases (Workspace, 2026-09-15); all land in the same inbox. */
  contactEmails: {
    sales: 'hola@imsoft.io',
    billing: 'facturacion@imsoft.io',
    support: 'soporte@imsoft.io',
  },
  /** E.164, which is what schema.org expects. */
  telephone: '+523325365558',
  address: {
    locality: 'Guadalajara',
    region: 'Jalisco',
    country: 'MX',
  },
  /**
   * Public profiles. LinkedIn uses its canonical `www.` form, not the regional `mx.`
   * mirror: same page, but `sameAs` must point to the global URL.
   */
  sameAs: [
    'https://www.facebook.com/weareimsoft',
    'https://x.com/weareimsoft',
    'https://www.instagram.com/weareimsoft/',
    'https://www.linkedin.com/company/imsoft',
    'https://www.youtube.com/@weareimsoft',
    'https://www.tiktok.com/@weareimsoft',
    'https://www.threads.com/@weareimsoft',
  ],
  languages: ['Spanish', 'English'],
  /**
   * Hours exactly as declared in Google Business Profile. Sunday closes earlier, so
   * there are two ranges, not one: if the schema said 18:00 all seven days it would
   * contradict the listing, and Google compares both sources.
   */
  openingHours: [
    {
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      days: ['Sunday'],
      opens: '09:00',
      closes: '13:00',
    },
  ],
} as const;

/**
 * Declared service area. Must match the areas declared in Google Business Profile: the
 * whole Guadalajara metro area, plus Mexico City and Monterrey, the other two cities
 * with their own landing.
 */
export const BUSINESS_AREA_SERVED = [
  { '@type': 'City', name: 'Guadalajara' },
  { '@type': 'City', name: 'Zapopan' },
  { '@type': 'City', name: 'Tlaquepaque' },
  { '@type': 'City', name: 'Tonalá' },
  { '@type': 'City', name: 'Tlajomulco de Zúñiga' },
  { '@type': 'City', name: 'Mexico City' },
  { '@type': 'City', name: 'Monterrey' },
  { '@type': 'State', name: 'Jalisco' },
  { '@type': 'Country', name: 'Mexico' },
] as const;

/** Stable identifiers so entities can be referenced across JSON-LD blocks. */
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
