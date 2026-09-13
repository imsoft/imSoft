import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/**
 * La portada alterna fondo blanco y azul seccion por seccion (peticion de Brandon,
 * 13-sep-2026). El hero va aparte: es blanco y lo siguen las demas en orden.
 */
const SECCIONES: Array<[string, string]> = [
  ['ServicesSection', 'src/components/blocks/services-section.tsx'],
  ['ProcessSection', 'src/components/blocks/process-section.tsx'],
  ['PricingSection', 'src/components/blocks/pricing-section.tsx'],
  ['PortfolioSection', 'src/components/blocks/portfolio-section.tsx'],
  ['TestimonialsSection', 'src/components/blocks/testimonials-section.tsx'],
  ['BlogPreviewSection', 'src/components/blocks/blog-preview-section.tsx'],
  ['FaqSection', 'src/components/blocks/faq-section.tsx'],
  ['FinalCtaSection', 'src/components/blocks/final-cta-section.tsx'],
];

function fondo(archivo: string): 'blanco' | 'azul' {
  const m = read(archivo).match(/<section[^>]*className="([^"]*)"/);
  if (!m) throw new Error(`${archivo}: sin <section className>`);
  const cls = m[1].split(/\s+/);
  if (cls.includes('bg-primary')) return 'azul';
  if (cls.includes('bg-background')) return 'blanco';
  throw new Error(`${archivo}: fondo desconocido "${m[1]}"`);
}

describe('la portada alterna blanco y azul', () => {
  it('las secciones aparecen en la portada en este orden', () => {
    const home = read('src/app/[lang]/page.tsx');
    const posiciones = SECCIONES.map(([nombre]) => home.indexOf(`<${nombre} `));
    for (const [i, pos] of posiciones.entries()) {
      expect(pos, SECCIONES[i][0]).toBeGreaterThan(-1);
      if (i > 0) expect(pos).toBeGreaterThan(posiciones[i - 1]);
    }
  });

  it('empieza en azul tras el hero y va alternando', () => {
    const fondos = SECCIONES.map(([, archivo]) => fondo(archivo));
    expect(fondos).toEqual(['azul', 'blanco', 'azul', 'blanco', 'azul', 'blanco', 'azul', 'blanco']);
  });
});
