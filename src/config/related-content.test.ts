import { describe, it, expect } from 'vitest';
import { RELATED_POSTS_BY_SERVICE, relatedPostsForService, relatedServicesForPost } from './related-content';
import queue from '../../content/blog-queue.json';

describe('related-content', () => {
  it('the two published pricing articles link to their service', () => {
    expect(relatedServicesForPost('cuanto-cuesta-desarrollar-una-app-en-mexico')).toContain('aplicaciones-moviles');
    expect(relatedServicesForPost('cuanto-cuesta-una-pagina-web-en-mexico')).toContain('web-pages');
    expect(relatedPostsForService('aplicaciones-moviles')).toContain('cuanto-cuesta-desarrollar-una-app-en-mexico');
  });

  it('every mapped blog slug exists: published or queued', () => {
    const published = ['cuanto-cuesta-desarrollar-una-app-en-mexico', 'cuanto-cuesta-una-pagina-web-en-mexico'];
    const queued = (queue as { topics: Array<{ slug_es: string }> }).topics.map((t) => t.slug_es);
    for (const posts of Object.values(RELATED_POSTS_BY_SERVICE)) {
      for (const p of posts) expect([...published, ...queued], p).toContain(p);
    }
  });

  it('an unrelated article returns an empty list instead of throwing', () => {
    expect(relatedServicesForPost('does-not-exist')).toEqual([]);
    expect(relatedPostsForService('does-not-exist')).toEqual([]);
  });
});
