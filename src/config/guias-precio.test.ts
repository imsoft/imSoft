import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GUIAS_PRECIO, GUIA_PRECIO_SLUGS, PRECIO_DE_SERVICIO, guiaPrecio, guiaPrecioHref } from './guias-precio';
import { CITY_SERVICES, cityServicePages } from './city-services';

const leer = (p: string) => fs.readFileSync(path.join(__dirname, '..', '..', p), 'utf8');
const guias = GUIA_PRECIO_SLUGS.map((slug) => ({ slug, g: GUIAS_PRECIO[slug] }));
const bloques = (c: (typeof guias)[number]['g']) =>
  [c.heroSubtitle, ...c.audience.items.map((i) => i.description), ...c.problems.items, ...c.solutions.items.map((i) => i.description), ...c.faq.items.map((i) => i.answer)].map((t) => t.toLowerCase().trim());

describe('guias "cuanto cuesta"', () => {
  it('responden la pregunta tal como se busca y caben en Google', () => {
    for (const { slug, g } of guias) {
      expect(g.h1.toLowerCase(), slug).toMatch(/^¿cuánto cuesta/);
      expect(g.seoTitle.length, slug).toBeLessThanOrEqual(65);
      expect(g.seoDescription.length, slug).toBeLessThanOrEqual(160);
      expect(g.faq.items.length).toBeGreaterThanOrEqual(4);
    }
    expect(guiaPrecio('software-a-la-medida')?.h1).toBe('¿Cuánto cuesta un software a la medida para una empresa?');
    // Pagina web y app las responde el blog: una guia con la misma pregunta competiria con el.
    expect(guiaPrecio('pagina-web')).toBeNull();
    expect(guiaPrecio('app')).toBeNull();
    expect(guiaPrecioHref('es', 'software-a-la-medida')).toBe('/es/cuanto-cuesta/software-a-la-medida');
  });

  it('solo usan los precios publicados en el sitio, y los mismos del hero van en la tabla', () => {
    const publicados = ['Desde $5,000 MXN', 'Desde $15,000 MXN', 'Desde $60,000 MXN', 'Desde $150,000 MXN'];
    for (const { slug, g } of guias) {
      for (const item of g.pricing!.items) expect(publicados, slug).toContain(item.price);
      for (const cifra of g.heroSubtitle.match(/\$[\d,]+/g) ?? []) expect(g.pricing!.items.some((i) => i.price.includes(cifra)), `${slug}: ${cifra}`).toBe(true);
    }
    // Tienda en linea no tiene precio publicado: no hay guia hasta tenerlo.
    expect(GUIA_PRECIO_SLUGS).not.toContain('tienda-en-linea');
  });

  it('los proyectos citados existen en el portafolio', () => {
    const reales = new Set(['lc-suplements', 'aduvanta', 'carsbybran', 'steridantal-order-generator', 'jtp-logistics-inventory', 'starfilters-report-generator', 'starfilters', 'the-podstore', 'bemastra-dental', 'rm-construction', 'the-paste-house', 'wellpoint', 'omnitria', 'tuxcacuesco', 'brangarciaramos', 'cursumi', 'intelligent-construction', 'business-and-customs-infinity', 'profibra', 'ortiz-and-co', 'ferreacabados-jalisco', 'jtp-logistics', 'national-gold']);
    for (const { g } of guias) for (const p of g.proof.items) expect(reales.has(p.slug ?? ''), p.slug).toBe(true);
  });

  it('ningun parrafo se repite entre guias ni con las landings de ciudad', () => {
    const vistos = new Map<string, string>();
    for (const { city, slug } of cityServicePages()) {
      const c = CITY_SERVICES[city][slug]!;
      for (const t of [c.heroSubtitle, ...c.audience.items.map((i) => i.description), ...c.problems.items, ...c.solutions.items.map((i) => i.description), ...c.faq.items.map((i) => i.answer)]) vistos.set(t.toLowerCase().trim(), `${city}/${slug}`);
    }
    for (const { slug, g } of guias) {
      for (const t of bloques(g)) {
        if (t.length < 25) continue;
        expect(vistos.get(t), `"${t.slice(0, 60)}" ya esta en ${vistos.get(t)}`).toBeUndefined();
        vistos.set(t, `guia/${slug}`);
      }
    }
  });

  it('estan en el sitemap y enlazadas desde la portada y las landings de su servicio', () => {
    expect(leer('src/app/sitemap.ts')).toContain('/es/cuanto-cuesta/${slug}');
    const precios = leer('src/components/blocks/pricing-section.tsx');
    for (const { href } of Object.values(PRECIO_DE_SERVICIO)) expect(precios).toContain(href);
    for (const slug of GUIA_PRECIO_SLUGS) expect(Object.values(PRECIO_DE_SERVICIO).map((p) => p.href)).toContain(`/es/cuanto-cuesta/${slug}`);
    expect(leer('src/app/[lang]/[city]/[service]/page.tsx')).toContain('precioDeServicio(slug)');
  });
});
