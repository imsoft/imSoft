import { describe, it, expect } from 'vitest';
import { RELATED_POSTS_BY_SERVICE, relatedPostsForService, relatedServicesForPost } from './related-content';
import cola from '../../content/blog-queue.json';

describe('related-content', () => {
  it('los dos articulos de precios ya publicados enlazan con su servicio', () => {
    expect(relatedServicesForPost('cuanto-cuesta-desarrollar-una-app-en-mexico')).toContain('aplicaciones-moviles');
    expect(relatedServicesForPost('cuanto-cuesta-una-pagina-web-en-mexico')).toContain('web-pages');
    expect(relatedPostsForService('aplicaciones-moviles')).toContain('cuanto-cuesta-desarrollar-una-app-en-mexico');
  });

  it('todo slug de blog mapeado existe: publicado o en la cola', () => {
    const publicados = ['cuanto-cuesta-desarrollar-una-app-en-mexico', 'cuanto-cuesta-una-pagina-web-en-mexico'];
    const enCola = (cola as { temas: Array<{ slug_es: string }> }).temas.map((t) => t.slug_es);
    for (const posts of Object.values(RELATED_POSTS_BY_SERVICE)) {
      for (const p of posts) expect([...publicados, ...enCola], p).toContain(p);
    }
  });

  it('un articulo sin relacion devuelve lista vacia, no rompe', () => {
    expect(relatedServicesForPost('no-existe')).toEqual([]);
    expect(relatedPostsForService('no-existe')).toEqual([]);
  });
});
