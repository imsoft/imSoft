import { describe, it, expect } from 'vitest';
import { codificarRemitente, construirMime, dominioDeCorreo, tipoDeMensajeAjeno, fechaSiguientePaso, plantillaDe, renderOutreach, segmentoDe, sumarDiasHabiles, topeDiario } from './outreach';

describe('prospeccion', () => {
  it('rampa de envios diarios', () => {
    expect(topeDiario(0)).toBe(15);
    expect(topeDiario(13)).toBe(15);
    expect(topeDiario(14)).toBe(25);
    expect(topeDiario(28)).toBe(40);
    expect(topeDiario(400)).toBe(40);
  });

  it('dias habiles y calendario de seguimientos', () => {
    // 2026-09-15 es martes: +4 habiles = lunes 21; +6 desde el 21 = martes 29.
    expect(sumarDiasHabiles(new Date('2026-09-15T20:00:00Z'), 4).toISOString().slice(0, 10)).toBe('2026-09-21');
    expect(fechaSiguientePaso(new Date('2026-09-15T20:00:00Z'), 2)).toBe('2026-09-21');
    expect(fechaSiguientePaso(new Date('2026-09-21T15:00:00Z'), 3)).toBe('2026-09-29');
    // Un viernes +1 habil es lunes
    expect(sumarDiasHabiles(new Date('2026-09-18T12:00:00Z'), 1).getUTCDay()).toBe(1);
  });

  it('elige la plantilla por segmento y cae a la generica', () => {
    expect(plantillaDe('logistica')).toBe('logistica');
    expect(plantillaDe('Logistica')).toBe('logistica');
    expect(plantillaDe('clinicas')).toBe('default');
    expect(segmentoDe(['gdl', 'logistica'])).toBe('logistica');
    expect(segmentoDe(['logistica-gdl', 'aduanal', 'campana-sep-2026'])).toBe('logistica');
    expect(segmentoDe(['gdl'])).toBeNull();
  });

  it('el primer correo lleva saludo, gancho, boton de WhatsApp y linea legal', () => {
    const e = renderOutreach(1, { nombre: 'Omar', empresa: 'Proicomex', gancho: 'Vi que manejan carga refrigerada y pensé en su control de temperaturas.', segmento: 'logistica' });
    expect(e.subject).toBe('Software para la operación de Proicomex');
    expect(e.text).toContain('Hola Omar:');
    expect(e.text).toContain('carga refrigerada');
    expect(e.text).toContain('JTP Logistics');
    expect(e.text).toContain('respóndeme "no"');
    // Sin firma de ningun tipo
    expect(e.text).not.toContain('33 2536 5558');
    expect(e.html).not.toContain('Brandon García');
    expect(e.html).not.toContain('{{');
    expect(e.html).toContain('imsoft-isotipo-correo-v3.png');
    expect(e.html).toContain(`<h1`);
    expect(e.html).not.toContain('<script');
    // Diseño de correo: boton de WhatsApp con mensaje prellenado y tablas (compatibles con Gmail/Outlook)
    expect(e.html).toContain('Agendar 15 minutos por WhatsApp');
    expect(e.html).toContain('https://wa.me/523325365558?text=');
    expect(e.html).toContain('role="presentation"');
    expect(e.text).toContain('Agendar 15 minutos por WhatsApp: https://wa.me/');
  });

  it('los seguimientos son cortos, van como respuesta y sin linea legal', () => {
    const e2 = renderOutreach(2, { nombre: 'Omar', empresa: 'Proicomex', gancho: '', segmento: null });
    expect(e2.subject.startsWith('Re: ')).toBe(true);
    expect(e2.text).not.toContain('respóndeme "no"');
    expect(e2.text.split('\n\n').length).toBeLessThan(8);
    const e3 = renderOutreach(3, { nombre: '', empresa: '', gancho: '', segmento: null });
    expect(e3.text).toContain('Hola qué tal');
    expect(e3.text).toContain('en tu empresa');
  });

  it('escapa HTML en los datos del contacto', () => {
    const e = renderOutreach(1, { nombre: '<b>x</b>', empresa: 'A&B', gancho: '', segmento: null });
    expect(e.html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(e.html).toContain('A&amp;B');
  });

  it('arma un MIME multipart en base64url con el hilo cuando es respuesta', () => {
    const raw = construirMime({ from: 'Brandon <contacto@imsoft.io>', to: 'x@y.mx', subject: 'Hola ñ', text: 'hola', html: '<p>hola</p>', inReplyTo: '<abc@mail.gmail.com>' });
    expect(raw).toMatch(/^[A-Za-z0-9_-]+$/);
    const mime = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    expect(mime).toContain('Subject: =?UTF-8?B?');
    expect(mime).toContain('In-Reply-To: <abc@mail.gmail.com>');
    expect(mime).toContain('multipart/alternative');
    expect(mime).toContain('text/html');
  });

  it('codifica el nombre del remitente cuando trae acentos, y deja el correo legible', () => {
    // Gmail mostraba "Brandon GarcÃƒÂ­a Ã‚Â· imSoft" porque el nombre iba en UTF-8 crudo.
    const from = 'Brandon García · imSoft <contacto@imsoft.io>';
    expect(codificarRemitente(from)).toBe(`=?UTF-8?B?${Buffer.from('Brandon García · imSoft').toString('base64')}?= <contacto@imsoft.io>`);
    expect(codificarRemitente('Brandon <contacto@imsoft.io>')).toBe('Brandon <contacto@imsoft.io>');
    expect(codificarRemitente('contacto@imsoft.io')).toBe('contacto@imsoft.io');
    const raw = construirMime({ from, to: 'x@y.mx', subject: 'Hola', text: 'hola', html: '<p>hola</p>' });
    const mime = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    expect(mime).toContain('From: =?UTF-8?B?');
    expect(mime).not.toContain('From: Brandon García');
    expect(mime).toContain('Subject: Hola\r\n');
  });
});

describe('edición del cuerpo', () => {
  it('cuerpoDe devuelve solo los párrafos y renderDesdeCuerpo reconstruye texto y html', async () => {
    const { renderOutreach, cuerpoDe, renderDesdeCuerpo, firmaTexto } = await import('./outreach');
    const e = renderOutreach(1, { nombre: 'Ana', empresa: 'Acme', gancho: 'Gancho.' });
    const cuerpo = cuerpoDe(e.text);
    expect(cuerpo).not.toContain(firmaTexto());
    expect(cuerpo).not.toContain('respóndeme "no"');
    const r = renderDesdeCuerpo(1, { subject: 'Hola', cuerpo: `${cuerpo}\n\nPárrafo extra <x>.`, empresa: 'Acme' });
    expect(r.text).toContain('Párrafo extra <x>.');
    expect(r.text).not.toContain(firmaTexto());
    expect(r.text).toContain('Agendar 15 minutos por WhatsApp:');
    expect(r.text).toContain('encontré a Acme');
    expect(r.html).toContain('Párrafo extra &lt;x&gt;.');
    expect(renderDesdeCuerpo(2, { subject: 'Re: Hola', cuerpo: 'Solo uno.', empresa: 'Acme' }).text).not.toContain('respóndeme');
  });
});

describe('rebotes', () => {
  it('distingue el aviso de rebote de una respuesta real', () => {
    expect(tipoDeMensajeAjeno('Mail Delivery Subsystem <mailer-daemon@googlemail.com>')).toBe('rebote');
    expect(tipoDeMensajeAjeno('postmaster@segadi.com.mx', 'Undeliverable: Software')).toBe('rebote');
    expect(tipoDeMensajeAjeno('Microsoft Outlook <MicrosoftExchange329e71ec88ae4615bbc36ab6ce41109e@x.onmicrosoft.com>')).toBe('rebote');
    expect(tipoDeMensajeAjeno('Sistema <sistema@x.mx>', 'Mensaje no entregado')).toBe('rebote');
    expect(tipoDeMensajeAjeno('Héctor Gil <hector@gilygil.mx>', 'Re: Software para la operación')).toBe('respuesta');
  });

  it('saca el dominio del correo', () => {
    expect(dominioDeCorreo(' Info@GomBienesRaices.com ')).toBe('gombienesraices.com');
    expect(dominioDeCorreo('sin-arroba')).toBeNull();
    expect(dominioDeCorreo(null)).toBeNull();
  });
});
