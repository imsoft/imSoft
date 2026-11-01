import { describe, it, expect } from 'vitest';
import {
  localizedServiceTitle,
  localizedServiceDescription,
  serviceAreaSentence,
} from './service-seo';

describe('localizedServiceTitle', () => {
  it('puts the city in the services that are actually development', () => {
    expect(localizedServiceTitle('web-pages', 'Páginas Web', 'es')).toBe(
      'Desarrollo de Páginas Web en Guadalajara',
    );
    expect(localizedServiceTitle('aplicaciones-moviles', 'Aplicaciones Móviles', 'es')).toBe(
      'Desarrollo de Aplicaciones Móviles en Guadalajara',
    );
    expect(localizedServiceTitle('software-a-medida', 'Software a Medida', 'es')).toBe(
      'Desarrollo de Software a Medida en Guadalajara',
    );
  });

  it('does not force "Desarrollo de" where it does not apply', () => {
    // Nobody says "Desarrollo de Paid Media" and it gives away the template.
    expect(localizedServiceTitle('paid-media', 'Paid Media', 'es')).toBe(
      'Paid Media en Guadalajara',
    );
    expect(localizedServiceTitle('consultoria-tecnologica', 'Consultoría Tecnológica', 'es')).toBe(
      'Consultoría Tecnológica en Guadalajara',
    );
  });

  it('an unknown slug still gets the city, without a prefix', () => {
    expect(localizedServiceTitle('servicio-nuevo', 'Servicio Nuevo', 'es')).toBe(
      'Servicio Nuevo en Guadalajara',
    );
  });

  it('in English it names the country, which is what places a foreign reader', () => {
    expect(localizedServiceTitle('web-pages', 'Websites', 'en')).toBe(
      'Web Development in Guadalajara, Mexico',
    );
  });

  it('an empty title is returned as is, without building a loose "en Guadalajara"', () => {
    expect(localizedServiceTitle('web-pages', '', 'es')).toBe('');
  });
});

describe('localizedServiceDescription', () => {
  it('prepends the local signal without losing the real description', () => {
    const out = localizedServiceDescription('Creamos páginas web profesionales.', 'es');
    expect(out).toContain('Guadalajara');
    expect(out).toContain('páginas web profesionales');
  });

  it("does not exceed Google's useful limit", () => {
    const longText = 'palabra '.repeat(80);
    expect(localizedServiceDescription(longText, 'es').length).toBeLessThanOrEqual(155);
  });

  it('normalizes the whitespace of the text coming from the database', () => {
    expect(localizedServiceDescription('uno   dos\n\ntres', 'es')).toContain('uno dos tres');
  });
});

describe('serviceAreaSentence', () => {
  it('names the municipalities of the metropolitan area', () => {
    const es = serviceAreaSentence('es');
    for (const m of ['Zapopan', 'Tlaquepaque', 'Tonalá', 'Tlajomulco']) {
      expect(es).toContain(m);
    }
  });

  it('the hours it shows are the same ones the schema declares', () => {
    const es = serviceAreaSentence('es');
    // The visible text must not contradict openingHoursSpecification.
    expect(es).toContain('09:00');
    expect(es).toContain('18:00');
    expect(es).toContain('13:00');
    expect(es).not.toContain('lunes a viernes');
    expect(es).not.toContain('los siete días');
  });
});
