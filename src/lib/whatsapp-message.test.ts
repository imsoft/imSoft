import { describe, it, expect } from 'vitest';
import { whatsAppMessage } from './whatsapp-message';

describe('whatsAppMessage', () => {
  it('names the service when opened from its page', () => {
    expect(whatsAppMessage('/es/services/web-pages', 'es')).toContain('una página web');
    expect(whatsAppMessage('/es/services/tiendas-en-linea', 'es')).toContain('una tienda en línea');
    expect(whatsAppMessage('/es/services/aplicaciones-moviles', 'es')).toContain(
      'una aplicación móvil',
    );
  });

  it('names city and industry on the landings', () => {
    const m = whatsAppMessage('/es/guadalajara/software-para-inmobiliarias', 'es');
    expect(m).toContain('Guadalajara');
    expect(m).toContain('inmobiliarias');

    // The CDMX and Monterrey industry landings no longer exist (they redirect to the
    // city + service ones): the message for those routes is the new landing's.
    const cdmx = whatsAppMessage('/es/cdmx/empresas-de-software', 'es');
    expect(cdmx).toContain('desarrollo de software en cdmx');
  });

  it('recognizes the Zapopan landing', () => {
    expect(whatsAppMessage('/es/zapopan/paginas-web', 'es')).toContain('Zapopan');
    expect(whatsAppMessage('/es/guadalajara/paginas-web', 'es')).toContain('páginas web en guadalajara');
    expect(whatsAppMessage('/es/guadalajara/desarrollo-de-apps', 'es')).toContain('desarrollo de apps en guadalajara');
  });

  it('tells portfolio and blog apart', () => {
    expect(whatsAppMessage('/es/portfolio', 'es')).toContain('portafolio');
    expect(whatsAppMessage('/es/blog/lo-que-sea', 'es')).toContain('blog');
  });

  it('falls back to the generic message where the context adds nothing', () => {
    const generic = 'me gustaría conocer más sobre sus servicios';
    expect(whatsAppMessage('/es', 'es')).toContain(generic);
    expect(whatsAppMessage('/es/about', 'es')).toContain(generic);
    // A service not in the short list also falls here, instead of breaking.
    expect(whatsAppMessage('/es/services/paid-media', 'es')).toContain(generic);
  });

  it('works in English', () => {
    expect(whatsAppMessage('/en/services/web-pages', 'en')).toContain('a website');
    expect(whatsAppMessage('/en/portfolio', 'en')).toContain('portfolio');
    expect(whatsAppMessage('/en', 'en')).toContain('learn more about your services');
  });

  it('does not depend on the language prefix to read the route', () => {
    expect(whatsAppMessage('/services/web-pages', 'es')).toContain('una página web');
  });

  it('an unknown language falls back to Spanish, which is the main market', () => {
    expect(whatsAppMessage('/es/portfolio', 'pt')).toContain('portafolio');
  });

  it('all the messages fit in a WhatsApp URL without problems', () => {
    const routes = [
      '/es',
      '/es/portfolio',
      '/es/blog/x',
      '/es/services/web-pages',
      '/es/guadalajara/software-para-clinicas',
      '/es/zapopan/paginas-web',
    ];
    for (const r of routes) {
      const msg = whatsAppMessage(r, 'es');
      expect(msg.length).toBeGreaterThan(20);
      expect(msg.length).toBeLessThan(300);
      expect(msg).toContain('imSoft');
    }
  });
});
