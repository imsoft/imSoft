import { describe, it, expect } from 'vitest';
import { legacyRedirects } from './legacy-redirects';

const targetOf = (source: string) => legacyRedirects().find((r) => r.source === source)?.destination;

describe('legacyRedirects', () => {
  it('sends the old "cuanto cuesta una app" URL to the article that answers the question', () => {
    // It was the old site's page with the most non-brand impressions (GSC, Jun-Aug 2025).
    expect(
      targetOf('/blog/cuanto-cuesta-desarrollar-una-app-movil-en-mexico-precios-tiempos-y-factores-clave'),
    ).toBe('/es/blog/cuanto-cuesta-desarrollar-una-app-en-mexico');
  });

  it('old blog posts with an equivalent come before the /blog/:slug wildcard', () => {
    const sources = legacyRedirects().map((r) => r.source);
    const wildcard = sources.indexOf('/blog/:slug');
    const specific = sources.filter((s) => s.startsWith('/blog/') && s !== '/blog/:slug');
    expect(specific.length).toBeGreaterThan(0);
    for (const s of specific) expect(sources.indexOf(s), s).toBeLessThan(wildcard);
  });

  it('everything is an explicit 301, never 308', () => {
    for (const r of legacyRedirects()) {
      expect(r.statusCode, r.source).toBe(301);
      expect('permanent' in r && r.permanent, r.source).toBeFalsy();
    }
  });

  it('no target under /es carries an English blog slug', () => {
    for (const r of legacyRedirects()) {
      if (r.destination.startsWith('/es/blog/') && r.destination !== '/es/blog') {
        expect(r.destination, r.source).not.toMatch(/how-to|what-|why-|the-/);
      }
    }
  });
});

describe('Monterrey and CDMX industry landings', () => {
  it('301 to the software development landing of their city', () => {
    const rs = legacyRedirects();
    for (const city of ['monterrey', 'cdmx']) {
      const r = rs.find((x) => x.source === `/:lang(es|en)/${city}/software-para-:industry`);
      expect(r, city).toBeDefined();
      expect(r!.destination).toBe(`/es/${city}/empresas-de-software`);
      expect(r!.statusCode).toBe(301);
    }
    // Guadalajara keeps its industry landings.
    expect(rs.some((x) => x.source.includes('/guadalajara/software-para-'))).toBe(false);
  });
});
