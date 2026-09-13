import { describe, it, expect } from 'vitest';
import { legacyRedirects } from './legacy-redirects';

const destinoDe = (source: string) => legacyRedirects().find((r) => r.source === source)?.destination;

describe('legacyRedirects', () => {
  it('manda la URL vieja de "cuanto cuesta una app" al articulo que responde la pregunta', () => {
    // Fue la pagina con mas impresiones no-marca del sitio viejo (GSC, jun-ago 2025).
    expect(
      destinoDe('/blog/cuanto-cuesta-desarrollar-una-app-movil-en-mexico-precios-tiempos-y-factores-clave'),
    ).toBe('/es/blog/cuanto-cuesta-desarrollar-una-app-en-mexico');
  });

  it('los posts del blog viejo con equivalente van antes que el comodin /blog/:slug', () => {
    const sources = legacyRedirects().map((r) => r.source);
    const comodin = sources.indexOf('/blog/:slug');
    const concretos = sources.filter((s) => s.startsWith('/blog/') && s !== '/blog/:slug');
    expect(concretos.length).toBeGreaterThan(0);
    for (const s of concretos) expect(sources.indexOf(s), s).toBeLessThan(comodin);
  });

  it('todo es 301 explicito, nunca 308', () => {
    for (const r of legacyRedirects()) {
      expect(r.statusCode, r.source).toBe(301);
      expect('permanent' in r && r.permanent, r.source).toBeFalsy();
    }
  });

  it('ningun destino bajo /es lleva un slug de blog en ingles', () => {
    for (const r of legacyRedirects()) {
      if (r.destination.startsWith('/es/blog/') && r.destination !== '/es/blog') {
        expect(r.destination, r.source).not.toMatch(/how-to|what-|why-|the-/);
      }
    }
  });
});
