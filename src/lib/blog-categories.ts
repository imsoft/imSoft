/**
 * Categorías del blog. Fuente única de verdad para el formulario del dashboard
 * y para los filtros públicos de /[lang]/blog.
 */
export const BLOG_CATEGORIES = [
  { value: 'technology', label_es: 'Tecnología', label_en: 'Technology' },
  { value: 'design', label_es: 'Diseño', label_en: 'Design' },
  { value: 'business', label_es: 'Negocios', label_en: 'Business' },
  { value: 'marketing', label_es: 'Marketing', label_en: 'Marketing' },
  { value: 'development', label_es: 'Desarrollo', label_en: 'Development' },
  { value: 'tutorials', label_es: 'Tutoriales', label_en: 'Tutorials' },
  { value: 'news', label_es: 'Noticias', label_en: 'News' },
  { value: 'tips', label_es: 'Tips y Trucos', label_en: 'Tips & Tricks' },
] as const

export type BlogCategoryValue = (typeof BLOG_CATEGORIES)[number]['value']

export const BLOG_CATEGORY_VALUES: readonly string[] = BLOG_CATEGORIES.map((c) => c.value)

export function isBlogCategory(value: string): value is BlogCategoryValue {
  return BLOG_CATEGORY_VALUES.includes(value)
}

/** Etiqueta legible de una categoría, con fallback al valor crudo. */
export function blogCategoryLabel(value: string, lang: string): string {
  const category = BLOG_CATEGORIES.find((c) => c.value === value)
  if (!category) return value
  return lang === 'en' ? category.label_en : category.label_es
}
