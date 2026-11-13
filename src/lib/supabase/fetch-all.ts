/**
 * Reads every row of a query, page by page. Supabase (PostgREST) returns at most 1,000
 * rows per request whatever `.limit()` asks for, so a plain select silently drops the rest:
 * on 2026-11-13 the CRM had 1,801 contacts, the table showed 1,000 and the prospect search
 * stopped seeing 800 existing businesses (76 came back in as duplicates).
 *
 * `page(from, to)` must build the same ordered query each time and end with `.range(from, to)`.
 */
export const PAGE_SIZE = 1000

export async function fetchAll<T>(
  page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  pageSize = PAGE_SIZE,
): Promise<T[]> {
  const out: T[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await page(from, from + pageSize - 1)
    if (error) throw new Error(error.message)
    out.push(...(data ?? []))
    if (!data || data.length < pageSize) return out
  }
}
