import { describe, it, expect } from 'vitest';
import {
  MAX_TITLE_OVERLAP,
  countWords,
  pickNextTopic,
  slugify,
  titleOverlap,
  validateArticle,
  type GeneratedArticle,
  type QueueTopic,
  normalizeHtml,
} from './blog-generator';
import blogQueue from '../../content/blog-queue.json';
import { PRICE_GUIDES, PRICE_GUIDE_SLUGS } from '../config/price-guides';

const topic = (slug_es: string, slug_en = `${slug_es}-en`): QueueTopic => ({
  slug_es,
  slug_en,
  query: slug_es.replace(/-/g, ' '),
  angle: 'x',
  category: 'business',
});

describe('pickNextTopic', () => {
  it('returns the first topic that has no post yet, by either of its two slugs', () => {
    const queue = [topic('a'), topic('b'), topic('c')];
    expect(pickNextTopic(queue, ['a'])?.slug_es).toBe('b');
    expect(pickNextTopic(queue, ['a', 'b-en'])?.slug_es).toBe('c');
  });

  it('returns null when the queue is exhausted: better not to publish than to repeat', () => {
    expect(pickNextTopic([topic('a')], ['a'])).toBeNull();
    expect(pickNextTopic([], [])).toBeNull();
  });
});

describe('content/blog-queue.json', () => {
  it('has complete entries, no repeated slugs and slugs already normalized', () => {
    const topics = (blogQueue as { topics: QueueTopic[] }).topics;
    expect(topics.length).toBeGreaterThan(0);
    const seen = new Set<string>();
    for (const t of topics) {
      for (const k of ['slug_es', 'slug_en', 'query', 'angle', 'category'] as const) {
        expect(t[k], `${t.slug_es}.${k}`).toBeTruthy();
      }
      expect(t.slug_es).toBe(slugify(t.slug_es));
      expect(t.slug_en).toBe(slugify(t.slug_en));
      expect(seen.has(t.slug_es), t.slug_es).toBe(false);
      seen.add(t.slug_es);
      seen.add(t.slug_en);
    }
  });
});

describe('normalizeHtml', () => {
  it('leaves links with double quotes even if the model returns them with single or escaped quotes', () => {
    expect(normalizeHtml("<p>Ver <a href='https://x.mx/precios' target='_blank'>precios</a>.</p>")).toBe('<p>Ver <a href="https://x.mx/precios" target="_blank">precios</a>.</p>');
    expect(normalizeHtml('<a href=\\"https://x.mx\\">x</a>')).toBe('<a href="https://x.mx">x</a>');
    // An apostrophe inside the text is left alone.
    expect(normalizeHtml("<p>It's fine</p>")).toBe("<p>It's fine</p>");
  });
});

describe('the queue does not compete with the price guides', () => {
  it('no queue topic is the same question as a /es/cuanto-cuesta/ guide', () => {
    // On Sep 15 and Oct 1, 2026 the blog tried to publish "cuanto cuesta una tienda en linea
    // en mexico", which the guide already answers: two pages for the same search get in each other's way.
    const topics = (blogQueue as { topics: QueueTopic[] }).topics;
    for (const slug of PRICE_GUIDE_SLUGS) {
      const question = slugify(PRICE_GUIDES[slug].h1);
      for (const t of topics) {
        expect(t.slug_es.startsWith(question) || question.startsWith(t.slug_es), `${t.slug_es} repeats the guide ${slug}`).toBe(false);
      }
    }
  });
});

describe('slugify', () => {
  it('removes accents and punctuation and caps at 80 characters', () => {
    expect(slugify('¿Cuánto cuesta una página web en México?')).toBe('cuanto-cuesta-una-pagina-web-en-mexico');
    expect(slugify('a'.repeat(100)).length).toBe(80);
    expect(slugify('dos  --  guiones')).toBe('dos-guiones');
  });
});

describe('titleOverlap', () => {
  it('detects a reworded title', () => {
    const s = titleOverlap(
      '5 Errores Comunes al Lanzar tu Tienda Online que Cuestan Dinero',
      '5 Errores que te Cuestan Ventas en tu Tienda Online',
    );
    expect(s).toBeGreaterThanOrEqual(MAX_TITLE_OVERLAP);
  });

  it('does not confuse two entries of the "cuanto cuesta X en Mexico" series', () => {
    expect(
      titleOverlap(
        '¿Cuánto cuesta una página web en México? Precios reales 2026',
        '¿Cuánto cuesta desarrollar una app en México? Rangos reales 2026',
      ),
    ).toBeLessThan(MAX_TITLE_OVERLAP);
  });

  it('lets distinct topics through even if they share loose words', () => {
    expect(titleOverlap('Cuánto cuesta una página web', 'Cuánto cuesta mantener una app')).toBeLessThan(
      MAX_TITLE_OVERLAP,
    );
  });
});

const paragraph = (n: number, text: string) => `<p>${Array(n).fill(text).join(' ')}</p>`;
const filler = paragraph(190, 'palabra de relleno sin cifras');

const base: GeneratedArticle = {
  title_es: '¿Cuánto cuesta una página web en México?',
  title_en: 'How much does a website cost in Mexico?',
  excerpt_es: 'Rangos publicados y qué incluye cada uno.',
  excerpt_en: 'Published ranges and what each includes.',
  content_es: `<h2>Rangos</h2><p>Alcodea publica de $15,000 a $50,000 MXN para una básica (<a href="https://alcodea.com/precios">fuente</a>).</p><p>Magokoro coincide, ver <a href="https://www.magokoro.mx/blog/precios">su tabla</a>.</p>${filler}`,
  content_en: `<h2>Ranges</h2><p>Alcodea publishes MXN $15,000 to $50,000 for a basic site (<a href="https://alcodea.com/precios">source</a>).</p><p>Magokoro agrees, see <a href="https://www.magokoro.mx/blog/precios">their table</a>.</p>${filler}`,
  sources: [
    { url: 'https://alcodea.com/precios', title: 'Alcodea', supports: 'rango básica' },
    { url: 'https://www.magokoro.mx/blog/precios', title: 'Magokoro', supports: 'rango básica' },
  ],
};

describe('validateArticle', () => {
  it('accepts an article with linked figures and declared sources', () => {
    expect(validateArticle(base, 'es')).toEqual([]);
    expect(validateArticle(base, 'en')).toEqual([]);
  });

  it('rejects a figure without a source in its paragraph, which is how made-up data slipped in', () => {
    const a = { ...base, content_es: base.content_es + '<p>Según datos de 2026, el 80% de las búsquedas son móviles.</p>' };
    expect(validateArticle(a, 'es').join('\n')).toMatch(/cifra sin fuente enlazada.*80%/);
  });

  it('allows repeating a figure already cited with a source further up', () => {
    const a = { ...base, content_es: base.content_es + '<p>Un sitio de $15,000 que nadie encuentra sale caro.</p>' };
    expect(validateArticle(a, 'es')).toEqual([]);
    const b = { ...base, content_es: base.content_es + '<p>Un sitio de $15,000 que nadie encuentra sale caro, y el 40% lo abandona.</p>' };
    expect(validateArticle(b, 'es').join('\n')).toMatch(/cifra sin fuente.*40%/);
  });

  it('rejects figures in list items without a link', () => {
    const a = { ...base, content_es: base.content_es + '<ul><li>Ahorra 30% en costos</li></ul>' };
    expect(validateArticle(a, 'es').join('\n')).toMatch(/cifra sin fuente enlazada.*30%/);
  });

  it('requires links and sources to match both ways', () => {
    const undeclared = { ...base, content_es: base.content_es + '<p>Ver <a href="https://otra.com/x">otra</a>.</p>' };
    expect(validateArticle(undeclared, 'es').join('\n')).toMatch(/otra\.com.*no está declarado/);

    const unlinked = { ...base, sources: [...base.sources, { url: 'https://tercera.com/y', title: 't', supports: 'r' }] };
    expect(validateArticle(unlinked, 'es').join('\n')).toMatch(/tercera\.com.*no se enlaza/);
  });

  it('does not count wa.me or imsoft.io as sources', () => {
    const a = { ...base, sources: [{ url: 'https://www.imsoft.io/es', title: 'x', supports: 'y' }] };
    const p = validateArticle(a, 'es').join('\n');
    expect(p).toMatch(/no es externa/);
    expect(p).toMatch(/solo 1 fuentes/);
    const withCta = { ...base, content_es: base.content_es + '<p><a href="https://wa.me/523325365558">WhatsApp</a></p>' };
    expect(validateArticle(withCta, 'es')).toEqual([]);
  });

  it('rejects h1, markdown, long titles and short articles', () => {
    const p = validateArticle(
      { ...base, title_es: 'x'.repeat(71), content_es: '<h1>Hola</h1>\n## sub\n<p>corto</p>' },
      'es',
    ).join('\n');
    expect(p).toMatch(/70 caracteres/);
    expect(p).toMatch(/<h1>/);
    expect(p).toMatch(/markdown/);
    expect(p).toMatch(/palabras/);
    expect(p).toMatch(/no enlaza ninguna fuente/);
  });
});

describe('countWords', () => {
  it('counts text, not tags', () => {
    expect(countWords('<p>uno <strong>dos</strong> tres</p>')).toBe(3);
    expect(countWords('')).toBe(0);
  });
});
