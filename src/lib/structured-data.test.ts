import { describe, it, expect } from 'vitest';
import {
  organizationSchema,
  professionalServiceSchema,
  websiteSchema,
} from './structured-data';
import { BUSINESS } from '@/config/business';

const SITE = 'https://www.imsoft.io';

/**
 * Estas pruebas existen sobre todo para impedir que vuelva a colarse un dato inventado.
 * El schema anterior declaraba coordenadas del centro de Guadalajara, un radio de
 * servicio de 50 km y un horario que nadie confirmo; si eso no coincide con Google
 * Business Profile, resta credibilidad a la ficha en vez de sumarla.
 */
describe('schema del negocio', () => {
  const org = organizationSchema('es');
  const svc = professionalServiceSchema('es');

  it('no declara datos que nadie confirmo', () => {
    for (const schema of [org, svc] as Record<string, unknown>[]) {
      expect(schema).not.toHaveProperty('geo');
      expect(schema).not.toHaveProperty('serviceArea');
      expect(schema).not.toHaveProperty('openingHours');
      expect(schema).not.toHaveProperty('openingHoursSpecification');
      expect(schema).not.toHaveProperty('priceRange');
      expect(schema).not.toHaveProperty('aggregateRating');
    }
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

  it('Organization y ProfessionalService son la misma entidad, no dos empresas', () => {
    expect(org['@id']).toBe(`${SITE}/#organization`);
    expect(svc['@id']).toBe(`${SITE}/#professionalservice`);
    expect(svc['@id']).not.toBe(org['@id']);
    expect(svc.parentOrganization).toEqual({ '@id': org['@id'] });
  });

  it('el @id no colisiona con la URL de una pagina real', () => {
    // Antes LocalBusiness usaba `@id: https://www.imsoft.io/es`, que es la home.
    for (const schema of [org, svc, websiteSchema('es')]) {
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

  it('areaServed cubre la zona metropolitana, no solo el pais', () => {
    const names = org.areaServed.map((a) => a.name);
    expect(names).toContain('Guadalajara');
    expect(names).toContain('Zapopan');
    expect(names).toContain('Jalisco');
  });

  it('el sitio web cuelga de la Organization', () => {
    expect(websiteSchema('es').publisher).toEqual({ '@id': org['@id'] });
  });

  it('todo el bloque serializa a JSON valido', () => {
    for (const schema of [org, svc, websiteSchema('en')]) {
      expect(() => JSON.parse(JSON.stringify(schema))).not.toThrow();
      expect(schema['@context']).toBe('https://schema.org');
    }
  });

  it('el correo coincide con el configurado', () => {
    expect(org.email).toBe(BUSINESS.email);
    expect(svc.email).toBe(BUSINESS.email);
  });
});
