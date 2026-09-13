import { describe, it, expect } from 'vitest';
import {
  MAX_TITLE_OVERLAP,
  contarPalabras,
  pickNextTopic,
  slugify,
  titleOverlap,
  validateArticle,
  type GeneratedArticle,
  type QueueTopic,
} from './blog-generator';
import cola from '../../content/blog-queue.json';

const tema = (slug_es: string, slug_en = `${slug_es}-en`): QueueTopic => ({
  slug_es,
  slug_en,
  busqueda: slug_es.replace(/-/g, ' '),
  angulo: 'x',
  categoria: 'business',
});

describe('pickNextTopic', () => {
  it('devuelve el primer tema que aun no tiene post, por cualquiera de sus dos slugs', () => {
    const queue = [tema('a'), tema('b'), tema('c')];
    expect(pickNextTopic(queue, ['a'])?.slug_es).toBe('b');
    expect(pickNextTopic(queue, ['a', 'b-en'])?.slug_es).toBe('c');
  });

  it('devuelve null con la cola agotada: mejor no publicar que repetir', () => {
    expect(pickNextTopic([tema('a')], ['a'])).toBeNull();
    expect(pickNextTopic([], [])).toBeNull();
  });
});

describe('content/blog-queue.json', () => {
  it('tiene entradas completas, sin slugs repetidos y con slugs ya normalizados', () => {
    const temas = (cola as { temas: QueueTopic[] }).temas;
    expect(temas.length).toBeGreaterThan(0);
    const vistos = new Set<string>();
    for (const t of temas) {
      for (const k of ['slug_es', 'slug_en', 'busqueda', 'angulo', 'categoria'] as const) {
        expect(t[k], `${t.slug_es}.${k}`).toBeTruthy();
      }
      expect(t.slug_es).toBe(slugify(t.slug_es));
      expect(t.slug_en).toBe(slugify(t.slug_en));
      expect(vistos.has(t.slug_es), t.slug_es).toBe(false);
      vistos.add(t.slug_es);
      vistos.add(t.slug_en);
    }
  });
});

describe('slugify', () => {
  it('quita acentos, signos y limita a 80 caracteres', () => {
    expect(slugify('¿Cuánto cuesta una página web en México?')).toBe('cuanto-cuesta-una-pagina-web-en-mexico');
    expect(slugify('a'.repeat(100)).length).toBe(80);
    expect(slugify('dos  --  guiones')).toBe('dos-guiones');
  });
});

describe('titleOverlap', () => {
  it('detecta un titulo reformulado', () => {
    const s = titleOverlap(
      '5 Errores Comunes al Lanzar tu Tienda Online que Cuestan Dinero',
      '5 Errores que te Cuestan Ventas en tu Tienda Online',
    );
    expect(s).toBeGreaterThanOrEqual(MAX_TITLE_OVERLAP);
  });

  it('no confunde dos entregas de la serie "cuanto cuesta X en Mexico"', () => {
    expect(
      titleOverlap(
        '¿Cuánto cuesta una página web en México? Precios reales 2026',
        '¿Cuánto cuesta desarrollar una app en México? Rangos reales 2026',
      ),
    ).toBeLessThan(MAX_TITLE_OVERLAP);
  });

  it('deja pasar temas distintos aunque compartan palabras sueltas', () => {
    expect(titleOverlap('Cuánto cuesta una página web', 'Cuánto cuesta mantener una app')).toBeLessThan(
      MAX_TITLE_OVERLAP,
    );
  });
});

const parrafo = (n: number, texto: string) => `<p>${Array(n).fill(texto).join(' ')}</p>`;
const relleno = parrafo(190, 'palabra de relleno sin cifras');

const base: GeneratedArticle = {
  title_es: '¿Cuánto cuesta una página web en México?',
  title_en: 'How much does a website cost in Mexico?',
  excerpt_es: 'Rangos publicados y qué incluye cada uno.',
  excerpt_en: 'Published ranges and what each includes.',
  content_es: `<h2>Rangos</h2><p>Alcodea publica de $15,000 a $50,000 MXN para una básica (<a href="https://alcodea.com/precios">fuente</a>).</p><p>Magokoro coincide, ver <a href="https://www.magokoro.mx/blog/precios">su tabla</a>.</p>${relleno}`,
  content_en: `<h2>Ranges</h2><p>Alcodea publishes MXN $15,000 to $50,000 for a basic site (<a href="https://alcodea.com/precios">source</a>).</p><p>Magokoro agrees, see <a href="https://www.magokoro.mx/blog/precios">their table</a>.</p>${relleno}`,
  fuentes: [
    { url: 'https://alcodea.com/precios', titulo: 'Alcodea', respalda: 'rango básica' },
    { url: 'https://www.magokoro.mx/blog/precios', titulo: 'Magokoro', respalda: 'rango básica' },
  ],
};

describe('validateArticle', () => {
  it('acepta un articulo con cifras enlazadas y fuentes declaradas', () => {
    expect(validateArticle(base, 'es')).toEqual([]);
    expect(validateArticle(base, 'en')).toEqual([]);
  });

  it('rechaza una cifra sin fuente en su parrafo, que es como se colaban los datos inventados', () => {
    const a = { ...base, content_es: base.content_es + '<p>Según datos de 2026, el 80% de las búsquedas son móviles.</p>' };
    expect(validateArticle(a, 'es').join('\n')).toMatch(/cifra sin fuente enlazada.*80%/);
  });

  it('permite repetir una cifra que ya se cito con fuente mas arriba', () => {
    const a = { ...base, content_es: base.content_es + '<p>Un sitio de $15,000 que nadie encuentra sale caro.</p>' };
    expect(validateArticle(a, 'es')).toEqual([]);
    const b = { ...base, content_es: base.content_es + '<p>Un sitio de $15,000 que nadie encuentra sale caro, y el 40% lo abandona.</p>' };
    expect(validateArticle(b, 'es').join('\n')).toMatch(/cifra sin fuente.*40%/);
  });

  it('rechaza cifras en items de lista sin enlace', () => {
    const a = { ...base, content_es: base.content_es + '<ul><li>Ahorra 30% en costos</li></ul>' };
    expect(validateArticle(a, 'es').join('\n')).toMatch(/cifra sin fuente enlazada.*30%/);
  });

  it('exige que enlaces y fuentes coincidan en los dos sentidos', () => {
    const sinDeclarar = { ...base, content_es: base.content_es + '<p>Ver <a href="https://otra.com/x">otra</a>.</p>' };
    expect(validateArticle(sinDeclarar, 'es').join('\n')).toMatch(/otra\.com.*no está declarado/);

    const sinEnlazar = { ...base, fuentes: [...base.fuentes, { url: 'https://tercera.com/y', titulo: 't', respalda: 'r' }] };
    expect(validateArticle(sinEnlazar, 'es').join('\n')).toMatch(/tercera\.com.*no se enlaza/);
  });

  it('no cuenta wa.me ni imsoft.io como fuentes', () => {
    const a = { ...base, fuentes: [{ url: 'https://www.imsoft.io/es', titulo: 'x', respalda: 'y' }] };
    const p = validateArticle(a, 'es').join('\n');
    expect(p).toMatch(/no es externa/);
    expect(p).toMatch(/solo 1 fuentes/);
    const conCta = { ...base, content_es: base.content_es + '<p><a href="https://wa.me/523325365558">WhatsApp</a></p>' };
    expect(validateArticle(conCta, 'es')).toEqual([]);
  });

  it('rechaza h1, markdown, titulos largos y articulos cortos', () => {
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

describe('contarPalabras', () => {
  it('cuenta texto, no etiquetas', () => {
    expect(contarPalabras('<p>uno <strong>dos</strong> tres</p>')).toBe(3);
    expect(contarPalabras('')).toBe(0);
  });
});
