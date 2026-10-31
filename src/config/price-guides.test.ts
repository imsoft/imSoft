import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PRICE_GUIDES, PRICE_GUIDE_SLUGS, SERVICE_PRICE_GUIDE, priceGuide, priceGuideHref } from './price-guides';
import { CITY_SERVICES, cityServicePages } from './city-services';

const read = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');
const guides = PRICE_GUIDE_SLUGS.map((slug) => ({ slug, g: PRICE_GUIDES[slug] }));
const blocks = (c: (typeof guides)[number]['g']) =>
  [c.heroSubtitle, ...c.audience.items.map((i) => i.description), ...c.problems.items, ...c.solutions.items.map((i) => i.description), ...c.faq.items.map((i) => i.answer)].map((t) => t.toLowerCase().trim());

describe('"cuanto cuesta" guides', () => {
  it('answer the question as it is searched and fit in Google', () => {
    for (const { slug, g } of guides) {
      expect(g.h1.toLowerCase(), slug).toMatch(/^¿cuánto cuesta/);
      expect(g.seoTitle.length, slug).toBeLessThanOrEqual(65);
      expect(g.seoDescription.length, slug).toBeLessThanOrEqual(160);
      expect(g.faq.items.length).toBeGreaterThanOrEqual(4);
    }
    expect(priceGuide('software-a-la-medida')?.h1).toBe('¿Cuánto cuesta un software a la medida para una empresa?');
    // Web page and app are answered by the blog: a guide with the same question would compete with it.
    expect(priceGuide('pagina-web')).toBeNull();
    expect(priceGuide('app')).toBeNull();
    expect(priceGuideHref('es', 'software-a-la-medida')).toBe('/es/cuanto-cuesta/software-a-la-medida');
  });

  it('only use prices published on the site, and the hero ones are in the table', () => {
    const published = ['Desde $5,000 MXN', 'Desde $15,000 MXN', 'Desde $60,000 MXN', 'Desde $150,000 MXN', 'Desde $9,999 MXN'];
    for (const { slug, g } of guides) {
      for (const item of g.pricing!.items) expect(published, slug).toContain(item.price);
      // Every figure in the main text is in the table or in the pricing note (the top of the range goes in the note).
      for (const figure of g.heroSubtitle.match(/\$[\d,]+/g) ?? []) expect(g.pricing!.items.some((i) => i.price.includes(figure)) || (g.pricing!.note ?? '').includes(figure), `${slug}: ${figure}`).toBe(true);
    }
    // Store: the range in the note comes from what the three portfolio stores were charged.
    expect(priceGuide('tienda-en-linea')!.pricing!.note).toContain('van de $19,000 a $60,000 MXN');
    expect(priceGuide('tienda-en-linea')!.pricing!.items[0].price).toBe('Desde $9,999 MXN');
  });

  it('the projects cited exist in the portfolio', () => {
    const real = new Set(['lc-suplements', 'aduvanta', 'carsbybran', 'steridantal-order-generator', 'jtp-logistics-inventory', 'starfilters-report-generator', 'starfilters', 'the-podstore', 'bemastra-dental', 'rm-construction', 'the-paste-house', 'wellpoint', 'omnitria', 'tuxcacuesco', 'brangarciaramos', 'cursumi', 'intelligent-construction', 'business-and-customs-infinity', 'profibra', 'ortiz-and-co', 'ferreacabados-jalisco', 'jtp-logistics', 'national-gold']);
    for (const { g } of guides) for (const p of g.proof.items) expect(real.has(p.slug ?? ''), p.slug).toBe(true);
  });

  it('no paragraph repeats across guides or with the city landings', () => {
    const seen = new Map<string, string>();
    for (const { city, slug } of cityServicePages()) {
      const c = CITY_SERVICES[city][slug]!;
      for (const t of [c.heroSubtitle, ...c.audience.items.map((i) => i.description), ...c.problems.items, ...c.solutions.items.map((i) => i.description), ...c.faq.items.map((i) => i.answer)]) seen.set(t.toLowerCase().trim(), `${city}/${slug}`);
    }
    for (const { slug, g } of guides) {
      for (const t of blocks(g)) {
        if (t.length < 25) continue;
        expect(seen.get(t), `"${t.slice(0, 60)}" is already in ${seen.get(t)}`).toBeUndefined();
        seen.set(t, `guide/${slug}`);
      }
    }
  });

  it('are in the sitemap and linked from the home page and their service landings', () => {
    expect(read('src/app/sitemap.ts')).toContain('/es/cuanto-cuesta/${slug}');
    const pricing = read('src/components/blocks/pricing-section.tsx');
    for (const { href } of Object.values(SERVICE_PRICE_GUIDE)) expect(pricing).toContain(href);
    for (const slug of PRICE_GUIDE_SLUGS) expect(Object.values(SERVICE_PRICE_GUIDE).map((p) => p.href)).toContain(`/es/cuanto-cuesta/${slug}`);
    expect(read('src/app/[lang]/[city]/[service]/page.tsx')).toContain('servicePriceGuide(slug)');
  });
});
