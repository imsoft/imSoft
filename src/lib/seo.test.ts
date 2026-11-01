import { describe, it, expect } from 'vitest';
import { generateMetadata, hreflangLanguageAlternates, truncateDescription } from './seo';

const SITE = 'https://www.imsoft.io';

/**
 * hreflang is the part of SEO that breaks most silently: an invalid language code
 * or a URL that doesn't exist raises no error at build or runtime, it just makes
 * Google discard the relation between languages. These tests pin the contract.
 */
describe('hreflangLanguageAlternates', () => {
  const alt = hreflangLanguageAlternates(`${SITE}/es/services`, `${SITE}/en/services`);

  it('uses valid BCP 47 codes and x-default', () => {
    expect(Object.keys(alt).sort()).toEqual(['en', 'es-MX', 'x-default']);
  });

  it('never emits the Open Graph format (underscore) as a key', () => {
    for (const key of Object.keys(alt)) {
      expect(key).not.toContain('_');
    }
  });

  it('points to language routes that exist: /es and /en, never /en_US or /es_MX', () => {
    for (const url of Object.values(alt)) {
      expect(url).toMatch(/^https:\/\/www\.imsoft\.io\/(es|en)(\/|$)/);
      expect(url).not.toMatch(/\/(en|es)_[A-Z]{2}/);
    }
  });

  it('x-default points to Spanish, which is the main market', () => {
    expect(alt['x-default']).toBe(alt['es-MX']);
  });
});

describe('generateMetadata', () => {
  it('the canonical points to the page itself, not to the language root', () => {
    const url = `${SITE}/es/services/web-pages`;
    const meta = generateMetadata({ title: 'Páginas Web', url }, 'es');
    expect(meta.alternates?.canonical).toBe(url);
  });

  it('without an explicit url the canonical falls back to the language home, not the domain', () => {
    expect(generateMetadata({}, 'es').alternates?.canonical).toBe(`${SITE}/es`);
    expect(generateMetadata({}, 'en').alternates?.canonical).toBe(`${SITE}/en`);
  });

  it('the alternates of an inner page keep their path in both languages', () => {
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

  it('og:locale does use the Open Graph format, which has an underscore', () => {
    // This is the confusing distinction: hreflang uses es-MX, Open Graph uses es_MX.
    expect(generateMetadata({}, 'es').openGraph?.locale).toBe('es_MX');
    expect(generateMetadata({}, 'en').openGraph?.locale).toBe('en_US');
  });

  it('noindex is reflected in robots', () => {
    const meta = generateMetadata({ noindex: true }, 'es');
    expect(meta.robots).toMatchObject({ index: false });
  });
});

describe('truncateDescription', () => {
  it('cuts at the last full word before 155 and marks the cut', () => {
    const t = truncateDescription('palabra '.repeat(40));
    expect(t.length).toBeLessThanOrEqual(155);
    expect(t.endsWith('palabra…')).toBe(true);
  });

  it('leaves the ones that fit alone', () => {
    expect(truncateDescription('  corta   y limpia ')).toBe('corta y limpia');
  });

  it('generateMetadata applies it to every description', () => {
    const m = generateMetadata({ description: 'a'.repeat(100) + ' ' + 'b'.repeat(100) }, 'es');
    expect(String(m.description).length).toBeLessThanOrEqual(155);
  });
});
