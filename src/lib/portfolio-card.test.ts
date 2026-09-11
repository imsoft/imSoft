import { describe, it, expect } from 'vitest';
import { MAX_RESULTADOS_EN_TARJETA, portfolioCard, type PortfolioRow } from './portfolio-card';

const fila: PortfolioRow = {
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
  it('enlaza por slug con nombre, no por el id', () => {
    expect(portfolioCard(fila, 'es').slug).toBe('aduvanta');
  });

  it('cae al id cuando no hay slug, para que la ficha siga abriendo', () => {
    expect(portfolioCard({ ...fila, slug: null }, 'es').slug).toBe(fila.id);
    expect(portfolioCard({ ...fila, slug: '  ' }, 'es').slug).toBe(fila.id);
  });

  it('saca el reto y los resultados a la tarjeta, en el idioma pedido', () => {
    const es = portfolioCard(fila, 'es');
    expect(es.challenge).toContain('13 aplicaciones');
    expect(es.results).toEqual(['80% menos tiempo', '0 instalaciones', 'TIGIE con IA']);
    expect(es.results).toHaveLength(MAX_RESULTADOS_EN_TARJETA);

    const en = portfolioCard(fila, 'en');
    expect(en.title).toBe('Aduvanta - Cloud Customs Software');
    expect(en.challenge).toContain('desktop apps');
    expect(en.results[0]).toBe('80% less time');
  });

  it('cae al otro idioma cuando falta la traduccion, y al campo neutro al final', () => {
    const sinIngles = portfolioCard({ ...fila, title_en: null, challenge_en: '' }, 'en');
    expect(sinIngles.title).toBe(fila.title_es);
    expect(sinIngles.challenge).toContain('13 aplicaciones');

    const neutro = portfolioCard({ id: 'x', title: 'Solo título', description: 'Solo desc' }, 'es');
    expect(neutro.title).toBe('Solo título');
    expect(neutro.description).toBe('Solo desc');
  });

  it('no inventa nada cuando la fila esta vacia', () => {
    const c = portfolioCard({ id: 'x' }, 'es');
    expect(c.challenge).toBeNull();
    expect(c.results).toEqual([]);
    expect(c.client).toBeNull();
    expect(c.year).toBeNull();
    expect(c.project_url).toBeUndefined();
    expect(c.image).toMatch(/^https:\/\//);
  });

  it('descarta resultados vacios', () => {
    expect(portfolioCard({ id: 'x', results_es: ['', '  ', 'Real'] }, 'es').results).toEqual(['Real']);
  });
});
