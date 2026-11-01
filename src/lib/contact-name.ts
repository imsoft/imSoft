/**
 * Full name of a contact without "null" or stray spaces. In JSX a `null`
 * renders nothing, but in a template string (`${first} ${last}`) the word
 * "null" comes out: that's how "Omar null" showed up on the email sending screen.
 */
export function contactName(c: { first_name?: string | null; last_name?: string | null } | null | undefined): string {
  return [c?.first_name, c?.last_name]
    .map((p) => (typeof p === 'string' ? p.trim() : ''))
    .filter(Boolean)
    .join(' ');
}
