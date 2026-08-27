import { describe, it, expect } from 'vitest';
import {
  localizedServiceTitle,
  localizedServiceDescription,
  serviceAreaSentence,
} from './service-seo';

describe('localizedServiceTitle', () => {
  it('mete la ciudad en los servicios que si son desarrollo', () => {
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

  it('no fuerza "Desarrollo de" donde no aplica', () => {
    // "Desarrollo de Paid Media" no lo dice nadie y delata la plantilla.
    expect(localizedServiceTitle('paid-media', 'Paid Media', 'es')).toBe(
      'Paid Media en Guadalajara',
    );
    expect(localizedServiceTitle('consultoria-tecnologica', 'Consultoría Tecnológica', 'es')).toBe(
      'Consultoría Tecnológica en Guadalajara',
    );
  });

  it('un slug desconocido sigue recibiendo la ciudad, sin prefijo', () => {
    expect(localizedServiceTitle('servicio-nuevo', 'Servicio Nuevo', 'es')).toBe(
      'Servicio Nuevo en Guadalajara',
    );
  });

  it('en ingles nombra el pais, que es lo que ubica a un lector de fuera', () => {
    expect(localizedServiceTitle('web-pages', 'Websites', 'en')).toBe(
      'Web Development in Guadalajara, Mexico',
    );
  });

  it('un titulo vacio se devuelve tal cual, sin construir "en Guadalajara" suelto', () => {
    expect(localizedServiceTitle('web-pages', '', 'es')).toBe('');
  });
});

describe('localizedServiceDescription', () => {
  it('antepone la señal local sin perder la descripcion real', () => {
    const out = localizedServiceDescription('Creamos páginas web profesionales.', 'es');
    expect(out).toContain('Guadalajara');
    expect(out).toContain('páginas web profesionales');
  });

  it('no pasa del limite util de Google', () => {
    const larga = 'palabra '.repeat(80);
    expect(localizedServiceDescription(larga, 'es').length).toBeLessThanOrEqual(155);
  });

  it('normaliza los espacios del texto que viene de la base de datos', () => {
    expect(localizedServiceDescription('uno   dos\n\ntres', 'es')).toContain('uno dos tres');
  });
});

describe('serviceAreaSentence', () => {
  it('nombra los municipios de la zona metropolitana', () => {
    const es = serviceAreaSentence('es');
    for (const m of ['Zapopan', 'Tlaquepaque', 'Tonalá', 'Tlajomulco']) {
      expect(es).toContain(m);
    }
  });

  it('el horario que muestra es el mismo que declara el schema', () => {
    expect(serviceAreaSentence('es')).toContain('09:00');
    expect(serviceAreaSentence('es')).toContain('18:00');
    // El texto visible no puede contradecir a openingHoursSpecification.
    expect(serviceAreaSentence('es')).not.toContain('lunes a viernes');
  });
});
