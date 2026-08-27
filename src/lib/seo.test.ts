import { describe, it, expect } from 'vitest';
import { generateMetadata, hreflangLanguageAlternates } from './seo';

const SITE = 'https://www.imsoft.io';

/**
 * El hreflang es la parte del SEO que mas silenciosamente se rompe: un codigo de idioma
 * invalido o una URL que no existe no da error en build ni en runtime, solo hace que
 * Google descarte la relacion entre idiomas. Estas pruebas fijan el contrato.
 */
describe('hreflangLanguageAlternates', () => {
  const alt = hreflangLanguageAlternates(`${SITE}/es/services`, `${SITE}/en/services`);

  it('usa codigos BCP 47 validos y x-default', () => {
    expect(Object.keys(alt).sort()).toEqual(['en', 'es-MX', 'x-default']);
  });

  it('nunca emite el formato de Open Graph (guion bajo) como clave', () => {
    for (const key of Object.keys(alt)) {
      expect(key).not.toContain('_');
    }
  });

  it('apunta a rutas de idioma que existen: /es y /en, nunca /en_US ni /es_MX', () => {
    for (const url of Object.values(alt)) {
      expect(url).toMatch(/^https:\/\/www\.imsoft\.io\/(es|en)(\/|$)/);
      expect(url).not.toMatch(/\/(en|es)_[A-Z]{2}/);
    }
  });

  it('x-default apunta al español, que es el mercado principal', () => {
    expect(alt['x-default']).toBe(alt['es-MX']);
  });
});

describe('generateMetadata', () => {
  it('el canonical apunta a la propia pagina, no a la raiz del idioma', () => {
    const url = `${SITE}/es/services/web-pages`;
    const meta = generateMetadata({ title: 'Páginas Web', url }, 'es');
    expect(meta.alternates?.canonical).toBe(url);
  });

  it('sin url explicita el canonical cae en la home del idioma, no en el dominio', () => {
    expect(generateMetadata({}, 'es').alternates?.canonical).toBe(`${SITE}/es`);
    expect(generateMetadata({}, 'en').alternates?.canonical).toBe(`${SITE}/en`);
  });

  it('los alternates de una pagina interna conservan su ruta en ambos idiomas', () => {
    const meta = generateMetadata(
      {
        url: `${SITE}/es/services`,
        alternateUrls: { es: `${SITE}/es/services`, en: `${SITE}/en/services` },
      },
      'es',
    );
    const langs = meta.alternates?.languages as Record<string, string>;
    expect(langs['es-MX']).toBe(`${SITE}/es/services`);
    expect(langs['en']).toBe(`${SITE}/en/services`);
    expect(langs['x-default']).toBe(`${SITE}/es/services`);
  });

  it('og:locale si usa el formato de Open Graph, que lleva guion bajo', () => {
    // Es la distincion que confunde: hreflang usa es-MX, Open Graph usa es_MX.
    expect(generateMetadata({}, 'es').openGraph?.locale).toBe('es_MX');
    expect(generateMetadata({}, 'en').openGraph?.locale).toBe('en_US');
  });

  it('noindex se refleja en robots', () => {
    const meta = generateMetadata({ noindex: true }, 'es');
    expect(meta.robots).toMatchObject({ index: false });
  });
});
