/**
 * Cleans up rich-text-editor HTML (Lexical/TipTap) so Tailwind Typography (prose) can style it.
 * Removes embedded Tailwind classes and inline styles that won't be in the CSS bundle,
 * and unwraps decorative <span> wrappers produced by editors.
 */
export function sanitizeBlogHtml(html: string): string {
  return html
    // Unwrap <span style="white-space: pre-wrap;">...</span> — editor artifact
    .replace(/<span[^>]*style="[^"]*white-space:\s*pre-wrap[^"]*"[^>]*>([\s\S]*?)<\/span>/gi, '$1')
    // Flatten <b><strong ...>text</strong></b> → <strong>text</strong>
    .replace(/<b>\s*<strong[^>]*>/gi, '<strong>')
    .replace(/<\/strong>\s*<\/b>/gi, '</strong>')
    // Strip class attributes (classes in DB strings are not in the Tailwind bundle)
    .replace(/\s+class="[^"]*"/gi, '')
    // Strip inline style attributes (let prose handle spacing/alignment)
    .replace(/\s+style="[^"]*"/gi, '')
    // Remove value="N" from <li> (editor artefact)
    .replace(/\s+value="\d+"/gi, '');
}
