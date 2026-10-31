// Renders the prospecting template to HTML and to plain text.
//
// The plain text is what's stored in `contacts.notes` so it can be copied and pasted
// from the CRM contact page, so it must read well without formatting.

/** Replaces the template's `{{field}}` placeholders with the values of the CSV row. */
export function renderTemplate(template: string, row: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in row ? row[key] : match
  )
}

/** `{{...}}` fields of the template that the row doesn't have. */
export function missingFields(template: string, row: Record<string, string>): string[] {
  const used = [...template.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])
  return [...new Set(used.filter((field) => !(field in row)))]
}

/**
 * Turns the HTML email into readable plain text: no tags, no styles and no logo, keeping
 * a line break between paragraphs.
 */
export function htmlToText(html: string): string {
  const body = html.includes('<body>') ? html.split('<body>')[1] : html

  const cleaned = body
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    // What's marked with data-plain="skip" exists only for the HTML email
    // (the logo, the title that already goes as the subject): out of the plain text.
    .replace(/<(\w+)\b[^>]*\bdata-plain=["']skip["'][^>]*>[\s\S]*?<\/\1>/gi, '')
    // A link without its URL is useless for copy and paste; mailto and tel keep
    // their text, which already says the address or the number.
    .replace(/<a\b[^>]*href=["'](?!mailto:|tel:)([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_, href: string, content: string) => {
        const text = content.replace(/<[^>]+>/g, '').trim()
        // When the link text already is the address ("imsoft.io"), repeating the
        // full URL just gets in the way.
        const target = href.replace(/^https?:\/\//, '').replace(/\/$/, '')
        return text === target || text === href ? text : `${text}: ${href}`
      })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|tr|li)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')

  return decodeEntities(cleaned)
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function decodeEntities(text: string): string {
  const named: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»',
  }
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => named[name.toLowerCase()] ?? match)
}

/**
 * Names of the `contact_custom_fields` fields where the already personalized email is
 * stored, so the CRM send screen preloads it. The body is stored as HTML because that's
 * the format sent through Resend; the contact's notes carry the text version, to read and
 * copy it.
 */
export const SUBJECT_FIELD = 'prospect_email_subject'
export const HTML_FIELD = 'prospect_email_html'

/**
 * The email ready to copy and paste, with the subject on top. It's exactly what's stored
 * in the contact's notes.
 */
export function renderPlainEmail(
  template: string,
  row: Record<string, string>,
  options: { subjectField?: string } = {}
): { subject: string; body: string; text: string } {
  const subject = row[options.subjectField ?? 'subject'] ?? ''
  const body = htmlToText(renderTemplate(template, row))
  const text = subject ? `Asunto: ${subject}\n\n${body}` : body
  return { subject, body, text }
}
