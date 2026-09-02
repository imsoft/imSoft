import { describe, it, expect } from 'vitest';
import { businessSchema, websiteSchema } from './structured-data';
import { BUSINESS } from '@/config/business';

const SITE = 'https://www.imsoft.io';

/**
 * Estas pruebas existen sobre todo para impedir que vuelva a colarse un dato inventado.
 * El schema anterior declaraba coordenadas del centro de Guadalajara y un radio de
 * servicio de 50 km que nadie confirmo; si eso no coincide con Google Business Profile,
 * resta credibilidad a la ficha en vez de sumarla.
 */
describe('schema del negocio', () => {
  const org = businessSchema('es');

  it('no declara datos que nadie confirmo', () => {
    for (const schema of [org] as Record<string, unknown>[]) {
      expect(schema).not.toHaveProperty('geo');
      expect(schema).not.toHaveProperty('serviceArea');
      expect(schema).not.toHaveProperty('priceRange');
      expect(schema).not.toHaveProperty('aggregateRating');
    }
  });

  it('no declara un domicilio visitable: no hay local que reciba clientes', () => {
    expect(org).not.toHaveProperty('geo');
    expect(org).not.toHaveProperty('hasMap');
    expect(org.address).not.toHaveProperty('streetAddress');
  });

  it('publica el horario exacto de Google Business Profile, domingo incluido', () => {
    const [semana, domingo] = org.openingHoursSpecification;
    expect(semana.dayOfWeek).toHaveLength(6);
    expect(semana.dayOfWeek).toContain('Saturday');
    expect(semana.opens).toBe('09:00');
    expect(semana.closes).toBe('18:00');

    // El domingo cierra antes; declararlo igual que el resto contradiria la ficha.
    expect(domingo.dayOfWeek).toEqual(['Sunday']);
    expect(domingo.closes).toBe('13:00');
  });

  it('los siete dias estan cubiertos, sin repetirse', () => {
    const dias = org.openingHoursSpecification.flatMap((s) => s.dayOfWeek);
    expect(new Set(dias).size).toBe(7);
    expect(dias).toHaveLength(7);
  });

  it('el telefono va en E.164', () => {
    expect(org.telephone).toBe('+523325365558');
    expect(org.telephone).toMatch(/^\+[1-9]\d{7,14}$/);
  });

  it('sameAs solo lleva URLs publicas', () => {
    expect(org.sameAs.length).toBeGreaterThan(0);
    for (const url of org.sameAs) {
      expect(url).toMatch(/^https:\/\//);
      // La URL de LinkedIn que habia en la BD era el panel de administracion.
      expect(url).not.toContain('/admin');
      expect(url).not.toContain('/dashboard');
    }
  });

  it('es un solo nodo ProfessionalService, no dos empresas enlazadas', () => {
    // ProfessionalService ya hereda de Organization. Un segundo nodo unido por
    // parentOrganization declararia que imSoft tiene una matriz llamada imSoft.
    expect(org['@type']).toBe('ProfessionalService');
    expect(org['@id']).toBe(`${SITE}/#organization`);
    expect(org).not.toHaveProperty('parentOrganization');
  });

  it('el @type es una cadena, no un array', () => {
    // validator.schema.org descarta el nodo entero, sin dar error, cuando @type es
    // un array de tipos. Verificado en produccion.
    expect(Array.isArray(org['@type'])).toBe(false);
  });

  it('no usa availableLanguage fuera de ContactPoint', () => {
    // El validador de schema.org lo marca como UNKNOWN_FIELD en LocalBusiness.
    expect(org).not.toHaveProperty('availableLanguage');
    expect(org.contactPoint.availableLanguage).toEqual(['Spanish', 'English']);
  });

  it('el @id no colisiona con la URL de una pagina real', () => {
    // Antes LocalBusiness usaba `@id: https://www.imsoft.io/es`, que es la home.
    for (const schema of [org, websiteSchema('es')]) {
      expect(schema['@id']).toContain('#');
    }
  });

  it('la direccion declara Guadalajara, Jalisco, MX', () => {
    expect(org.address).toMatchObject({
      '@type': 'PostalAddress',
      addressLocality: 'Guadalajara',
      addressRegion: 'Jalisco',
      addressCountry: 'MX',
    });
  });

  it('areaServed coincide con las areas de Google Business Profile', () => {
    // Si la ficha y el schema declaran zonas distintas, Google recibe dos versiones
    // del alcance del negocio.
    const names = org.areaServed.map((a) => a.name);
    for (const zona of [
      'Guadalajara',
      'Zapopan',
      'Tlaquepaque',
      'Tonalá',
      'Tlajomulco de Zúñiga',
      'Mexico City',
      'Monterrey',
    ]) {
      expect(names).toContain(zona);
    }
    expect(names).toContain('Jalisco');
  });

  it('todo el bloque serializa a JSON valido', () => {
    for (const schema of [org, websiteSchema('en')]) {
      expect(() => JSON.parse(JSON.stringify(schema))).not.toThrow();
      expect(schema['@context']).toBe('https://schema.org');
    }
  });

  it('el correo coincide con el configurado', () => {
    expect(org.email).toBe(BUSINESS.email);
  });
});

describe('referencias entre bloques', () => {
  it('WebSite no referencia al negocio por @id', () => {
    // Ver el comentario de structured-data.ts: una referencia `{'@id': ...}` desde otro
    // bloque hace que validator.schema.org descarte el nodo del negocio en silencio.
    expect(websiteSchema('es')).not.toHaveProperty('publisher');
  });
});
