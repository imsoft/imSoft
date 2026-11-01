/**
 * Single template for the emails the platform sends (Resend): admin notices,
 * quotes to the client, project updates and blog. Tables and inline styles so
 * Gmail and Outlook render them the same. Pure logic, tested in layout.test.ts.
 *
 * Cold prospecting does NOT use this: it goes through Gmail with its own design in src/lib/outreach.ts.
 */

export const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'
const LOGO = 'https://www.imsoft.io/logos/imsoft-isotipo-correo-v3.png'

export const COLOR = {
  brand: '#1e88e5',
  brandDark: '#1565c0',
  soft: '#e8f2fd',
  background: '#f4f6fa',
  border: '#e3ecf5',
  text: '#1f2937',
  muted: '#6b7280',
  success: '#047857',
  successBg: '#ecfdf5',
  warning: '#b45309',
  warningBg: '#fffbeb',
} as const

const FONT = "Arial,Helvetica,sans-serif"

export function esc(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Safe URL for href/src: only http(s), mailto and tel. */
export function url(u: string): string {
  const t = String(u ?? '').trim()
  return /^(https?:|mailto:|tel:)/i.test(t) ? esc(t) : '#'
}

export function paragraph(html: string, opts: { muted?: boolean; small?: boolean } = {}): string {
  const color = opts.muted ? COLOR.muted : COLOR.text
  const size = opts.small ? 14 : 16
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:${size}px;line-height:1.6;color:${color}">${html}</p>`
}

export function subtitle(text: string): string {
  return `<p style="margin:24px 0 10px;font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${COLOR.brand}">${esc(text)}</p>`
}

/** Full-width brand-color button (in a table: Outlook ignores padding on <a>). */
export function button(text: string, href: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 20px"><tr>
  <td align="center" style="background:${COLOR.brand};border-radius:8px">
    <a href="${url(href)}" style="display:block;padding:14px 20px;font-family:${FONT};font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none">${esc(text)}</a>
  </td></tr></table>`
}

/** Data table: label on the left, value (already escaped HTML) on the right. */
export function dataTable(rows: Array<[string, string]>): string {
  const visible = rows.filter(([, v]) => v !== '' && v !== null && v !== undefined)
  if (visible.length === 0) return ''
  const tr = visible
    .map(([k, v], i) => `<tr>
    <td style="padding:12px 16px;font-family:${FONT};font-size:13px;color:${COLOR.muted};width:38%;vertical-align:top;${i < visible.length - 1 ? `border-bottom:1px solid ${COLOR.border};` : ''}">${esc(k)}</td>
    <td style="padding:12px 16px;font-family:${FONT};font-size:15px;color:${COLOR.text};font-weight:bold;vertical-align:top;${i < visible.length - 1 ? `border-bottom:1px solid ${COLOR.border};` : ''}">${v}</td>
  </tr>`)
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border:1px solid ${COLOR.border};border-radius:10px;border-collapse:separate">${tr}</table>`
}

/** Box with a colored left border: quoted message, completed task, notice. */
export function callout(html: string, tone: 'info' | 'success' | 'warning' = 'info', title?: string): string {
  const c = tone === 'success' ? [COLOR.success, COLOR.successBg] : tone === 'warning' ? [COLOR.warning, COLOR.warningBg] : [COLOR.brand, COLOR.soft]
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px"><tr>
  <td style="background:${c[1]};border-left:4px solid ${c[0]};border-radius:0 8px 8px 0;padding:14px 18px;font-family:${FONT}">
    ${title ? `<p style="margin:0 0 6px;font-size:13px;font-weight:bold;color:${c[0]}">${esc(title)}</p>` : ''}
    <div style="font-size:15px;line-height:1.6;color:${COLOR.text}">${html}</div>
  </td></tr></table>`
}

/** Free text from a user (contact message): escaped and with line breaks. */
export function plainText(s: string): string {
  return esc(s).replace(/\r?\n/g, '<br>')
}

export function progressBar(pct: number, caption?: string): string {
  const p = Math.max(0, Math.min(100, Math.round(pct)))
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px"><tr>
    <td style="font-family:${FONT};font-size:13px;color:${COLOR.muted}">Avance del proyecto</td>
    <td align="right" style="font-family:${FONT};font-size:13px;font-weight:bold;color:${COLOR.text}">${p}%</td>
  </tr></table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 ${caption ? 6 : 20}px;background:${COLOR.border};border-radius:99px"><tr>
    ${p > 0 ? `<td width="${p}%" style="height:8px;line-height:8px;font-size:0;background:${COLOR.brand};border-radius:99px">&nbsp;</td>` : ''}
    ${p < 100 ? `<td style="height:8px;line-height:8px;font-size:0">&nbsp;</td>` : ''}
  </tr></table>
  ${caption ? `<p style="margin:0 0 20px;font-family:${FONT};font-size:12px;color:${COLOR.muted}">${esc(caption)}</p>` : ''}`
}

export function image(src: string, alt: string): string {
  return `<img src="${url(src)}" alt="${esc(alt)}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:16px 16px 0 0">`
}

export function codeBlock(text: string): string {
  return `<pre style="margin:0 0 20px;padding:14px 16px;background:${COLOR.background};border:1px solid ${COLOR.border};border-radius:8px;font-family:Menlo,Consolas,monospace;font-size:13px;line-height:1.5;color:${COLOR.text};white-space:pre-wrap;word-break:break-word">${esc(text)}</pre>`
}

export interface LayoutOpts {
  /** Inbox preview text (not visible inside the email). */
  preheader: string
  /** Small label above the title: "Cotización aceptada", "Formulario de contacto"... */
  label?: string
  title: string
  /** Body HTML, built with the pieces of this module. */
  body: string
  /** Full-width cover image (blog). */
  cover?: { src: string; alt: string }
  /** Extra footer lines (already escaped HTML): reason for the email, unsubscribe, address. */
  footer?: string[]
  lang?: string
}

/** Complete email with the imSoft branding. */
export function emailLayout(o: LayoutOpts): string {
  const year = new Date().getFullYear()
  const footer = [
    `<a href="${SITE}" style="color:${COLOR.brand};text-decoration:none;font-weight:bold">imSoft</a> · Software a la medida · Guadalajara, Jalisco`,
    ...(o.footer ?? []),
    `© ${year} imSoft`,
  ]
  return `<!DOCTYPE html>
<html lang="${o.lang ?? 'es'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(o.title)}</title></head>
<body style="margin:0;padding:0;background:${COLOR.background}">
<span style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:${COLOR.background}">${esc(o.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.background}">
<tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;border:1px solid ${COLOR.border}">
  ${o.cover ? `<tr><td style="padding:0">${image(o.cover.src, o.cover.alt)}</td></tr>` : ''}
  <tr><td style="padding:36px 40px 0">
    <a href="${SITE}" style="text-decoration:none"><img src="${LOGO}" width="48" height="63" alt="imSoft" style="display:block;width:48px;height:auto;border:0"></a>
  </td></tr>
  <tr><td style="padding:28px 40px 8px">
    ${o.label ? `<p style="margin:0 0 8px;font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;color:${COLOR.brand}">${esc(o.label)}</p>` : ''}
    <h1 style="margin:0 0 20px;font-family:${FONT};font-size:24px;line-height:1.3;font-weight:bold;color:#111827">${esc(o.title)}</h1>
    ${o.body}
  </td></tr>
  <tr><td style="padding:8px 40px 32px"></td></tr>
</table>
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%">
  <tr><td align="center" style="padding:20px 12px 0;font-family:${FONT};font-size:12px;line-height:1.7;color:#9ca3af">${footer.join('<br>')}</td></tr>
</table>
</td></tr>
</table>
</body></html>`
}
