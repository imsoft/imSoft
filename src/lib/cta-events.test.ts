import { describe, it, expect } from 'vitest';
import { ctaEventFor, leadEvent } from './cta-events';

const en = (href: string, text = 'x') => ctaEventFor({ href, text, pathname: '/es/services/web-pages' });

describe('ctaEventFor', () => {
  it('reconoce WhatsApp, telefono y correo', () => {
    expect(en('https://wa.me/523325365558?text=Hola')?.name).toBe('contact_whatsapp');
    expect(en('https://api.whatsapp.com/send?phone=52')?.name).toBe('contact_whatsapp');
    expect(en('tel:+523325365558')?.name).toBe('contact_phone');
    expect(en('mailto:contacto@imsoft.io')?.name).toBe('contact_email');
  });

  it('reconoce el enlace a la pagina de contacto, relativo o absoluto', () => {
    expect(en('/es/contact')?.name).toBe('cta_contact_page');
    expect(en('https://www.imsoft.io/en/contact')?.name).toBe('cta_contact_page');
    expect(en('/es/contact-messages')).toBeNull();
  });

  it('ignora el resto de enlaces', () => {
    expect(en('/es/portfolio')).toBeNull();
    expect(en('https://alcodea.com/precios')).toBeNull();
    expect(en('')).toBeNull();
    expect(en('#faq')).toBeNull();
  });

  it('guarda la pagina y el texto del boton, recortado', () => {
    const e = en('https://wa.me/523325365558', '  Hablar   con un experto  ');
    expect(e?.params).toEqual({ page: '/es/services/web-pages', cta_text: 'Hablar con un experto' });
    expect(en('tel:1', 'x'.repeat(100))?.params.cta_text).toHaveLength(60);
  });

  it('el envio del formulario tiene su propio evento', () => {
    expect(leadEvent('/es/contact')).toEqual({ name: 'contact_form_sent', params: { page: '/es/contact', cta_text: 'form' } });
  });
});
