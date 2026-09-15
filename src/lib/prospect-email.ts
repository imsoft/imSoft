// Render de la plantilla de prospeccion a HTML y a texto plano.
//
// El texto plano es lo que se guarda en `contacts.notes` para poder copiarlo y
// pegarlo desde la ficha del CRM, asi que debe leerse bien sin formato.

/** Sustituye los `{{campo}}` de la plantilla con los valores de la fila del CSV. */
export function renderTemplate(template: string, row: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) =>
    key in row ? row[key] : match
  )
}

/** Campos `{{...}}` de la plantilla que la fila no trae. */
export function missingFields(template: string, row: Record<string, string>): string[] {
  const usados = [...template.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1])
  return [...new Set(usados.filter((campo) => !(campo in row)))]
}

/**
 * Convierte el correo en HTML a texto plano legible: sin etiquetas, sin estilos
 * y sin el logotipo, conservando un salto de linea entre parrafos.
 */
export function htmlToText(html: string): string {
  const cuerpo = html.includes('<body>') ? html.split('<body>')[1] : html

  const limpio = cuerpo
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    // Lo marcado con data-plain="skip" existe solo para el correo en HTML
    // (el logotipo, el titulo que ya va como asunto): fuera del texto plano.
    .replace(/<(\w+)\b[^>]*\bdata-plain=["']skip["'][^>]*>[\s\S]*?<\/\1>/gi, '')
    // Un enlace sin su URL no sirve para copiar y pegar; mailto y tel se quedan
    // con el texto, que ya dice la direccion o el numero.
    .replace(/<a\b[^>]*href=["'](?!mailto:|tel:)([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_, href: string, contenido: string) => {
        const texto = contenido.replace(/<[^>]+>/g, '').trim()
        // Cuando el texto del enlace ya es la direccion ("imsoft.io"), repetir
        // la URL completa solo estorba.
        const destino = href.replace(/^https?:\/\//, '').replace(/\/$/, '')
        return texto === destino || texto === href ? texto : `${texto}: ${href}`
      })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h1|h2|h3|tr|li)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')

  return decodeEntities(limpio)
    .split('\n')
    .map((linea) => linea.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function decodeEntities(texto: string): string {
  const nombradas: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', laquo: '«', raquo: '»',
  }
  return texto
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name: string) => nombradas[name.toLowerCase()] ?? match)
}

/**
 * El correo listo para copiar y pegar, con el asunto arriba. Es exactamente lo
 * que se guarda en las notas del contacto.
 */
export function renderPlainEmail(
  template: string,
  row: Record<string, string>,
  opciones: { subjectField?: string } = {}
): { subject: string; body: string; text: string } {
  const subject = row[opciones.subjectField ?? 'asunto'] ?? ''
  const body = htmlToText(renderTemplate(template, row))
  const text = subject ? `Asunto: ${subject}\n\n${body}` : body
  return { subject, body, text }
}
