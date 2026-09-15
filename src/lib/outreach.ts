/**
 * Prospeccion por correo: plantillas por paso, tope diario, calendario de
 * seguimientos y armado del mensaje para Gmail. Logica pura, probada con vitest; la
 * E/S (Supabase, Gmail, Claude) vive en src/lib/gmail/server.ts y las rutas /api/outreach.
 */

export type Step = 1 | 2 | 3;

export interface OutreachVars {
  nombre: string;
  empresa: string;
  gancho: string;
  /** Etiqueta de segmento del contacto (p. ej. "logistica"); elige la plantilla. */
  segmento?: string | null;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Rampa de envios diarios segun los dias transcurridos desde el primer envio. */
export function topeDiario(diasDesdePrimerEnvio: number): number {
  if (diasDesdePrimerEnvio < 14) return 15;
  if (diasDesdePrimerEnvio < 28) return 25;
  return 40;
}

/** Dias habiles (lunes a viernes) despues de una fecha. */
export function sumarDiasHabiles(desde: Date, dias: number): Date {
  const d = new Date(Date.UTC(desde.getUTCFullYear(), desde.getUTCMonth(), desde.getUTCDate()));
  let faltan = dias;
  while (faltan > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) faltan -= 1;
  }
  return d;
}

/** Cuando toca el siguiente paso: +4 dias habiles tras el primero, +6 mas tras el segundo. */
export const ESPERA_DIAS_HABILES: Record<2 | 3, number> = { 2: 4, 3: 6 };

export function fechaSiguientePaso(sentAt: Date, siguiente: 2 | 3): string {
  return sumarDiasHabiles(sentAt, ESPERA_DIAS_HABILES[siguiente]).toISOString().slice(0, 10);
}

const SITE = 'https://www.imsoft.io';
const LOGO = `${SITE}/logos/isotype-imsoft-blue.png`;
/** Boton principal del correo: WhatsApp con mensaje prellenado. */
export const WHATSAPP_URL = `https://wa.me/523325365558?text=${encodeURIComponent('Hola Brandon, me llegó tu correo de imSoft y me gustaría platicarlo.')}`;

/** Firma de imSoft: logo pequeno, nombre, cargo, telefono y sitio. Nada mas. */
export function firmaHtml(): string {
  return `
<table cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111827">
  <tr>
    <td style="padding-right:12px;vertical-align:top"><img src="${LOGO}" width="36" height="36" alt="imSoft" style="display:block;border-radius:8px"></td>
    <td style="vertical-align:top;line-height:1.45">
      <strong>Brandon García</strong><br>
      <span style="color:#4b5563">imSoft · Software a la medida, Guadalajara</span><br>
      <a href="tel:+523325365558" style="color:#1e88e5;text-decoration:none">33 2536 5558</a> ·
      <a href="${SITE}" style="color:#1e88e5;text-decoration:none">imsoft.io</a>
    </td>
  </tr>
</table>`.trim();
}

export function firmaTexto(): string {
  return `Brandon García\nimSoft · Software a la medida, Guadalajara\n33 2536 5558 · imsoft.io`;
}

/** Linea legal: de donde salio el contacto y como pedir que no se le escriba mas. */
export const LINEA_LEGAL = 'Te escribo porque encontré a {{empresa}} buscando negocios de tu sector en Guadalajara. Si prefieres que no te vuelva a escribir, respóndeme "no" y listo.';

interface Plantilla {
  subject: string;
  /** Parrafos en texto plano; {{nombre}}, {{empresa}} y {{gancho}} se sustituyen. */
  parrafos: string[];
}

const CASO_LOGISTICA = 'A JTP Logistics le desarrollamos su sistema interno y un módulo donde sus proveedores consultan sus rutas por su cuenta, sin pedir el dato por teléfono. No es un producto que revendamos: se hizo según su operación y el sistema es de ellos.';

const PLANTILLAS: Record<string, Record<Step, Plantilla>> = {
  default: {
    1: {
      subject: 'Software a la medida para {{empresa}}',
      parrafos: [
        'Hola {{nombre}}:',
        'Soy Brandon, de imSoft. Desarrollamos software a la medida aquí en Guadalajara para negocios que ya operan bien pero cargan con procesos a mano, hojas de cálculo o sistemas que no se hablan entre sí.',
        '{{gancho}}',
        'Trabajamos a precio fijo, así que sabes desde el día uno cuánto va a costar, y el código queda 100 % tuyo, no rentado.',
        '¿Te doy 15 minutos esta semana para platicarlo? Si no es para ustedes, te lo digo de frente y no te vuelvo a escribir.',
      ],
    },
    2: {
      subject: 'Re: Software a la medida para {{empresa}}',
      parrafos: [
        'Hola {{nombre}}, te escribí hace unos días y entiendo que la semana se llena.',
        '{{gancho}}',
        'Si te sirve, con una llamada de 15 minutos te digo si tiene sentido y cuánto costaría, sin compromiso. ¿Qué día te acomoda?',
      ],
    },
    3: {
      subject: 'Re: Software a la medida para {{empresa}}',
      parrafos: [
        'Hola {{nombre}}, último correo de mi parte para no ser insistente.',
        'Si más adelante en {{empresa}} quieren resolver algo de esto, aquí me tienes. Y si conoces a alguien a quien le sirva, te agradezco que me lo pases.',
        'Que te vaya muy bien.',
      ],
    },
  },
  logistica: {
    1: {
      subject: 'Software para la operación de {{empresa}}',
      parrafos: [
        'Hola {{nombre}}:',
        'Soy Brandon, de imSoft. Desarrollamos software a la medida aquí en Guadalajara y varios de nuestros clientes son del sector aduanal y logístico.',
        '{{gancho}}',
        CASO_LOGISTICA,
        'Trabajamos a precio fijo, así que sabes desde el día uno cuánto va a costar, y el código queda 100 % tuyo, no rentado.',
        '¿Te doy 15 minutos esta semana para platicarlo? Si no es para ustedes, te lo digo de frente y no te vuelvo a escribir.',
      ],
    },
    2: {
      subject: 'Re: Software para la operación de {{empresa}}',
      parrafos: [
        'Hola {{nombre}}, te escribí hace unos días y entiendo que la semana se llena.',
        '{{gancho}}',
        'Si te sirve, con una llamada de 15 minutos te digo si tiene sentido y cuánto costaría, sin compromiso. ¿Qué día te acomoda?',
      ],
    },
    3: {
      subject: 'Re: Software para la operación de {{empresa}}',
      parrafos: [
        'Hola {{nombre}}, último correo de mi parte para no ser insistente.',
        'Si más adelante en {{empresa}} quieren quitarse de encima las llamadas de "dónde va mi carga" o los reportes a mano, aquí me tienes. Y si conoces a alguien a quien le sirva, te agradezco que me lo pases.',
        'Que te vaya muy bien.',
      ],
    },
  },
};

export function plantillaDe(segmento?: string | null): string {
  const s = (segmento ?? '').toLowerCase();
  return s in PLANTILLAS ? s : 'default';
}

function sustituir(t: string, v: OutreachVars): string {
  return t.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (k === 'nombre' ? v.nombre : k === 'empresa' ? v.empresa : k === 'gancho' ? v.gancho : ''));
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Correo completo de un paso: texto limpio + firma con logo + linea legal en el primero. */
export function renderOutreach(step: Step, vars: OutreachVars): RenderedEmail {
  const p = PLANTILLAS[plantillaDe(vars.segmento)][step];
  const v = { ...vars, nombre: vars.nombre.trim() || 'qué tal', empresa: vars.empresa.trim() || 'tu empresa', gancho: vars.gancho.trim() };
  const cuerpo = p.parrafos.map((x) => sustituir(x, v)).filter((x) => x.trim()).join('\n\n');
  return renderDesdeCuerpo(step, { subject: sustituir(p.subject, v), cuerpo, empresa: v.empresa });
}

/** Arma texto y HTML a partir del cuerpo ya editado (parrafos separados por linea en blanco). */
export function renderDesdeCuerpo(step: Step, d: { subject: string; cuerpo: string; empresa: string }): RenderedEmail {
  const parrafos = d.cuerpo.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  const legal = step === 1 ? sustituir(LINEA_LEGAL, { nombre: '', empresa: d.empresa.trim() || 'tu empresa', gancho: '' }) : null;
  const text = [...parrafos, '', `Agenda 15 minutos por WhatsApp: ${WHATSAPP_URL}`, '', firmaTexto(), ...(legal ? ['', legal] : [])].join('\n\n').replace(/\n{3,}/g, '\n\n');
  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(d.subject.trim())}</title></head>
<body style="margin:0;padding:0;background:#f3f7fb">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f7fb">
<tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e3ecf5">
  <tr><td style="height:5px;background:#1e88e5;font-size:0;line-height:0">&nbsp;</td></tr>
  <tr><td style="padding:22px 32px 0">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="padding-right:10px"><img src="${LOGO}" width="28" height="28" alt="imSoft" style="display:block;border-radius:7px"></td>
      <td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#1e88e5;letter-spacing:.2px">imSoft</td>
    </tr></table>
  </td></tr>
  <tr><td style="padding:22px 32px 6px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.6;color:#111827">
${parrafos.map((x) => `    <p style="margin:0 0 16px">${esc(x)}</p>`).join('\n')}
  </td></tr>
  <tr><td style="padding:6px 32px 8px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="background:#1e88e5;border-radius:10px;mso-padding-alt:12px 22px">
        <a href="${WHATSAPP_URL}" style="display:inline-block;padding:12px 22px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none">Agendar 15 minutos por WhatsApp</a>
      </td>
    </tr></table>
    <p style="margin:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6b7280">O responde a este correo y lo vemos por aquí. Puedes ver proyectos en <a href="${SITE}/es/portfolio" style="color:#1e88e5;text-decoration:none">imsoft.io</a>.</p>
  </td></tr>
  <tr><td style="padding:10px 32px 26px">
    ${firmaHtml()}
  </td></tr>
</table>
${legal ? `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%"><tr><td style="padding:14px 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.5;color:#6b7280">${esc(legal)}</td></tr></table>` : ''}
</td></tr>
</table>
</body></html>`;
  return { subject: d.subject.trim(), html, text };
}

/** Cuerpo editable: el texto antes de la firma. */
export function cuerpoDe(text: string): string {
  const i = text.indexOf(firmaTexto());
  return (i >= 0 ? text.slice(0, i) : text).trim();
}

/** Mensaje MIME (multipart/alternative) en base64url, como lo pide la API de Gmail. */
export function construirMime(m: { from: string; to: string; subject: string; text: string; html: string; inReplyTo?: string | null; references?: string | null }): string {
  const boundary = `b_${Math.random().toString(36).slice(2)}`;
  const subject = `=?UTF-8?B?${Buffer.from(m.subject, 'utf8').toString('base64')}?=`;
  const cab = [
    `From: ${m.from}`,
    `To: ${m.to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    ...(m.inReplyTo ? [`In-Reply-To: ${m.inReplyTo}`, `References: ${m.references || m.inReplyTo}`] : []),
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ].join('\r\n');
  const cuerpo = [
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
  return Buffer.from(`${cab}\r\n\r\n${cuerpo}`, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** El segmento sale de las etiquetas del contacto (las pone el importador). */
export function segmentoDe(tags: string[] | null | undefined): string | null {
  const conocidos = Object.keys(PLANTILLAS).filter((k) => k !== 'default');
  // Las etiquetas del importador llevan sufijo de ciudad ("logistica-gdl"): basta el prefijo.
  const lower = (tags ?? []).map((t) => t.toLowerCase());
  return conocidos.find((k) => lower.some((t) => t === k || t.startsWith(`${k}-`))) ?? null;
}
