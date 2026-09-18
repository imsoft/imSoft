/**
 * Plantilla unica de los correos que manda la plataforma (Resend): avisos al admin,
 * cotizaciones al cliente, avances de proyecto y blog. Tablas y estilos en linea para
 * que Gmail y Outlook los pinten igual. Logica pura, probada en layout.test.ts.
 *
 * La prospeccion en frio NO usa esto: va por Gmail con su propio diseño en src/lib/outreach.ts.
 */

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'
const LOGO = 'https://www.imsoft.io/logos/imsoft-isotipo-correo-v2.png'

export const COLOR = {
  marca: '#1e88e5',
  marcaOscuro: '#1565c0',
  suave: '#e8f2fd',
  fondo: '#f4f6fa',
  borde: '#e3ecf5',
  texto: '#1f2937',
  tenue: '#6b7280',
  exito: '#047857',
  exitoFondo: '#ecfdf5',
  alerta: '#b45309',
  alertaFondo: '#fffbeb',
} as const

const FUENTE = "Arial,Helvetica,sans-serif"

export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** URL segura para href/src: solo http(s), mailto y tel. */
export function url(u: string): string {
  const t = String(u ?? '').trim()
  return /^(https?:|mailto:|tel:)/i.test(t) ? esc(t) : '#'
}

export function parrafo(html: string, opts: { tenue?: boolean; chico?: boolean } = {}): string {
  const color = opts.tenue ? COLOR.tenue : COLOR.texto
  const size = opts.chico ? 14 : 16
  return `<p style="margin:0 0 16px;font-family:${FUENTE};font-size:${size}px;line-height:1.6;color:${color}">${html}</p>`
}

export function subtitulo(texto: string): string {
  return `<p style="margin:24px 0 10px;font-family:${FUENTE};font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${COLOR.marca}">${esc(texto)}</p>`
}

/** Boton ancho de color de marca (en tabla: Outlook no respeta padding en <a>). */
export function boton(texto: string, href: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px"><tr>
  <td align="center" style="background:${COLOR.marca};border-radius:8px">
    <a href="${url(href)}" style="display:block;padding:14px 20px;font-family:${FUENTE};font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none">${esc(texto)}</a>
  </td></tr></table>`
}

/** Tabla de datos: etiqueta a la izquierda, valor (HTML ya escapado) a la derecha. */
export function datos(filas: Array<[string, string]>): string {
  const visibles = filas.filter(([, v]) => v !== '' && v !== null && v !== undefined)
  if (visibles.length === 0) return ''
  const tr = visibles
    .map(([k, v], i) => `<tr>
    <td style="padding:12px 16px;font-family:${FUENTE};font-size:13px;color:${COLOR.tenue};width:38%;vertical-align:top;${i < visibles.length - 1 ? `border-bottom:1px solid ${COLOR.borde};` : ''}">${esc(k)}</td>
    <td style="padding:12px 16px;font-family:${FUENTE};font-size:15px;color:${COLOR.texto};font-weight:bold;vertical-align:top;${i < visibles.length - 1 ? `border-bottom:1px solid ${COLOR.borde};` : ''}">${v}</td>
  </tr>`)
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border:1px solid ${COLOR.borde};border-radius:10px;border-collapse:separate">${tr}</table>`
}

/** Recuadro con borde de color a la izquierda: mensaje citado, tarea completada, aviso. */
export function destacado(html: string, tono: 'info' | 'exito' | 'alerta' = 'info', titulo?: string): string {
  const c = tono === 'exito' ? [COLOR.exito, COLOR.exitoFondo] : tono === 'alerta' ? [COLOR.alerta, COLOR.alertaFondo] : [COLOR.marca, COLOR.suave]
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px"><tr>
  <td style="background:${c[1]};border-left:4px solid ${c[0]};border-radius:0 8px 8px 0;padding:14px 18px;font-family:${FUENTE}">
    ${titulo ? `<p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:${c[0]}">${esc(titulo)}</p>` : ''}
    <div style="font-size:15px;line-height:1.6;color:${COLOR.texto}">${html}</div>
  </td></tr></table>`
}

/** Texto libre de un usuario (mensaje de contacto): escapado y con saltos de linea. */
export function textoLibre(s: string): string {
  return esc(s).replace(/\r?\n/g, '<br>')
}

export function barraProgreso(pct: number, leyenda?: string): string {
  const p = Math.max(0, Math.min(100, Math.round(pct)))
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px"><tr>
    <td style="font-family:${FUENTE};font-size:13px;color:${COLOR.tenue}">Avance del proyecto</td>
    <td align="right" style="font-family:${FUENTE};font-size:13px;font-weight:bold;color:${COLOR.texto}">${p}%</td>
  </tr></table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 ${leyenda ? 6 : 20}px;background:${COLOR.borde};border-radius:99px"><tr>
    ${p > 0 ? `<td width="${p}%" style="height:8px;line-height:8px;font-size:0;background:${COLOR.marca};border-radius:99px">&nbsp;</td>` : ''}
    ${p < 100 ? `<td style="height:8px;line-height:8px;font-size:0">&nbsp;</td>` : ''}
  </tr></table>
  ${leyenda ? `<p style="margin:0 0 20px;font-family:${FUENTE};font-size:12px;color:${COLOR.tenue}">${esc(leyenda)}</p>` : ''}`
}

export function imagen(src: string, alt: string): string {
  return `<img src="${url(src)}" alt="${esc(alt)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:16px 16px 0 0">`
}

export function codigo(texto: string): string {
  return `<pre style="margin:0 0 20px;padding:14px 16px;background:${COLOR.fondo};border:1px solid ${COLOR.borde};border-radius:8px;font-family:Menlo,Consolas,monospace;font-size:13px;line-height:1.5;color:${COLOR.texto};white-space:pre-wrap;word-break:break-word">${esc(texto)}</pre>`
}

export interface LayoutOpts {
  /** Texto de vista previa en la bandeja (no se ve dentro del correo). */
  preheader: string
  /** Etiqueta chica sobre el titulo: "Cotización aceptada", "Formulario de contacto"... */
  etiqueta?: string
  titulo: string
  /** HTML del cuerpo, armado con las piezas de este modulo. */
  cuerpo: string
  /** Imagen de portada a todo lo ancho (blog). */
  portada?: { src: string; alt: string }
  /** Lineas extra del pie (HTML ya escapado): motivo del correo, baja, direccion. */
  pie?: string[]
  lang?: string
}

/** Correo completo con la marca de imSoft. */
export function emailLayout(o: LayoutOpts): string {
  const anio = new Date().getFullYear()
  const pie = [
    `<a href="${SITE}" style="color:${COLOR.marca};text-decoration:none;font-weight:bold">imSoft</a> · Software a la medida · Guadalajara, Jalisco`,
    ...(o.pie ?? []),
    `© ${anio} imSoft`,
  ]
  return `<!DOCTYPE html>
<html lang="${o.lang ?? 'es'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(o.titulo)}</title></head>
<body style="margin:0;padding:0;background:${COLOR.fondo}">
<span style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:${COLOR.fondo}">${esc(o.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.fondo}">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;border:1px solid ${COLOR.borde}">
  ${o.portada ? `<tr><td style="padding:0">${imagen(o.portada.src, o.portada.alt)}</td></tr>` : ''}
  <tr><td style="padding:36px 40px 0">
    <a href="${SITE}" style="text-decoration:none"><img src="${LOGO}" width="36" height="46" alt="imSoft" style="display:block;width:36px;height:auto;border:0"></a>
  </td></tr>
  <tr><td style="padding:28px 40px 8px">
    ${o.etiqueta ? `<p style="margin:0 0 8px;font-family:${FUENTE};font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${COLOR.marca}">${esc(o.etiqueta)}</p>` : ''}
    <h1 style="margin:0 0 20px;font-family:${FUENTE};font-size:24px;line-height:1.3;font-weight:bold;color:#111827">${esc(o.titulo)}</h1>
    ${o.cuerpo}
  </td></tr>
  <tr><td style="padding:8px 40px 32px"></td></tr>
</table>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">
  <tr><td align="center" style="padding:20px 12px 0;font-family:${FUENTE};font-size:12px;line-height:1.7;color:#9ca3af">${pie.join('<br>')}</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}
