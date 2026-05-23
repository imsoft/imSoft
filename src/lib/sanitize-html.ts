/**
 * Cleans up rich-text-editor HTML (Lexical/TipTap) so Tailwind Typography (prose) can style it.
 * Removes embedded Tailwind classes and inline styles that won't be in the CSS bundle,
 * and unwraps decorative <span> wrappers produced by editors.
 * NOTE: class attributes on <div> elements are preserved (e.g. cta-blog).
 */
export function sanitizeBlogHtml(html: string): string {
  return html
    // Unwrap <span style="white-space: pre-wrap;">...</span> — editor artifact
    .replace(/<span[^>]*style="[^"]*white-space:\s*pre-wrap[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '$1')
    // Flatten <b><strong ...>text</strong></b> → <strong>text</strong>
    .replace(/<b>\s*<strong[^>]*>/gi, '<strong>')
    .replace(/<\/strong>\s*<\/b>/gi, '</strong>')
    // For every opening tag except <div>, strip class/style/value attributes.
    // <div> is excluded so utility classes like cta-blog are preserved.
    .replace(/<(?!div\b)([a-z][a-z0-9]*)\b([^>]*)>/gi, (_match, tag, attrs) => {
      const cleaned = attrs
        .replace(/\s+class="[^"]*"/gi, '')
        .replace(/\s+style="[^"]*"/gi, '')
        .replace(/\s+value="\d+"/gi, '');
      return `<${tag}${cleaned}>`;
    })
    // Merge <li><ul>...</ul></li> that follows a </li> into the previous <li>.
    // Rich-text editors sometimes produce <ol><li>Heading</li><li><ul>sub-items</ul></li></ol>
    // instead of the correct <ol><li>Heading<ul>sub-items</ul></li></ol>.
    .replace(/<\/li>(\s*)<li>(\s*)<ul>/gi, '<ul>');
}
