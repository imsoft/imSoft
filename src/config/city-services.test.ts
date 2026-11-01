import { describe, expect, it } from 'vitest';
import { CITY_SERVICES, CITY_SERVICE_CITY_LABELS, CITY_SERVICE_SLUGS, cityServiceContent, cityServiceHref, cityServicePages, cityServiceTitle } from './city-services';
import { ZAPOPAN_WEB } from './zapopan-web';
import { landingPagesData } from './landing-pages-data';

/**
 * The 31 templated industry landings add up to 0 clicks in 90 days (Search Console,
 * Sep 2026) because they are the same page with another city. These tests prevent a
 * repeat: every city + service landing must differ from all the others.
 */
const pages = cityServicePages().map(({ city, slug }) => ({ city, slug, c: CITY_SERVICES[city][slug]! }));

const blocks = (c: (typeof pages)[number]['c']) =>
  [
    c.heroSubtitle,
    ...c.audience.items.map((i) => i.description),
    ...c.problems.items,
    ...c.solutions.items.map((i) => i.description),
    ...c.faq.items.map((i) => i.answer),
  ].map((t) => t.toLowerCase().trim());

describe('city + service landings', () => {
  it('has all four for Guadalajara, Monterrey, Queretaro and Puebla, three for CDMX, and resolves them by route', () => {
    expect(pages.filter((p) => p.city === 'guadalajara').map((p) => p.slug).sort()).toEqual([...CITY_SERVICE_SLUGS].sort());
    expect(pages.filter((p) => p.city === 'monterrey').map((p) => p.slug).sort()).toEqual([...CITY_SERVICE_SLUGS].sort());
    // In CDMX autocomplete doesn't suggest "desarrollo de apps cdmx": that page isn't built.
    expect(pages.filter((p) => p.city === 'cdmx').map((p) => p.slug).sort()).toEqual(['empresas-de-software', 'paginas-web', 'tiendas-en-linea']);
    expect(cityServiceContent('cdmx', 'desarrollo-de-apps')).toBeNull();
    for (const city of ['queretaro', 'puebla'] as const) expect(pages.filter((p) => p.city === city).map((p) => p.slug).sort()).toEqual([...CITY_SERVICE_SLUGS].sort());
    expect(cityServiceContent('guadalajara', 'paginas-web')?.h1).toBe('Páginas Web en Guadalajara');
    expect(cityServiceContent('guadalajara', 'software-para-clinicas')).toBeNull();
    expect(cityServiceContent('monterrey', 'paginas-web')?.h1).toBe('Páginas Web en Monterrey');
    expect(cityServiceHref('es', 'guadalajara', 'tiendas-en-linea')).toBe('/es/guadalajara/tiendas-en-linea');
    expect(cityServiceTitle('guadalajara', 'desarrollo-de-apps')).toBe('Desarrollo de apps en Guadalajara');
  });

  it('every page names the city in the title, h1 and description, and the description fits in Google', () => {
    for (const { city, c } of pages) {
      const names = city === 'cdmx' ? ['CDMX', 'Ciudad de México'] : [CITY_SERVICE_CITY_LABELS[city]];
      const mentions = (t: string) => names.some((n) => t.includes(n));
      expect(mentions(c.seoTitle), `${city}: title without city`).toBe(true);
      expect(mentions(c.h1), `${city}: h1 without city`).toBe(true);
      expect(mentions(c.seoDescription), `${city}: description without city`).toBe(true);
      expect(c.seoDescription.length).toBeLessThanOrEqual(160);
      expect(c.seoTitle.length).toBeLessThanOrEqual(65);
    }
  });

  it('targets what people type, not what developers call it', () => {
    // Google autocomplete (es-MX, 2026-09-21): "paginas web guadalajara",
    // "empresas de desarrollo de software guadalajara", "tienda en linea guadalajara",
    // "desarrollo de apps guadalajara". Nobody searches "software a la medida guadalajara".
    const g = CITY_SERVICES.guadalajara;
    expect(g['paginas-web']!.h1.toLowerCase()).toContain('páginas web');
    expect(g['empresas-de-software']!.h1.toLowerCase()).toContain('empresa de desarrollo de software');
    expect(g['tiendas-en-linea']!.h1.toLowerCase()).toContain('tiendas en línea');
    expect(g['desarrollo-de-apps']!.h1.toLowerCase()).toContain('desarrollo de apps');
  });

  it('no paragraph repeats across pages, with Zapopan, or with the industry landings', () => {
    // Existing copy is registered without checking (industry landings DO repeat across
    // cities: that's exactly the problem these pages must not inherit).
    const existing = new Map<string, string>();
    for (const t of [ZAPOPAN_WEB.heroSubtitle, ...ZAPOPAN_WEB.problems.items, ...ZAPOPAN_WEB.solutions.items.map((s) => s.description)]) existing.set(t.toLowerCase().trim(), 'zapopan');
    for (const [city, byIndustry] of Object.entries(landingPagesData)) {
      for (const [ind, l] of Object.entries(byIndustry)) {
        for (const t of [...l.problems.items, ...l.solutions.items.map((s) => s.description)]) existing.set(t.toLowerCase().trim(), `${city}/${ind}`);
      }
    }
    const seen = new Map<string, string>();
    for (const p of pages) {
      for (const t of blocks(p.c)) {
        if (t.length < 25) continue;
        expect(existing.get(t), `"${t.slice(0, 60)}" already exists in ${existing.get(t)}`).toBeUndefined();
        expect(seen.get(t), `"${t.slice(0, 60)}" repeats in ${seen.get(t)} and ${p.city}/${p.slug}`).toBeUndefined();
        seen.set(t, `${p.city}/${p.slug}`);
      }
    }
  });

  it('Monterrey and CDMX say they are served remotely from Guadalajara, without inventing an office', () => {
    for (const { city, c } of pages.filter((p) => p.city !== 'guadalajara')) {
      const text = JSON.stringify(c).toLowerCase();
      expect(text, `${city}/${c.h1}`).toMatch(/a distancia|videollamada/);
      expect(text, `${city}/${c.h1}`).toContain('guadalajara');
      expect(text).not.toMatch(/nuestra oficina en (monterrey|cdmx|la ciudad de méxico|querétaro|puebla)/);
    }
  });

  it('cited projects exist in the portfolio and are not attributed a city', () => {
    // Real slugs from the portfolio table (Sep 2026).
    const realSlugs = new Set(['lc-suplements', 'aduvanta', 'carsbybran', 'steridantal-order-generator', 'jtp-logistics-inventory', 'starfilters-report-generator', 'starfilters', 'the-podstore', 'bemastra-dental', 'rm-construction', 'the-paste-house', 'wellpoint', 'omnitria', 'tuxcacuesco', 'brangarciaramos', 'cursumi', 'intelligent-construction', 'business-and-customs-infinity', 'profibra', 'ortiz-and-co', 'ferreacabados-jalisco', 'jtp-logistics', 'national-gold']);
    for (const { c } of pages) {
      expect(c.proof.items.length).toBeGreaterThanOrEqual(3);
      for (const item of c.proof.items) {
        expect(realSlugs.has(item.slug ?? ''), `slug ${item.slug} is not in the portfolio`).toBe(true);
        expect(item.description.toLowerCase()).not.toMatch(/en guadalajara|de guadalajara|en zapopan|en monterrey|en cdmx|ciudad de méxico|en querétaro|en puebla/);
      }
    }
  });

  it('"from" prices are the ones published on the site', () => {
    const published = ['Desde $5,000 MXN', 'Desde $15,000 MXN', 'Desde $60,000 MXN', 'Desde $150,000 MXN', 'Desde $9,999 MXN'];
    for (const { c } of pages) {
      for (const item of c.pricing?.items ?? []) expect(published).toContain(item.price);
    }
    // Online stores: $9,999 minimum set by Brandon (2026-09-28) for a basic store.
    for (const { c, slug } of pages) if (slug === 'tiendas-en-linea') expect(c.pricing?.items.map((i) => i.price)).toEqual(['Desde $9,999 MXN']);
  });

  it('every page has FAQs and the business hours match the schema', () => {
    for (const { c } of pages) {
      expect(c.faq.items.length).toBeGreaterThanOrEqual(4);
      expect(c.cta.description).toContain('9:00 a 18:00');
      expect(c.cta.description).toContain('9:00 a 13:00');
    }
  });
});
