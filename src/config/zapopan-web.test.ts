import { describe, it, expect } from 'vitest';
import { ZAPOPAN_WEB } from './zapopan-web';
import { landingPagesData } from './landing-pages-data';

/**
 * El riesgo de una landing por ciudad es que acabe siendo la de otra ciudad con el
 * nombre cambiado. Google trata eso como duplicado y no rankea ninguna de las dos, que
 * es justo lo que ya costo retirar 36 articulos del blog.
 */
describe('landing de Zapopan', () => {
  const texto = JSON.stringify(ZAPOPAN_WEB).toLowerCase();

  it('habla de Zapopan y de su zona corporativa, no de Guadalajara en generico', () => {
    expect(texto).toContain('zapopan');
    expect(texto).toContain('andares');
    expect(texto).toContain('puerta de hierro');
  });

  it('el titulo y el h1 llevan la ciudad', () => {
    expect(ZAPOPAN_WEB.seoTitle).toContain('Zapopan');
    expect(ZAPOPAN_WEB.h1).toContain('Zapopan');
  });

  it('la meta description cabe en lo que Google muestra', () => {
    expect(ZAPOPAN_WEB.seoDescription.length).toBeLessThanOrEqual(160);
  });

  it('no es una copia de ninguna landing de ciudad + industria', () => {
    const bloques = [
      ...ZAPOPAN_WEB.problems.items,
      ...ZAPOPAN_WEB.solutions.items.map((s) => s.description),
    ].map((t) => t.toLowerCase());

    const existentes = new Set<string>();
    for (const ciudad of Object.values(landingPagesData)) {
      for (const landing of Object.values(ciudad)) {
        landing.problems.items.forEach((i) => existentes.add(i.toLowerCase()));
        landing.solutions.items.forEach((i) => existentes.add(i.description.toLowerCase()));
      }
    }

    for (const bloque of bloques) {
      expect(existentes.has(bloque)).toBe(false);
    }
  });

  it('los proyectos citados son reales y no se les atribuye ubicacion', () => {
    // Son clientes del portafolio; no consta que esten en Zapopan, asi que la pagina
    // no lo afirma.
    expect(ZAPOPAN_WEB.proof.items.length).toBeGreaterThan(0);
    expect(ZAPOPAN_WEB.proof.description.toLowerCase()).toContain('no todos son de zapopan');
    for (const item of ZAPOPAN_WEB.proof.items) {
      expect(item.description.toLowerCase()).not.toContain('zapopan');
    }
  });

  it('el horario coincide con el que declara el schema', () => {
    expect(ZAPOPAN_WEB.cta.description).toContain('9:00 a 18:00');
    expect(ZAPOPAN_WEB.cta.description).not.toContain('lunes a viernes');
  });
});
