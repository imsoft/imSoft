import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(__dirname, '..', '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/**
 * Estas pruebas vigilan que contactar a imSoft no vuelva a requerir navegar.
 *
 * El sitio venia de una plantilla de SaaS: los tres botones destacados del header
 * apuntaban a /signup, o sea que a un prospecto que busca agencia se le pedia darse de
 * alta en el panel de clientes antes que escribir. Y el telefono y el correo solo eran
 * clicables en /contact.
 */

describe('el header empuja a contactar, no a registrarse', () => {
  const header = read('src/components/blocks/hero-section.tsx');
  const landing = read('src/components/landing/hero-section-landing.tsx');
  const botones = header.slice(header.indexOf('const menuItems'));
  const botonesLanding = landing.slice(landing.indexOf('const menuItems'));

  it('el unico boton de la cabecera lleva a WhatsApp con el contexto de la pagina', () => {
    expect(botones).toMatch(/<Button asChild size="sm">\s*<WhatsAppCtaLink lang=\{lang\}>/);
    expect(botonesLanding).toMatch(/<Button asChild size="sm">\s*<WhatsAppCtaLink lang=\{lang\}>/);
  });

  it('acceso y registro ya no compiten con el CTA en la cabecera', () => {
    for (const b of [botones, botonesLanding]) {
      expect(b).not.toContain('/login`}');
      expect(b).not.toContain('/signup`}');
    }
  });

  it('el acceso de clientes sigue disponible en el pie', () => {
    expect(read('src/components/blocks/footer-section.tsx')).toContain('href={`/${lang}/login`}');
  });

  it('los clics de contacto se registran en analitica desde el layout', () => {
    expect(read('src/app/[lang]/layout.tsx')).toContain('<CtaTracker />');
    expect(read('src/app/[lang]/contact/contact-form.tsx')).toContain('new CustomEvent(LEAD_EVENT)');
  });
});

describe('el footer permite contactar desde cualquier pagina', () => {
  const footer = read('src/components/blocks/footer-section.tsx');

  it('el telefono es un enlace tel: en E.164', () => {
    expect(footer).toContain('href={`tel:+52');
  });

  it('el correo es un enlace mailto:', () => {
    expect(footer).toContain('href={`mailto:');
  });

  it('hay un enlace de WhatsApp con mensaje precargado', () => {
    expect(footer).toContain('wa.me/523325365558');
    expect(footer).toContain('?text=');
  });
});

describe('el formulario de contacto no pide de mas', () => {
  const form = read('src/app/[lang]/contact/contact-form.tsx');
  const api = read('src/app/api/contact/route.ts');

  it('el apellido es opcional en el formulario', () => {
    expect(form).toContain('lastName: z.string().optional()');
  });

  it('y la API tampoco lo exige', () => {
    // Si la API siguiera exigiendolo, el envio fallaria con 400 pese al formulario.
    const guard = api.match(/if \(!firstName[^)]*\)/)?.[0] ?? '';
    expect(guard).not.toContain('lastName');
    expect(guard).toContain('firstName');
    expect(guard).toContain('email');
    expect(guard).toContain('message');
  });

  it('el correo al admin no deja un "undefined" cuando falta el apellido', () => {
    expect(api).not.toMatch(/\$\{firstName\} \$\{lastName\}/);
    expect(api).toContain("[firstName, lastName].filter(Boolean).join(' ')");
  });
});
