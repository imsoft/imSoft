import { describe, it, expect } from 'vitest';
import { sanitizeBlogHtml } from './sanitize-html';

describe('sanitizeBlogHtml', () => {
  it('envuelve cada tabla en un contenedor con scroll horizontal', () => {
    const out = sanitizeBlogHtml('<p>a</p><table><tr><td>1</td></tr></table><p>b</p><table><tr><td>2</td></tr></table>');
    expect(out.match(/<div class="overflow-x-auto"><table>/g)).toHaveLength(2);
    expect(out).toContain('</table></div><p>b</p>');
  });

  it('quita clases y estilos del editor pero conserva las del div', () => {
    const out = sanitizeBlogHtml('<p class="x" style="color:red">t</p><div class="cta-blog"><p>c</p></div>');
    expect(out).toBe('<p>t</p><div class="cta-blog"><p>c</p></div>');
  });
});
