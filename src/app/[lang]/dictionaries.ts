import 'server-only'

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((module) => module.default),
  es: () => import('./dictionaries/es.json').then((module) => module.default),
}

export type Locale = keyof typeof dictionaries

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

type DictFromJson = Awaited<ReturnType<typeof dictionaries.en>>

export type DictionaryStrict = DictFromJson & {
  common?: { home?: string; welcome?: string; logout?: string; profile?: string; settings?: string }
  blog?: { title?: string; metaTitle?: string; metaDescription?: string; subtitle?: string; readMore?: string; noPosts?: string }
  legal?: {
    terms?: { title?: string; metaDescription?: string; content?: string }
    privacy?: { title?: string; metaDescription?: string; intro?: string }
  }
  quote?: { title?: string; subtitle?: string; metaTitle?: string; metaDescription?: string; disclaimer?: string }
  notFound?: { title?: string; description?: string }
  serviceDetail?: { benefits?: string; requestQuote?: string }
  contact?: {
    metaTitle?: string; metaDescription?: string; title?: string; getInTouch?: string; description?: string
    address?: { label?: string }; phone?: { label?: string }; email?: { label?: string }
    form?: Record<string, unknown>
  }
  dashboard: {
    admin: { nav: Record<string, string>; crud: Record<string, string>; title?: string };
    client: { nav: Record<string, string>; title?: string };
    common: { welcome?: string; profile?: string; logout?: string };
    empty: Record<string, { title?: string; description?: string }>;
    table: { rows?: string; row?: string; columns?: string; noResults?: string; previous?: string; next?: string; columnNames?: Record<string, string> };
  };
  companies: {
    deleteSuccess?: string; deleteError?: string;
    deleteConfirm?: { title?: string; description?: string };
    name?: string; logo?: string; title?: string; create?: string; edit?: string; delete?: string;
    searchCompany?: string; uploadError?: string; sizeError?: string; typeError?: string; removeLogo?: string;
  };
}

/** Diccionario con acceso a cualquier clave (para claves no inferidas del JSON). */
export type Dictionary = DictionaryStrict & Record<string, any>

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]() as Promise<Dictionary>

