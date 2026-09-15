/**
 * Nombre completo de un contacto sin "null" ni espacios sueltos. En JSX un `null`
 * no pinta nada, pero en un template string (`${first} ${last}`) sale la palabra
 * "null": asi aparecio "Omar null" en la pantalla de envio de correo.
 */
export function contactName(c: { first_name?: string | null; last_name?: string | null } | null | undefined): string {
  return [c?.first_name, c?.last_name]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
    .join(' ');
}
