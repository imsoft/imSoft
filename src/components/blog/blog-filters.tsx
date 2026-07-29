'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { blogCategoryLabel } from '@/lib/blog-categories';

interface BlogFiltersProps {
  lang: string;
  dict: Record<string, any>;
  /** Categorías con al menos un post publicado, con su conteo. */
  categories: { value: string; count: number }[];
  activeCategory?: string;
  query?: string;
  totalCount: number;
}

/** Construye la URL del listado conservando los filtros indicados. */
function buildHref(
  lang: string,
  { category, q }: { category?: string; q?: string }
) {
  const params = new URLSearchParams();
  if (category) params.set('categoria', category);
  if (q) params.set('q', q);
  const search = params.toString();
  return `/${lang}/blog${search ? `?${search}` : ''}`;
}

export function BlogFilters({
  lang,
  dict,
  categories,
  activeCategory,
  query = '',
  totalCount,
}: BlogFiltersProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(query);
  // Evita relanzar la navegación cuando el valor ya coincide con la URL actual.
  const lastPushed = useRef(query);

  // Sincroniza el input si el usuario navega (atrás/adelante o limpiar filtros).
  useEffect(() => {
    setValue(query);
    lastPushed.current = query;
  }, [query]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === lastPushed.current) return;

    const timeout = setTimeout(() => {
      lastPushed.current = trimmed;
      startTransition(() => {
        router.replace(buildHref(lang, { category: activeCategory, q: trimmed }), {
          scroll: false,
        });
      });
    }, 400);

    return () => clearTimeout(timeout);
  }, [value, activeCategory, lang, router]);

  const hasFilters = Boolean(activeCategory) || Boolean(query);
  const resultsLabel =
    totalCount === 1
      ? dict.blog?.resultsCountOne ?? '1 article'
      : (dict.blog?.resultsCount ?? '{count} articles').replace(
          '{count}',
          String(totalCount)
        );

  return (
    <div className="mb-10 flex flex-col gap-6">
      <div className="mx-auto w-full max-w-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={dict.blog?.searchPlaceholder ?? 'Search articles...'}
            aria-label={dict.blog?.searchPlaceholder ?? 'Search articles...'}
            className="h-11 pl-9 pr-10"
          />
          {isPending ? (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          ) : value ? (
            <button
              type="button"
              onClick={() => setValue('')}
              aria-label={dict.blog?.clearSearch ?? 'Clear search'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href={buildHref(lang, { q: query })}
            scroll={false}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              !activeCategory
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {dict.blog?.allCategories ?? 'All'}
          </Link>
          {categories.map((category) => {
            const isActive = category.value === activeCategory;
            return (
              <Link
                key={category.value}
                href={buildHref(lang, {
                  category: isActive ? undefined : category.value,
                  q: query,
                })}
                scroll={false}
                className={cn(
                  'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {blogCategoryLabel(category.value, lang)}
                <span className="ml-1.5 text-xs opacity-70">{category.count}</span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
        <span>{resultsLabel}</span>
        {hasFilters && (
          <Link
            href={`/${lang}/blog`}
            scroll={false}
            className="font-medium text-primary hover:underline"
          >
            {dict.blog?.clearFilters ?? 'Clear filters'}
          </Link>
        )}
      </div>
    </div>
  );
}
