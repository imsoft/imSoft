import { describe, it, expect } from 'vitest';
import { sanitizeBlogHtml } from './sanitize-html';

describe('sanitizeBlogHtml', () => {
  it('wraps each table in a container with horizontal scroll', () => {
    const out = sanitizeBlogHtml('<p>a</p><table><tr><td>1</td></tr></table><p>b</p><table><tr><td>2</td></tr></table>');
    expect(out.match(/<div class="overflow-x-auto"><table>/g)).toHaveLength(2);
    expect(out).toContain('</table></div><p>b</p>');
  });

  it('removes editor classes and styles but keeps the div ones', () => {
    const out = sanitizeBlogHtml('<p class="x" style="color:red">t</p><div class="cta-blog"><p>c</p></div>');
    expect(out).toBe('<p>t</p><div class="cta-blog"><p>c</p></div>');
  });
});
