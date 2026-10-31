import { describe, it, expect } from 'vitest';
import { encodeSender, buildMime, failedRecipient, emailDomain, foreignMessageType, nextStepDate, templateFor, renderOutreach, segmentOf, addBusinessDays, dailyCap } from './outreach';

describe('prospecting', () => {
  it('daily sending ramp', () => {
    expect(dailyCap(0)).toBe(15);
    expect(dailyCap(13)).toBe(15);
    expect(dailyCap(14)).toBe(25);
    expect(dailyCap(28)).toBe(40);
    expect(dailyCap(400)).toBe(40);
  });

  it('business days and follow-up schedule', () => {
    // 2026-09-15 is a Tuesday: +4 business days = Monday 21; +6 from the 21st = Tuesday 29.
    expect(addBusinessDays(new Date('2026-09-15T20:00:00Z'), 4).toISOString().slice(0, 10)).toBe('2026-09-21');
    expect(nextStepDate(new Date('2026-09-15T20:00:00Z'), 2)).toBe('2026-09-21');
    expect(nextStepDate(new Date('2026-09-21T15:00:00Z'), 3)).toBe('2026-09-29');
    // A Friday + 1 business day is Monday
    expect(addBusinessDays(new Date('2026-09-18T12:00:00Z'), 1).getUTCDay()).toBe(1);
  });

  it('picks the template by segment and falls back to the generic one', () => {
    expect(templateFor('logistics')).toBe('logistics');
    expect(templateFor('Logistics')).toBe('logistics');
    expect(templateFor('clinicas')).toBe('default');
    expect(segmentOf(['gdl', 'logistics'])).toBe('logistics');
    expect(segmentOf(['logistics-gdl', 'customs-brokers', 'campaign-sep-2026'])).toBe('logistics');
    expect(segmentOf(['gdl'])).toBeNull();
  });

  it('the first email has greeting, hook, WhatsApp button and legal line', () => {
    const e = renderOutreach(1, { name: 'Omar', company: 'Proicomex', hook: 'Vi que manejan carga refrigerada y pensé en su control de temperaturas.', segment: 'logistics' });
    expect(e.subject).toBe('Software para la operación de Proicomex');
    expect(e.text).toContain('Hola Omar:');
    expect(e.text).toContain('carga refrigerada');
    expect(e.text).toContain('JTP Logistics');
    expect(e.text).toContain('respóndeme "no"');
    // No signature of any kind
    expect(e.text).not.toContain('33 2536 5558');
    expect(e.html).not.toContain('Brandon García');
    expect(e.html).not.toContain('{{');
    expect(e.html).toContain('imsoft-isotipo-correo-v3.png');
    expect(e.html).toContain(`<h1`);
    expect(e.html).not.toContain('<script');
    // Email design: WhatsApp button with a prefilled message and tables (Gmail/Outlook compatible)
    expect(e.html).toContain('Agendar 15 minutos por WhatsApp');
    expect(e.html).toContain('https://wa.me/523325365558?text=');
    expect(e.html).toContain('role="presentation"');
    expect(e.text).toContain('Agendar 15 minutos por WhatsApp: https://wa.me/');
  });

  it('follow-ups are short, go as a reply and have no legal line', () => {
    const e2 = renderOutreach(2, { name: 'Omar', company: 'Proicomex', hook: '', segment: null });
    expect(e2.subject.startsWith('Re: ')).toBe(true);
    expect(e2.text).not.toContain('respóndeme "no"');
    expect(e2.text.split('\n\n').length).toBeLessThan(8);
    const e3 = renderOutreach(3, { name: '', company: '', hook: '', segment: null });
    expect(e3.text).toContain('Hola qué tal');
    expect(e3.text).toContain('en tu empresa');
  });

  it("escapes HTML in the contact's data", () => {
    const e = renderOutreach(1, { name: '<b>x</b>', company: 'A&B', hook: '', segment: null });
    expect(e.html).toContain('&lt;b&gt;x&lt;/b&gt;');
    expect(e.html).toContain('A&amp;B');
  });

  it('builds a base64url multipart MIME with the thread when it is a reply', () => {
    const raw = buildMime({ from: 'Brandon <contacto@imsoft.io>', to: 'x@y.mx', subject: 'Hola ñ', text: 'hola', html: '<p>hola</p>', inReplyTo: '<abc@mail.gmail.com>' });
    expect(raw).toMatch(/^[A-Za-z0-9_-]+$/);
    const mime = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    expect(mime).toContain('Subject: =?UTF-8?B?');
    expect(mime).toContain('In-Reply-To: <abc@mail.gmail.com>');
    expect(mime).toContain('multipart/alternative');
    expect(mime).toContain('text/html');
  });

  it("encodes the sender's name when it has accents, and leaves the address readable", () => {
    // Gmail showed "Brandon GarcÃƒÂ­a Ã‚Â· imSoft" because the name went as raw UTF-8.
    const from = 'Brandon García · imSoft <contacto@imsoft.io>';
    expect(encodeSender(from)).toBe(`=?UTF-8?B?${Buffer.from('Brandon García · imSoft').toString('base64')}?= <contacto@imsoft.io>`);
    expect(encodeSender('Brandon <contacto@imsoft.io>')).toBe('Brandon <contacto@imsoft.io>');
    expect(encodeSender('contacto@imsoft.io')).toBe('contacto@imsoft.io');
    const raw = buildMime({ from, to: 'x@y.mx', subject: 'Hola', text: 'hola', html: '<p>hola</p>' });
    const mime = Buffer.from(raw.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    expect(mime).toContain('From: =?UTF-8?B?');
    expect(mime).not.toContain('From: Brandon García');
    expect(mime).toContain('Subject: Hola\r\n');
  });
});

describe('body editing', () => {
  it('bodyOf returns only the paragraphs and renderFromBody rebuilds text and html', async () => {
    const { renderOutreach, bodyOf, renderFromBody, signatureText } = await import('./outreach');
    const e = renderOutreach(1, { name: 'Ana', company: 'Acme', hook: 'Gancho.' });
    const body = bodyOf(e.text);
    expect(body).not.toContain(signatureText());
    expect(body).not.toContain('respóndeme "no"');
    const r = renderFromBody(1, { subject: 'Hola', body: `${body}\n\nPárrafo extra <x>.`, company: 'Acme' });
    expect(r.text).toContain('Párrafo extra <x>.');
    expect(r.text).not.toContain(signatureText());
    expect(r.text).toContain('Agendar 15 minutos por WhatsApp:');
    expect(r.text).toContain('encontré a Acme');
    expect(r.html).toContain('Párrafo extra &lt;x&gt;.');
    expect(renderFromBody(2, { subject: 'Re: Hola', body: 'Solo uno.', company: 'Acme' }).text).not.toContain('respóndeme');
  });
});

describe('bounces', () => {
  it('tells a bounce notice apart from a real reply', () => {
    expect(foreignMessageType('Mail Delivery Subsystem <mailer-daemon@googlemail.com>')).toBe('bounce');
    expect(foreignMessageType('postmaster@segadi.com.mx', 'Undeliverable: Software')).toBe('bounce');
    expect(foreignMessageType('Microsoft Outlook <MicrosoftExchange329e71ec88ae4615bbc36ab6ce41109e@x.onmicrosoft.com>')).toBe('bounce');
    expect(foreignMessageType('Sistema <sistema@x.mx>', 'Mensaje no entregado')).toBe('bounce');
    expect(foreignMessageType('Héctor Gil <hector@gilygil.mx>', 'Re: Software para la operación')).toBe('reply');
    // Gmail first reports the delay and keeps trying: that's not a bounce yet.
    expect(foreignMessageType('Mail Delivery Subsystem <mailer-daemon@googlemail.com>', 'Delivery Status Notification (Delay)')).toBe('delay');
    expect(foreignMessageType('Mail Delivery Subsystem <mailer-daemon@googlemail.com>', 'Delivery Status Notification (Failure)')).toBe('bounce');
    // Out of office: not a reply, the sequence goes on.
    expect(foreignMessageType('Mario Flores <mario.flores@acastaneda.com>', 'Respuesta automática: Software para la operación de Corporación Castañeda')).toBe('automatic');
    expect(foreignMessageType('Ana <ana@x.mx>', 'Automatic reply: Software a la medida')).toBe('automatic');
    expect(foreignMessageType('Ana <ana@x.mx>', 'Fuera de la oficina')).toBe('automatic');
    expect(foreignMessageType('Ana <ana@x.mx>', 'Re: Software a la medida', 'auto-replied')).toBe('automatic');
    expect(foreignMessageType('Ana <ana@x.mx>', 'Re: Software a la medida', 'no')).toBe('reply');
  });

  it("gets the email's domain", () => {
    expect(emailDomain(' Info@GomBienesRaices.com ')).toBe('gombienesraices.com');
    expect(emailDomain('sin-arroba')).toBeNull();
    expect(emailDomain(null)).toBeNull();
  });
});

describe('corporate segment', () => {
  it('large companies get their own email: external vendor and who to forward it to, no Excel or JTP', () => {
    const e = renderOutreach(1, { name: 'Laura', company: 'Grupo Dalton', hook: 'Las integraciones con proveedores se quedan en la fila de sistemas.', segment: segmentOf(['corporate']) });
    expect(e.subject).toBe('Desarrollo de software para Grupo Dalton');
    expect(e.text).toContain('proveedor externo');
    expect(e.text).toContain('quién ve estos temas en Grupo Dalton');
    expect(e.text).not.toMatch(/Excel|JTP/);
    expect(renderOutreach(3, { name: 'Laura', company: 'Grupo Dalton', hook: '', segment: 'corporate' }).subject).toBe('Re: Desarrollo de software para Grupo Dalton');
  });
});

describe('recipient of a bounce notice', () => {
  it('comes from the X-Failed-Recipients header', () => {
    expect(failedRecipient('Gabriela.Flores@cabrerallamas.com', '')).toBe('gabriela.flores@cabrerallamas.com');
  });

  it('or from the notice text, in Spanish or English', () => {
    expect(failedRecipient('', 'No se encontró la dirección Tu mensaje no se entregó a sbeas@pcz.com.mx porque la dirección no se encuentra')).toBe('sbeas@pcz.com.mx');
    expect(failedRecipient(null, "Address not found Your message wasn't delivered to info@exteriorlogistics.com because the address couldn't be found")).toBe('info@exteriorlogistics.com');
    expect(failedRecipient(null, 'Tu mensaje no pudo entregarse a cliente@ferreabastecedora.com.mx. La bandeja de entrada está llena')).toBe('cliente@ferreabastecedora.com.mx');
  });

  it('does not make one up when no recipient is recognizable', () => {
    expect(failedRecipient('', 'Aviso sin dirección')).toBeNull();
  });
});
