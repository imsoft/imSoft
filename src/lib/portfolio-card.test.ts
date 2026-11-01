import { describe, it, expect } from 'vitest';
import { MAX_CARD_RESULTS, portfolioCard, portfolioLookup, portfolioMetaDescription, type PortfolioRow } from './portfolio-card';

const row: PortfolioRow = {
  id: '0a15d020-12a3-416e-a175-50bd5c993d7a',
  slug: 'aduvanta',
  title_es: 'Aduvanta - Software Aduanero en la Nube',
  title_en: 'Aduvanta - Cloud Customs Software',
  description_es: 'SaaS de gestión aduanera.',
  description_en: 'Customs management SaaS.',
  challenge_es: 'Operaban con 13 aplicaciones de escritorio desconectadas.',
  challenge_en: 'They ran 13 disconnected desktop apps.',
  results_es: ['80% menos tiempo', '0 instalaciones', 'TIGIE con IA', 'Portal de clientes'],
  results_en: ['80% less time', '0 installs', 'AI TIGIE', 'Client portal'],
  image_url: 'https://cdn.example.com/aduvanta.png',
  project_url: 'https://aduvanta.com/',
  client: 'Aduvanta',
  year: 2026,
};

describe('portfolioCard', () => {
  it('links by named slug, not by id', () => {
    expect(portfolioCard(row, 'es').slug).toBe('aduvanta');
  });

  it('falls back to the id when there is no slug, so the detail page still opens', () => {
    expect(portfolioCard({ ...row, slug: null }, 'es').slug).toBe(row.id);
    expect(portfolioCard({ ...row, slug: '  ' }, 'es').slug).toBe(row.id);
  });

  it('brings the challenge and results to the card, in the requested language', () => {
    const es = portfolioCard(row, 'es');
    expect(es.challenge).toContain('13 aplicaciones');
    expect(es.results).toEqual(['80% menos tiempo', '0 instalaciones', 'TIGIE con IA']);
    expect(es.results).toHaveLength(MAX_CARD_RESULTS);

    const en = portfolioCard(row, 'en');
    expect(en.title).toBe('Aduvanta - Cloud Customs Software');
    expect(en.challenge).toContain('desktop apps');
    expect(en.results[0]).toBe('80% less time');
  });

  it('falls back to the other language when the translation is missing, and to the neutral field last', () => {
    const noEnglish = portfolioCard({ ...row, title_en: null, challenge_en: '' }, 'en');
    expect(noEnglish.title).toBe(row.title_es);
    expect(noEnglish.challenge).toContain('13 aplicaciones');

    const neutral = portfolioCard({ id: 'x', title: 'Solo título', description: 'Solo desc' }, 'es');
    expect(neutral.title).toBe('Solo título');
    expect(neutral.description).toBe('Solo desc');
  });

  it('makes nothing up when the row is empty', () => {
    const c = portfolioCard({ id: 'x' }, 'es');
    expect(c.challenge).toBeNull();
    expect(c.results).toEqual([]);
    expect(c.client).toBeNull();
    expect(c.year).toBeNull();
    expect(c.project_url).toBeUndefined();
    expect(c.image).toMatch(/^https:\/\//);
  });

  it('drops empty results', () => {
    expect(portfolioCard({ id: 'x', results_es: ['', '  ', 'Real'] }, 'es').results).toEqual(['Real']);
  });
});

describe('portfolioLookup', () => {
  it('looks up by id when the URL carries the old uuid', () => {
    expect(portfolioLookup('0a15d020-12a3-416e-a175-50bd5c993d7a')).toEqual({
      column: 'id',
      value: '0a15d020-12a3-416e-a175-50bd5c993d7a',
    });
  });

  it('looks up by named slug, which is not a valid uuid', () => {
    expect(portfolioLookup('aduvanta')).toEqual({ column: 'slug', value: 'aduvanta' });
    expect(portfolioLookup('steridantal-order-generator').column).toBe('slug');
  });
});

describe('portfolioMetaDescription', () => {
  it('completes one-line descriptions with the challenge', () => {
    const d = portfolioMetaDescription({ id: 'x', description_es: 'Aplicación web para pedidos', challenge_es: 'Los clientes llamaban para pedir.' }, 'es');
    expect(d).toBe('Aplicación web para pedidos. Los clientes llamaban para pedir.');
  });

  it('leaves already complete descriptions alone', () => {
    const long = 'x'.repeat(80);
    expect(portfolioMetaDescription({ id: 'x', description_es: long, challenge_es: 'reto' }, 'es')).toBe(long);
  });
});
