import { describe, it, expect } from 'vitest';
import { ZAPOPAN_WEB } from './zapopan-web';
import { landingPagesData } from './landing-pages-data';

/**
 * The risk with a per-city landing is that it ends up being another city's with the name
 * swapped. Google treats that as a duplicate and ranks neither, which is exactly what
 * already cost us 36 retired blog articles.
 */
describe('Zapopan landing', () => {
  const text = JSON.stringify(ZAPOPAN_WEB).toLowerCase();

  it('talks about Zapopan and its corporate area, not generic Guadalajara', () => {
    expect(text).toContain('zapopan');
    expect(text).toContain('andares');
    expect(text).toContain('puerta de hierro');
  });

  it('the title and h1 include the city', () => {
    expect(ZAPOPAN_WEB.seoTitle).toContain('Zapopan');
    expect(ZAPOPAN_WEB.h1).toContain('Zapopan');
  });

  it('targets "paginas web", which is how buyers search for it', () => {
    // Google autocomplete (es-MX) suggests "paginas web zapopan" and returns nothing for
    // "desarrollo web zapopan": that second term is what developers use.
    expect(ZAPOPAN_WEB.seoTitle.toLowerCase()).toContain('páginas web');
    expect(ZAPOPAN_WEB.h1.toLowerCase()).toContain('páginas web');
  });

  it('the meta description fits in what Google shows', () => {
    expect(ZAPOPAN_WEB.seoDescription.length).toBeLessThanOrEqual(160);
  });

  it('is not a copy of any city + industry landing', () => {
    const blocks = [
      ...ZAPOPAN_WEB.problems.items,
      ...ZAPOPAN_WEB.solutions.items.map((s) => s.description),
    ].map((t) => t.toLowerCase());

    const existing = new Set<string>();
    for (const city of Object.values(landingPagesData)) {
      for (const landing of Object.values(city)) {
        landing.problems.items.forEach((i) => existing.add(i.toLowerCase()));
        landing.solutions.items.forEach((i) => existing.add(i.description.toLowerCase()));
      }
    }

    for (const block of blocks) {
      expect(existing.has(block)).toBe(false);
    }
  });

  it('cited projects are real and are not attributed a location', () => {
    // They are portfolio clients; there's no record of them being in Zapopan, so the
    // page doesn't claim it.
    expect(ZAPOPAN_WEB.proof.items.length).toBeGreaterThan(0);
    expect(ZAPOPAN_WEB.proof.description.toLowerCase()).toContain('no todos son de zapopan');
    for (const item of ZAPOPAN_WEB.proof.items) {
      expect(item.description.toLowerCase()).not.toContain('zapopan');
    }
  });

  it('the business hours match the ones declared in the schema', () => {
    expect(ZAPOPAN_WEB.cta.description).toContain('9:00 a 18:00');
    expect(ZAPOPAN_WEB.cta.description).toContain('9:00 a 13:00');
    expect(ZAPOPAN_WEB.cta.description).not.toContain('lunes a viernes');
  });
});
