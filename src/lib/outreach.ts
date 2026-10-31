/**
 * Email prospecting: per-step templates, daily cap, follow-up schedule and building the
 * message for Gmail. Pure logic, tested with vitest; the I/O (Supabase, Gmail, Claude)
 * lives in src/lib/gmail/server.ts and the /api/outreach routes.
 */

export type Step = 1 | 2 | 3;

export interface OutreachVars {
  name: string;
  company: string;
  hook: string;
  /** Contact's segment tag (e.g. "logistics"); picks the template. */
  segment?: string | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Daily sending ramp based on the days elapsed since the first send. */
export function dailyCap(daysSinceFirstSend: number): number {
  if (daysSinceFirstSend < 14) return 15;
  if (daysSinceFirstSend < 28) return 25;
  return 40;
}

/** Business days (Monday to Friday) after a date. */
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  let left = days;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) left -= 1;
  }
  return d;
}

/** When the next step is due: +4 business days after the first, +6 more after the second. */
export const BUSINESS_DAYS_WAIT: Record<2 | 3, number> = { 2: 4, 3: 6 };

export function nextStepDate(sentAt: Date, next: 2 | 3): string {
  return addBusinessDays(sentAt, BUSINESS_DAYS_WAIT[next]).toISOString().slice(0, 10);
}

const SITE = 'https://www.imsoft.io';
const LOGO = `${SITE}/logos/imsoft-isotipo-correo-v3.png`;
export const WHATSAPP_LINE = 'Agendar 15 minutos por WhatsApp:';
/** Main button of the email: WhatsApp with a prefilled message. */
export const WHATSAPP_URL = `https://wa.me/523325365558?text=${encodeURIComponent('Hola Brandon, me llegó tu correo de imSoft y me gustaría platicarlo.')}`;

/** imSoft signature: small logo, name, title, phone and website. Nothing else. */
export function signatureHtml(): string {
  return `
<table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827">
  <tr>
    <td style="padding-right:12px;vertical-align:top"><img src="${LOGO}" width="36" height="47" alt="imSoft" style="display:block;width:36px;height:auto"></td>
    <td style="vertical-align:top;line-height:1.45">
      <strong>Brandon García</strong><br>
      <span style="color:#4b5563">imSoft · Software a la medida, Guadalajara</span><br>
      <a href="tel:+523325365558" style="color:#1e88e5;text-decoration:none">33 2536 5558</a> ·
      <a href="${SITE}" style="color:#1e88e5;text-decoration:none">imsoft.io</a>
    </td>
  </tr>
</table>`.trim();
}

export function signatureText(): string {
  return `Brandon García\nimSoft · Software a la medida, Guadalajara\n33 2536 5558 · imsoft.io`;
}

/** Legal line: where the contact came from and how to ask not to be written to again. */
export const LEGAL_LINE = 'Te escribo porque encontré a {{company}} buscando negocios de tu sector en Guadalajara. Si prefieres que no te vuelva a escribir, respóndeme "no" y listo.';

interface Template {
  subject: string;
  /** Plain-text paragraphs; {{name}}, {{company}} and {{hook}} are substituted. */
  paragraphs: string[];
}

const LOGISTICS_CASE = 'A JTP Logistics le desarrollamos su sistema interno y un módulo donde sus proveedores consultan sus rutas por su cuenta, sin pedir el dato por teléfono. No es un producto que revendamos: se hizo según su operación y el sistema es de ellos.';

const TEMPLATES: Record<string, Record<Step, Template>> = {
  default: {
    1: {
      subject: 'Software a la medida para {{company}}',
      paragraphs: [
        'Hola {{name}}:',
        'Soy Brandon, de imSoft. Desarrollamos software a la medida aquí en Guadalajara para negocios que ya operan bien pero cargan con procesos a mano, hojas de cálculo o sistemas que no se hablan entre sí.',
        '{{hook}}',
        'Trabajamos a precio fijo, así que sabes desde el día uno cuánto va a costar, y el código queda 100 % tuyo, no rentado.',
        '¿Te doy 15 minutos esta semana para platicarlo? Si no es para ustedes, te lo digo de frente y no te vuelvo a escribir.',
      ],
    },
    2: {
      subject: 'Re: Software a la medida para {{company}}',
      paragraphs: [
        'Hola {{name}}, te escribí hace unos días y entiendo que la semana se llena.',
        '{{hook}}',
        'Si te sirve, con una llamada de 15 minutos te digo si tiene sentido y cuánto costaría, sin compromiso. ¿Qué día te acomoda?',
      ],
    },
    3: {
      subject: 'Re: Software a la medida para {{company}}',
      paragraphs: [
        'Hola {{name}}, último correo de mi parte para no ser insistente.',
        'Si más adelante en {{company}} quieren resolver algo de esto, aquí me tienes. Y si conoces a alguien a quien le sirva, te agradezco que me lo pases.',
        'Que te vaya muy bien.',
      ],
    },
  },
  // Large companies (Dalton, Farmacias Guadalajara...): they don't lack Excel but IT
  // hands. The email offers to be an external vendor for specific projects and asks to
  // be forwarded to whoever handles these topics.
  corporate: {
    1: {
      subject: 'Desarrollo de software para {{company}}',
      paragraphs: [
        'Hola {{name}}:',
        'Soy Brandon, de imSoft. Desarrollamos software a la medida en Guadalajara y trabajamos como proveedor externo en proyectos puntuales: sistemas internos, integraciones entre sistemas y aplicaciones que el área de sistemas no alcanza a cubrir.',
        '{{hook}}',
        'Trabajamos a precio fijo por proyecto, y el código y la documentación quedan a nombre de ustedes.',
        '¿Me podrías decir quién ve estos temas en {{company}}? Si eres tú, te doy 15 minutos esta semana para platicarlo.',
      ],
    },
    2: {
      subject: 'Re: Desarrollo de software para {{company}}',
      paragraphs: [
        'Hola {{name}}, te escribí hace unos días y entiendo que la semana se llena.',
        '{{hook}}',
        'Si tiene sentido, con 15 minutos te cuento cómo trabajamos y cuánto costaría un primer proyecto. Y si esto le toca a otra persona, te agradezco que me indiques a quién.',
      ],
    },
    3: {
      subject: 'Re: Desarrollo de software para {{company}}',
      paragraphs: [
        'Hola {{name}}, último correo de mi parte para no ser insistente.',
        'Si más adelante en {{company}} necesitan un proveedor para un desarrollo a la medida, aquí me tienes.',
        'Que te vaya muy bien.',
      ],
    },
  },
  logistics: {
    1: {
      subject: 'Software para la operación de {{company}}',
      paragraphs: [
        'Hola {{name}}:',
        'Soy Brandon, de imSoft. Desarrollamos software a la medida aquí en Guadalajara y varios de nuestros clientes son del sector aduanal y logístico.',
        '{{hook}}',
        LOGISTICS_CASE,
        'Trabajamos a precio fijo, así que sabes desde el día uno cuánto va a costar, y el código queda 100 % tuyo, no rentado.',
        '¿Te doy 15 minutos esta semana para platicarlo? Si no es para ustedes, te lo digo de frente y no te vuelvo a escribir.',
      ],
    },
    2: {
      subject: 'Re: Software para la operación de {{company}}',
      paragraphs: [
        'Hola {{name}}, te escribí hace unos días y entiendo que la semana se llena.',
        '{{hook}}',
        'Si te sirve, con una llamada de 15 minutos te digo si tiene sentido y cuánto costaría, sin compromiso. ¿Qué día te acomoda?',
      ],
    },
    3: {
      subject: 'Re: Software para la operación de {{company}}',
      paragraphs: [
        'Hola {{name}}, último correo de mi parte para no ser insistente.',
        'Si más adelante en {{company}} quieren quitarse de encima las llamadas de "dónde va mi carga" o los reportes a mano, aquí me tienes. Y si conoces a alguien a quien le sirva, te agradezco que me lo pases.',
        'Que te vaya muy bien.',
      ],
    },
  },
};

export function templateFor(segment?: string | null): string {
  const s = (segment ?? '').toLowerCase();
  return s in TEMPLATES ? s : 'default';
}

function substitute(t: string, v: OutreachVars): string {
  return t.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (k === 'name' ? v.name : k === 'company' ? v.company : k === 'hook' ? v.hook : ''));
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Full email for a step: clean text + signature with logo + legal line on the first one. */
export function renderOutreach(step: Step, vars: OutreachVars): RenderedEmail {
  const p = TEMPLATES[templateFor(vars.segment)][step];
  const v = { ...vars, name: vars.name.trim() || 'qué tal', company: vars.company.trim() || 'tu empresa', hook: vars.hook.trim() };
  const body = p.paragraphs.map((x) => substitute(x, v)).filter((x) => x.trim()).join('\n\n');
  return renderFromBody(step, { subject: substitute(p.subject, v), body, company: v.company });
}

/** Builds text and HTML from the already edited body (paragraphs separated by a blank line). */
export function renderFromBody(step: Step, d: { subject: string; body: string; company: string }): RenderedEmail {
  const paragraphs = d.body.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  const legal = step === 1 ? substitute(LEGAL_LINE, { name: '', company: d.company.trim() || 'tu empresa', hook: '' }) : null;
  // No signature: Brandon doesn't want it in the email.
  const text = [...paragraphs, '', `${WHATSAPP_LINE} ${WHATSAPP_URL}`, ...(legal ? ['', legal] : [])].join('\n\n').replace(/\n{3,}/g, '\n\n');
  const [first, ...rest] = paragraphs;
  const greeting = /^hola\b/i.test(first ?? '') ? first : null;
  const bodyHtml = (greeting ? rest : paragraphs).map((x) => `      <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1f2937">${esc(x)}</p>`).join('\n');
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(d.subject.trim())}</title></head>
<body style="margin:0;padding:0;background:#f4f6fa">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f6fa">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px">
  <tr><td style="padding:40px 48px 0">
    <img src="${LOGO}" width="56" height="73" alt="imSoft" style="display:block;width:56px;height:auto">
  </td></tr>
  <tr><td style="padding:36px 48px 0">
    <h1 style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:26px;line-height:1.25;font-weight:bold;color:#111827">${esc(d.subject.trim())}</h1>
${greeting ? `      <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#1f2937">${esc(greeting)}</p>` : ''}
${bodyHtml}
  </td></tr>
  <tr><td style="padding:8px 48px 0">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td align="center" style="background:#1e88e5;border-radius:8px">
        <a href="${WHATSAPP_URL}" style="display:block;padding:15px 20px;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none">${WHATSAPP_LINE.replace(/:$/, '')}</a>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:20px 48px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#6b7280">
    O responde a este correo y lo vemos por aquí. Puedes ver proyectos que hemos hecho en <a href="${SITE}/es/portfolio" style="color:#1e88e5;text-decoration:none;font-weight:bold">imsoft.io</a>.
  </td></tr>
  <tr><td style="padding:0 48px 40px;font-size:0;line-height:0">&nbsp;</td></tr>
</table>
${legal ? `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%"><tr><td style="padding:18px 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#9ca3af">${esc(legal)}</td></tr></table>` : ''}
</td></tr>
</table>
</body></html>`;
  return { subject: d.subject.trim(), html, text };
}

/** Editable body: the text before the WhatsApp button (or the signature, in old emails). */
export function bodyOf(text: string): string {
  const cuts = [text.indexOf(WHATSAPP_LINE), text.indexOf(signatureText())].filter((i) => i >= 0);
  const i = cuts.length ? Math.min(...cuts) : -1;
  return (i >= 0 ? text.slice(0, i) : text).trim();
}

/** Header with accents in RFC 2047 format (base64), as email requires. */
export function encodeHeader(text: string): string {
  return /^[\x20-\x7e]*$/.test(text) ? text : `=?UTF-8?B?${Buffer.from(text, 'utf8').toString('base64')}?=`;
}

/**
 * "Name <email>": the name is encoded if it has accents or symbols; the address goes as is.
 * Without this Gmail showed "Brandon GarcÃƒÂ­a Ã‚Â· imSoft" as the sender.
 */
export function encodeSender(from: string): string {
  const m = from.match(/^(.*?)\s*<([^>]+)>$/);
  if (!m) return from;
  const name = m[1].trim().replace(/^"|"$/g, '');
  return name ? `${encodeHeader(name)} <${m[2]}>` : `<${m[2]}>`;
}

/** MIME message (multipart/alternative) in base64url, as the Gmail API requires. */
export function buildMime(m: { from: string; to: string; subject: string; text: string; html: string; inReplyTo?: string | null; references?: string | null }): string {
  const boundary = `b_${Math.random().toString(36).slice(2)}`;
  const subject = encodeHeader(m.subject);
  const headers = [
    `From: ${encodeSender(m.from)}`,
    `To: ${m.to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    ...(m.inReplyTo ? [`In-Reply-To: ${m.inReplyTo}`, `References: ${m.references || m.inReplyTo}`] : []),
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].join('\r\n');
  const body = [
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(m.text, 'utf8').toString('base64'),
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(m.html, 'utf8').toString('base64'),
    `--${boundary}--`,
  ].join('\r\n');
  return Buffer.from(`${headers}\r\n\r\n${body}`, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** The segment comes from the contact's tags (set by the importer). */
export function segmentOf(tags: string[] | null | undefined): string | null {
  const known = Object.keys(TEMPLATES).filter((k) => k !== 'default');
  // Importer tags carry a city suffix ("logistics-gdl"): the prefix is enough.
  const lower = (tags ?? []).map((t) => t.toLowerCase());
  return known.find((k) => lower.some((t) => t === k || t.startsWith(`${k}-`))) ?? null;
}

/**
 * Someone else's message in a prospecting thread: the prospect's reply or a bounce notice.
 * Bounces arrive in the same thread from mailer-daemon and used to count as replies
 * (Grupo EI showed up as "replied" in Sep 2026 when its address didn't exist).
 */
export function foreignMessageType(from: string, subject = '', autoSubmitted = ''): 'bounce' | 'delay' | 'automatic' | 'reply' {
  const f = from.toLowerCase();
  const subj = subject.toLowerCase();
  // "Delivery Status Notification (Delay)": Gmail keeps trying; it's not a bounce yet.
  if (/\(delay\)|delivery delayed|entrega retrasada|delayed mail/.test(subj)) return 'delay';
  if (/mailer-daemon|postmaster@|mail delivery (subsystem|system)|microsoftexchange|no-?reply@.*(bounce)/.test(f)) return 'bounce';
  if (/delivery status notification|undeliverable|undelivered mail|returned mail|delivery failure|failure notice|no se pudo entregar|entrega fallida|mensaje no entregado/.test(subj)) return 'bounce';
  // Out of office and the like: nobody read the email, the sequence must go on.
  // (Corporación Castañeda showed up as "replied" on 2026-10-05 because of a vacation notice.)
  if (/^auto-(replied|generated)/i.test(autoSubmitted.trim())) return 'automatic';
  if (/respuesta autom[aá]tica|automatic reply|auto-?reply|autoreply|out of office|fuera de (la )?oficina|ausente de la oficina|ausencia temporal|de vacaciones|automatische antwort/.test(subj)) return 'automatic';
  return 'reply';
}

/** Domain of an email address, lowercased; null if it doesn't look like an email. */
export function emailDomain(email: string | null | undefined): string | null {
  const m = String(email ?? '').trim().toLowerCase().match(/^[^@\s]+@([a-z0-9.-]+\.[a-z]{2,})$/);
  return m ? m[1] : null;
}

/**
 * Who couldn't be delivered to, according to a Gmail bounce notice. Comes from the
 * X-Failed-Recipients header or, if missing, from the notice text ("no se entregó a x@y.mx").
 * Used for bounces that arrive as a separate email, outside the sending thread.
 */
export function failedRecipient(header: string | null | undefined, text: string | null | undefined): string | null {
  const direct = (header ?? '').split(',')[0].trim().toLowerCase();
  if (/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/.test(direct)) return direct;
  const m = (text ?? '').match(/(?:entreg[óo] a|entregarse a|entregar tu mensaje a|delivered to|delivering your message to|mensaje para)\s+<?([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i);
  return m ? m[1].toLowerCase().replace(/\.$/, '') : null;
}
