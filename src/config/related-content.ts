/**
 * Enlaces internos entre servicios y articulos del blog.
 *
 * Google pondera una pagina por quien la enlaza. Los articulos de precios ("cuanto
 * cuesta...") no enlazaban a ningun servicio ni los servicios a ellos. Aqui se declara
 * la relacion una vez y la usan la pagina de servicio (bloque "Lecturas utiles") y la
 * ficha del articulo (tarjeta "Servicio relacionado"). Los slugs de blog que aun no
 * existan en la BD simplemente no se muestran: se pueden mapear temas de la cola
 * (content/blog-queue.json) antes de que se publiquen.
 */
export const RELATED_POSTS_BY_SERVICE: Record<string, string[]> = {
  'aplicaciones-moviles': ['cuanto-cuesta-desarrollar-una-app-en-mexico', 'cuanto-cuesta-mantener-una-app-al-mes'],
  'desarrollo-de-mvp': ['cuanto-cuesta-desarrollar-una-app-en-mexico'],
  'mantenimiento-y-soporte': ['cuanto-cuesta-mantener-una-app-al-mes'],
  'web-pages': ['cuanto-cuesta-una-pagina-web-en-mexico', 'cuanto-cobra-un-programador-por-hacer-una-pagina-web'],
  'tiendas-en-linea': ['cuanto-cuesta-una-tienda-en-linea-en-mexico', 'cuanto-cuesta-una-pagina-web-en-mexico'],
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

/** Inversa: servicios que enlazan a un articulo, en el orden en que aparecen arriba. */
export function relatedServicesForPost(postSlugEs: string): string[] {
  return Object.entries(RELATED_POSTS_BY_SERVICE)
    .filter(([, posts]) => posts.includes(postSlugEs))
    .map(([service]) => service);
}
