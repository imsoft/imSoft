/**
 * Internal links between services and blog articles.
 *
 * Google weighs a page by who links to it. The pricing articles ("cuanto cuesta...")
 * didn't link to any service, nor the services to them. The relation is declared once
 * here and used by the service page ("Lecturas utiles" block) and the article page
 * ("Servicio relacionado" card). Blog slugs not yet in the DB are simply not shown, so
 * queued topics (content/blog-queue.json) can be mapped before they're published.
 */
export const RELATED_POSTS_BY_SERVICE: Record<string, string[]> = {
  'aplicaciones-moviles': ['cuanto-cuesta-desarrollar-una-app-en-mexico', 'cuanto-cuesta-mantener-una-app-al-mes'],
  'desarrollo-de-mvp': ['cuanto-cuesta-desarrollar-una-app-en-mexico'],
  'mantenimiento-y-soporte': ['cuanto-cuesta-mantener-una-app-al-mes'],
  'web-pages': ['cuanto-cuesta-una-pagina-web-en-mexico', 'cuanto-cobra-un-programador-por-hacer-una-pagina-web'],
  // A store's price is answered by the /es/cuanto-cuesta/tienda-en-linea guide, not an article.
  'tiendas-en-linea': ['cuanto-cuesta-una-pagina-web-en-mexico'],
  'software-a-medida': [
    'cuanto-cuesta-un-sistema-de-inventario',
    'cuanto-cuesta-un-erp-para-pymes-en-mexico',
    'software-de-logistica-para-empresas-en-mexico',
    'software-para-clinicas-que-necesita-y-cuanto-cuesta',
  ],
};

export function relatedPostsForService(serviceSlug: string): string[] {
  return RELATED_POSTS_BY_SERVICE[serviceSlug] ?? [];
}

/** Inverse: services that link to an article, in the order they appear above. */
export function relatedServicesForPost(postSlugEs: string): string[] {
  return Object.entries(RELATED_POSTS_BY_SERVICE)
    .filter(([, posts]) => posts.includes(postSlugEs))
    .map(([service]) => service);
}
