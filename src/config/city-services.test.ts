import { describe, expect, it } from 'vitest';
import { CITY_SERVICES, CITY_SERVICE_CITY_LABELS, CITY_SERVICE_SLUGS, cityServiceContent, cityServiceHref, cityServicePages, cityServiceTitle } from './city-services';
import { ZAPOPAN_WEB } from './zapopan-web';
import { landingPagesData } from './landing-pages-data';

/**
 * Las 31 landings de industria con plantilla suman 0 clics en 90 dias (Search Console,
 * sep-2026). La causa es que son la misma pagina con otra ciudad. Estas pruebas evitan
 * repetirlo: cada landing de ciudad + servicio tiene que ser distinta de todas las demas.
 */
const paginas = cityServicePages().map(({ city, slug }) => ({ city, slug, c: CITY_SERVICES[city][slug]! }));

const bloques = (c: (typeof paginas)[number]['c']) =>
  [
    c.heroSubtitle,
    ...c.audience.items.map((i) => i.description),
    ...c.problems.items,
    ...c.solutions.items.map((i) => i.description),
    ...c.faq.items.map((i) => i.answer),
  ].map((t) => t.toLowerCase().trim());

describe('landings de ciudad + servicio', () => {
  it('existen las cuatro de Guadalajara y Monterrey, tres de CDMX, y se resuelven por ruta', () => {
    expect(paginas.filter((p) => p.city === 'guadalajara').map((p) => p.slug).sort()).toEqual([...CITY_SERVICE_SLUGS].sort());
    expect(paginas.filter((p) => p.city === 'monterrey').map((p) => p.slug).sort()).toEqual([...CITY_SERVICE_SLUGS].sort());
    // En CDMX el autocompletado no sugiere "desarrollo de apps cdmx": esa pagina no se hace.
    expect(paginas.filter((p) => p.city === 'cdmx').map((p) => p.slug).sort()).toEqual(['empresas-de-software', 'paginas-web', 'tiendas-en-linea']);
    expect(cityServiceContent('cdmx', 'desarrollo-de-apps')).toBeNull();
    expect(cityServiceContent('guadalajara', 'paginas-web')?.h1).toBe('Páginas Web en Guadalajara');
    expect(cityServiceContent('guadalajara', 'software-para-clinicas')).toBeNull();
    expect(cityServiceContent('monterrey', 'paginas-web')?.h1).toBe('Páginas Web en Monterrey');
    expect(cityServiceHref('es', 'guadalajara', 'tiendas-en-linea')).toBe('/es/guadalajara/tiendas-en-linea');
    expect(cityServiceTitle('guadalajara', 'desarrollo-de-apps')).toBe('Desarrollo de apps en Guadalajara');
  });

  it('cada pagina nombra la ciudad en titulo, h1 y descripcion, y la descripcion cabe en Google', () => {
    for (const { city, c } of paginas) {
      const nombres = city === 'cdmx' ? ['CDMX', 'Ciudad de México'] : [CITY_SERVICE_CITY_LABELS[city]];
      const menciona = (t: string) => nombres.some((n) => t.includes(n));
      expect(menciona(c.seoTitle), `${city}: titulo sin ciudad`).toBe(true);
      expect(menciona(c.h1), `${city}: h1 sin ciudad`).toBe(true);
      expect(menciona(c.seoDescription), `${city}: descripcion sin ciudad`).toBe(true);
      expect(c.seoDescription.length).toBeLessThanOrEqual(160);
      expect(c.seoTitle.length).toBeLessThanOrEqual(65);
    }
  });

  it('apuntan a lo que la gente teclea, no a como lo llama quien programa', () => {
    // Autocompletado de Google (es-MX, 21-sep-2026): "paginas web guadalajara",
    // "empresas de desarrollo de software guadalajara", "tienda en linea guadalajara",
    // "desarrollo de apps guadalajara". Nadie busca "software a la medida guadalajara".
    const g = CITY_SERVICES.guadalajara;
    expect(g['paginas-web']!.h1.toLowerCase()).toContain('páginas web');
    expect(g['empresas-de-software']!.h1.toLowerCase()).toContain('empresa de desarrollo de software');
    expect(g['tiendas-en-linea']!.h1.toLowerCase()).toContain('tiendas en línea');
    expect(g['desarrollo-de-apps']!.h1.toLowerCase()).toContain('desarrollo de apps');
  });

  it('ningun parrafo se repite entre paginas, ni con Zapopan, ni con las landings de industria', () => {
    // Lo ya existente se registra sin comprobar (las landings de industria SI se repiten
    // entre ciudades: es justo el problema que estas paginas no deben heredar).
    const existentes = new Map<string, string>();
    for (const t of [ZAPOPAN_WEB.heroSubtitle, ...ZAPOPAN_WEB.problems.items, ...ZAPOPAN_WEB.solutions.items.map((s) => s.description)]) existentes.set(t.toLowerCase().trim(), 'zapopan');
    for (const [city, porIndustria] of Object.entries(landingPagesData)) {
      for (const [ind, l] of Object.entries(porIndustria)) {
        for (const t of [...l.problems.items, ...l.solutions.items.map((s) => s.description)]) existentes.set(t.toLowerCase().trim(), `${city}/${ind}`);
      }
    }
    const nuevos = new Map<string, string>();
    for (const p of paginas) {
      for (const t of bloques(p.c)) {
        if (t.length < 25) continue;
        expect(existentes.get(t), `"${t.slice(0, 60)}" ya existe en ${existentes.get(t)}`).toBeUndefined();
        expect(nuevos.get(t), `"${t.slice(0, 60)}" se repite en ${nuevos.get(t)} y ${p.city}/${p.slug}`).toBeUndefined();
        nuevos.set(t, `${p.city}/${p.slug}`);
      }
    }
  });

  it('Monterrey y CDMX dicen que se atiende a distancia desde Guadalajara, sin inventar oficina', () => {
    for (const { city, c } of paginas.filter((p) => p.city !== 'guadalajara')) {
      const texto = JSON.stringify(c).toLowerCase();
      expect(texto, `${city}/${c.h1}`).toMatch(/a distancia|videollamada/);
      expect(texto, `${city}/${c.h1}`).toContain('guadalajara');
      expect(texto).not.toMatch(/nuestra oficina en (monterrey|cdmx|la ciudad de méxico)/);
    }
  });

  it('los proyectos citados existen en el portafolio y no se les atribuye ciudad', () => {
    // Slugs reales de la tabla portfolio (sep-2026).
    const reales = new Set(['lc-suplements', 'aduvanta', 'carsbybran', 'steridantal-order-generator', 'jtp-logistics-inventory', 'starfilters-report-generator', 'starfilters', 'the-podstore', 'bemastra-dental', 'rm-construction', 'the-paste-house', 'wellpoint', 'omnitria', 'tuxcacuesco', 'brangarciaramos', 'cursumi', 'intelligent-construction', 'business-and-customs-infinity', 'profibra', 'ortiz-and-co', 'ferreacabados-jalisco', 'jtp-logistics', 'national-gold']);
    for (const { c } of paginas) {
      expect(c.proof.items.length).toBeGreaterThanOrEqual(3);
      for (const item of c.proof.items) {
        expect(reales.has(item.slug ?? ''), `slug ${item.slug} no existe en el portafolio`).toBe(true);
        expect(item.description.toLowerCase()).not.toMatch(/en guadalajara|de guadalajara|en zapopan|en monterrey|en cdmx|ciudad de méxico/);
      }
    }
  });

  it('los precios "desde" son los publicados en el sitio', () => {
    const publicados = ['Desde $5,000 MXN', 'Desde $15,000 MXN', 'Desde $60,000 MXN', 'Desde $150,000 MXN'];
    for (const { c } of paginas) {
      for (const item of c.pricing?.items ?? []) expect(publicados).toContain(item.price);
    }
    // Tiendas en linea no tiene precio publicado: no se inventa uno.
    for (const { c, slug } of paginas) if (slug === 'tiendas-en-linea') expect(c.pricing).toBeUndefined();
  });

  it('cada pagina tiene preguntas frecuentes y el horario coincide con el del schema', () => {
    for (const { c } of paginas) {
      expect(c.faq.items.length).toBeGreaterThanOrEqual(4);
      expect(c.cta.description).toContain('9:00 a 18:00');
      expect(c.cta.description).toContain('9:00 a 13:00');
    }
  });
});
