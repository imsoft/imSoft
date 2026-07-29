import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlogPaginationProps {
  lang: string;
  dict: Record<string, any>;
  currentPage: number;
  totalPages: number;
  category?: string;
  query?: string;
}

function buildHref(
  lang: string,
  page: number,
  { category, q }: { category?: string; q?: string }
) {
  const params = new URLSearchParams();
  if (category) params.set('categoria', category);
  if (q) params.set('q', q);
  if (page > 1) params.set('page', String(page));
  const search = params.toString();
  return `/${lang}/blog${search ? `?${search}` : ''}`;
}

/**
 * Devuelve los números de página a mostrar, con `null` como separador ("…").
 * Siempre incluye la primera, la última y una ventana alrededor de la actual.
 */
function pageItems(currentPage: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage]);
  if (currentPage - 1 > 1) pages.add(currentPage - 1);
  if (currentPage + 1 < totalPages) pages.add(currentPage + 1);
  if (currentPage <= 3) pages.add(2).add(3).add(4);
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1).add(totalPages - 2).add(totalPages - 3);
  }

  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const items: (number | null)[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) items.push(null);
    items.push(page);
    previous = page;
  }
  return items;
}

const linkBase =
  'inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-md border px-3 text-sm font-medium transition-colors';

export function BlogPagination({
  lang,
  dict,
  currentPage,
  totalPages,
  category,
  query,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const filters = { category, q: query };
  const items = pageItems(currentPage, totalPages);
  const pageLabel = (dict.blog?.pageOf ?? 'Page {page} of {total}')
    .replace('{page}', String(currentPage))
    .replace('{total}', String(totalPages));

  return (
    <nav
      aria-label={dict.blog?.title ?? 'Blog'}
      className="mt-14 flex flex-col items-center gap-4"
    >
      <div className="flex flex-wrap items-center justify-center gap-2">
        {currentPage > 1 ? (
          <Link
            href={buildHref(lang, currentPage - 1, filters)}
            rel="prev"
            className={cn(linkBase, 'border-border hover:bg-muted')}
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">{dict.blog?.previous ?? 'Previous'}</span>
          </Link>
        ) : (
          <span className={cn(linkBase, 'border-border opacity-40')} aria-hidden="true">
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline">{dict.blog?.previous ?? 'Previous'}</span>
          </span>
        )}

        {items.map((page, index) =>
          page === null ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={buildHref(lang, page, filters)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={cn(
                linkBase,
                page === currentPage
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:bg-muted'
              )}
            >
              {page}
            </Link>
          )
        )}

        {currentPage < totalPages ? (
          <Link
            href={buildHref(lang, currentPage + 1, filters)}
            rel="next"
            className={cn(linkBase, 'border-border hover:bg-muted')}
          >
            <span className="hidden sm:inline">{dict.blog?.next ?? 'Next'}</span>
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className={cn(linkBase, 'border-border opacity-40')} aria-hidden="true">
            <span className="hidden sm:inline">{dict.blog?.next ?? 'Next'}</span>
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{pageLabel}</p>
    </nav>
  );
}
