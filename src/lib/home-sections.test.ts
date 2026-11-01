import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/**
 * The home page alternates white and blue backgrounds section by section (Brandon's request,
 * 2026-09-13). The hero is separate: it's white and the others follow it in order.
 */
const SECTIONS: Array<[string, string]> = [
  ['ServicesSection', 'src/components/blocks/services-section.tsx'],
  ['ProcessSection', 'src/components/blocks/process-section.tsx'],
  ['PricingSection', 'src/components/blocks/pricing-section.tsx'],
  ['PortfolioSection', 'src/components/blocks/portfolio-section.tsx'],
  ['TestimonialsSection', 'src/components/blocks/testimonials-section.tsx'],
  ['BlogPreviewSection', 'src/components/blocks/blog-preview-section.tsx'],
  ['FaqSection', 'src/components/blocks/faq-section.tsx'],
  ['FinalCtaSection', 'src/components/blocks/final-cta-section.tsx'],
];

function background(file: string): 'white' | 'blue' {
  const m = read(file).match(/<section[^>]*className="([^"]*)"/);
  if (!m) throw new Error(`${file}: no <section className>`);
  const cls = m[1].split(/\s+/);
  if (cls.includes('bg-primary')) return 'blue';
  if (cls.includes('bg-background')) return 'white';
  throw new Error(`${file}: unknown background "${m[1]}"`);
}

describe('the home page alternates white and blue', () => {
  it('the sections appear on the home page in this order', () => {
    const home = read('src/app/[lang]/page.tsx');
    const positions = SECTIONS.map(([name]) => home.indexOf(`<${name} `));
    for (const [i, pos] of positions.entries()) {
      expect(pos, SECTIONS[i][0]).toBeGreaterThan(-1);
      if (i > 0) expect(pos).toBeGreaterThan(positions[i - 1]);
    }
  });

  it('starts with blue after the hero and keeps alternating', () => {
    const backgrounds = SECTIONS.map(([, file]) => background(file));
    expect(backgrounds).toEqual(['blue', 'white', 'blue', 'white', 'blue', 'white', 'blue', 'white']);
  });
});
