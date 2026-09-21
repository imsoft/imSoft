import { describe, it, expect } from 'vitest';
import { whatsAppMessage } from './whatsapp-message';

describe('whatsAppMessage', () => {
  it('nombra el servicio cuando se abre desde su pagina', () => {
    expect(whatsAppMessage('/es/services/web-pages', 'es')).toContain('una página web');
    expect(whatsAppMessage('/es/services/tiendas-en-linea', 'es')).toContain('una tienda en línea');
    expect(whatsAppMessage('/es/services/aplicaciones-moviles', 'es')).toContain(
      'una aplicación móvil',
    );
  });

  it('nombra ciudad e industria en las landings', () => {
    const m = whatsAppMessage('/es/guadalajara/software-para-inmobiliarias', 'es');
    expect(m).toContain('Guadalajara');
    expect(m).toContain('inmobiliarias');

    // Las landings de industria de CDMX y Monterrey ya no existen (redirigen a las de
    // ciudad + servicio): el mensaje de esas rutas es el de la landing nueva.
    const cdmx = whatsAppMessage('/es/cdmx/empresas-de-software', 'es');
    expect(cdmx).toContain('desarrollo de software en cdmx');
  });

  it('reconoce la landing de Zapopan', () => {
    expect(whatsAppMessage('/es/zapopan/paginas-web', 'es')).toContain('Zapopan');
    expect(whatsAppMessage('/es/guadalajara/paginas-web', 'es')).toContain('páginas web en guadalajara');
    expect(whatsAppMessage('/es/guadalajara/desarrollo-de-apps', 'es')).toContain('desarrollo de apps en guadalajara');
  });

  it('distingue portafolio y blog', () => {
    expect(whatsAppMessage('/es/portfolio', 'es')).toContain('portafolio');
    expect(whatsAppMessage('/es/blog/lo-que-sea', 'es')).toContain('blog');
  });

  it('cae al mensaje generico donde el contexto no aporta', () => {
    const generico = 'me gustaría conocer más sobre sus servicios';
    expect(whatsAppMessage('/es', 'es')).toContain(generico);
    expect(whatsAppMessage('/es/about', 'es')).toContain(generico);
    // Un servicio que no esta en la lista corta tambien cae aqui, en vez de romper.
    expect(whatsAppMessage('/es/services/paid-media', 'es')).toContain(generico);
  });

  it('funciona en ingles', () => {
    expect(whatsAppMessage('/en/services/web-pages', 'en')).toContain('a website');
    expect(whatsAppMessage('/en/portfolio', 'en')).toContain('portfolio');
    expect(whatsAppMessage('/en', 'en')).toContain('learn more about your services');
  });

  it('no depende del prefijo de idioma para leer la ruta', () => {
    expect(whatsAppMessage('/services/web-pages', 'es')).toContain('una página web');
  });

  it('un idioma desconocido cae en espanol, que es el mercado principal', () => {
    expect(whatsAppMessage('/es/portfolio', 'pt')).toContain('portafolio');
  });

  it('todos los mensajes caben en una URL de WhatsApp sin problemas', () => {
    const rutas = [
      '/es',
      '/es/portfolio',
      '/es/blog/x',
      '/es/services/web-pages',
      '/es/guadalajara/software-para-clinicas',
      '/es/zapopan/paginas-web',
    ];
    for (const r of rutas) {
      const msg = whatsAppMessage(r, 'es');
      expect(msg.length).toBeGreaterThan(20);
      expect(msg.length).toBeLessThan(300);
      expect(msg).toContain('imSoft');
    }
  });
});
