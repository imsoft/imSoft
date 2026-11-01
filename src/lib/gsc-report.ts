/**
 * Pure logic of the Search Console report. No I/O: everything that touches the API lives in
 * scripts/gsc-report.mjs, so this can be tested with vitest without credentials.
 *
 * The report compares against two baselines set before deploying the August 2026
 * audit, and measures the effect of the domain outage (September 2 to 8).
 */

export type QueryClass = 'brand' | 'ims-collision' | 'commercial';

/** Label printed in the report (kept in Spanish, it is what Brandon reads). */
export const QUERY_CLASS_LABEL: Record<QueryClass, string> = { brand: 'marca', 'ims-collision': 'colision-ims', commercial: 'comercial' };

export interface QueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface PageRow {
  page: string;
  clicks: number;
  impressions: number;
  position: number;
}

export interface DateRow {
  date: string;
  clicks: number;
  impressions: number;
}

export interface InspectionRow {
  url: string;
  verdict: string;
  coverageState: string;
  lastCrawlTime: string | null;
  /** Canonical Google chose. Only meaningful when it differs from the declared one. */
  googleCanonical?: string | null;
  userCanonical?: string | null;
}

export interface Totals {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export const BASELINE = {
  /** GSC indexing report of 2026-08-20, before deploying anything. */
  indexing: {
    date: '2026-08-20',
    indexed: 42,
    notIndexed: 266,
    discoveredNotIndexed: 172,
    crawledNotIndexed: 34,
  },
  /** 28-day performance reported by Brandon on 2026-08-27. */
  performance28d: {
    date: '2026-08-27',
    clicks: 15,
    impressions: 497,
    ctr: 0.03,
    position: 39.4,
  },
  /**
   * The domain pointed to a parking page during this range. It came back on September 8
   * in the mid-afternoon (UTC), so a crawl from that day may be from before or
   * after: it's cut by the hour, not by the date.
   */
  outage: { from: '2026-09-02', to: '2026-09-08', recoveredAt: '2026-09-08T16:30:00Z' },
} as const;

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * Almost all historical impressions came from people searching for "IMS", another company.
 * Separating that from our own brand and from commercial queries is what shows
 * whether SEO works: only the `commercial` class is traffic that can be won.
 */
export function classifyQuery(query: string): QueryClass {
  const q = normalize(query);

  // First what's recognized by how it's written with spaces or punctuation: "im
  // software", "i soft", "i'm soft" and "i.soft" are people searching for IMS or something else, even
  // though they look like the brand when joined.
  if (/\bims\b/.test(q) || /\bim software\b/.test(q) || /\bi'?m?[ .-]+soft/.test(q)) {
    return 'ims-collision';
  }

  // Without punctuation or spaces: "im soft" and "imsoft" are the same thing.
  const compact = q.replace(/[^a-z0-9]/g, '');
  if (compact.includes('imsoft') || compact.includes('imsof') || compact.includes('insoft')) {
    return 'brand';
  }
  // Other unrelated brands that came up in the real reports: imsdatawise, imhosys, iosoft,
  // oisoft, inisoft, "oims software", "international micro systems" (what IMS stands for).
  if (
    /^ims[a-z]*$/.test(compact) ||
    /^imh[a-z]*$/.test(compact) ||
    /^[a-z]{1,4}soft$/.test(compact) ||
    /\boims\b/.test(q) ||
    /\bmicro ?systems?\b/.test(q) ||
    /\biomify\b/.test(q)
  ) {
    return 'ims-collision';
  }
  return 'commercial';
}

export interface ClassSummary {
  clicks: number;
  impressions: number;
  queries: number;
}

export function summarizeQueries(rows: QueryRow[]): {
  byClass: Record<QueryClass, ClassSummary>;
  commercial: QueryRow[];
} {
  const empty = (): ClassSummary => ({ clicks: 0, impressions: 0, queries: 0 });
  const byClass: Record<QueryClass, ClassSummary> = {
    brand: empty(),
    'ims-collision': empty(),
    commercial: empty(),
  };
  const commercial: QueryRow[] = [];

  for (const row of rows) {
    const queryClass = classifyQuery(row.query);
    byClass[queryClass].clicks += row.clicks;
    byClass[queryClass].impressions += row.impressions;
    byClass[queryClass].queries += 1;
    if (queryClass === 'commercial') commercial.push(row);
  }

  commercial.sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks);
  return { byClass: byClass, commercial: commercial.slice(0, 15) };
}

/** Of the visible properties, the domain one wins; otherwise the www prefix. */
export function pickProperty(sites: Array<{ siteUrl?: string | null }>): string | null {
  const urls = sites.map((s) => s.siteUrl ?? '').filter(Boolean);
  return (
    urls.find((u) => u === 'sc-domain:imsoft.io') ??
    urls.find((u) => u.startsWith('https://www.imsoft.io')) ??
    urls[0] ??
    null
  );
}

function pct(actual: number, base: number): number | null {
  return base === 0 ? null : Math.round(((actual - base) / base) * 100);
}

export function deltaVsBaseline(actual: Totals) {
  const base = BASELINE.performance28d;
  return {
    clicks: { actual: actual.clicks, base: base.clicks, pct: pct(actual.clicks, base.clicks) },
    impressions: {
      actual: actual.impressions,
      base: base.impressions,
      pct: pct(actual.impressions, base.impressions),
    },
    position: {
      actual: actual.position,
      base: base.position,
      diff: Number((actual.position - base.position).toFixed(1)),
    },
  };
}

/**
 * Daily average of impressions before, during and after the outage. "After" stays
 * null until GSC delivers days after September 8 (it lags ~2 days
 * behind).
 */
export function outageImpact(daily: DateRow[]) {
  const { from: from, to: to } = BASELINE.outage;
  const before = daily.filter((r) => r.date < from && r.date >= '2026-08-26');
  const during = daily.filter((r) => r.date >= from && r.date <= to);
  const after = daily.filter((r) => r.date > to);
  const average = (rows: DateRow[]): number | null =>
    rows.length === 0
      ? null
      : Number((rows.reduce((s, r) => s + r.impressions, 0) / rows.length).toFixed(1));
  return {
    before: average(before),
    during: average(during),
    after: average(after),
    days: { before: before.length, during: during.length, after: after.length },
  };
}

/**
 * Groups the inspections by status and separates the URLs Google already recrawled
 * after the outage from those still on an earlier crawl (i.e. of the parking page).
 */
export function coverageSummary(rows: InspectionRow[]) {
  const cutoff = BASELINE.outage.recoveredAt;
  const byState: Record<string, number> = {};
  const crawledAfterOutage: string[] = [];
  const notCrawledAfterOutage: string[] = [];

  for (const r of rows) {
    byState[r.coverageState] = (byState[r.coverageState] ?? 0) + 1;
    if (r.lastCrawlTime && r.lastCrawlTime > cutoff) crawledAfterOutage.push(r.url);
    else notCrawledAfterOutage.push(r.url);
  }
  return { byState: byState, crawledAfterOutage: crawledAfterOutage, notCrawledAfterOutage: notCrawledAfterOutage };
}

export interface ReportInput {
  property: string;
  range: { start: string; end: string };
  totals: Totals;
  byClass: Record<QueryClass, ClassSummary>;
  commercial: QueryRow[];
  pages: PageRow[];
  impact: ReturnType<typeof outageImpact>;
  coverage: ReturnType<typeof coverageSummary>;
  inspections: InspectionRow[];
}

const fmtPct = (p: number | null): string => (p === null ? 'n/a' : `${p > 0 ? '+' : ''}${p}%`);
const shortPath = (url: string): string => url.replace(/^https?:\/\/www\.imsoft\.io/, '') || '/';

export function renderReport(i: ReportInput): string {
  const d = deltaVsBaseline(i.totals);
  const L: string[] = [];

  L.push(`SEARCH CONSOLE · ${i.property} · ${i.range.start} → ${i.range.end} (28 días)`);
  L.push('');
  L.push('RENDIMIENTO vs baseline del 27-ago');
  L.push(`  clics        ${d.clicks.actual}  (base ${d.clicks.base}, ${fmtPct(d.clicks.pct)})`);
  L.push(
    `  impresiones  ${d.impressions.actual}  (base ${d.impressions.base}, ${fmtPct(d.impressions.pct)})`,
  );
  L.push(`  CTR          ${(i.totals.ctr * 100).toFixed(1)}%`);
  L.push(
    `  posición     ${i.totals.position.toFixed(1)}  (base ${d.position.base}, ${d.position.diff > 0 ? '+' : ''}${d.position.diff})`,
  );
  L.push('');
  L.push('CONSULTAS por clase (clics / impresiones / nº consultas)');
  for (const c of ['commercial', 'brand', 'ims-collision'] as const) {
    const r = i.byClass[c];
    L.push(`  ${QUERY_CLASS_LABEL[c].padEnd(13)} ${r.clicks} / ${r.impressions} / ${r.queries}`);
  }
  L.push('');
  L.push('TOP consultas COMERCIALES (las que se pueden ganar)');
  if (i.commercial.length === 0) L.push('  (ninguna todavía)');
  for (const q of i.commercial.slice(0, 10)) {
    L.push(`  ${String(q.impressions).padStart(4)} impr · ${q.clicks} clic · pos ${q.position.toFixed(0)}  ${q.query}`);
  }
  L.push('');
  L.push('TOP páginas');
  for (const p of i.pages.slice(0, 10)) {
    L.push(`  ${String(p.impressions).padStart(4)} impr · ${p.clicks} clic · pos ${p.position.toFixed(0)}  ${shortPath(p.page)}`);
  }
  L.push('');
  L.push('CAÍDA DEL DOMINIO (2–8 sep): impresiones/día');
  const m = i.impact;
  L.push(`  antes   ${m.before ?? 'n/a'}  (${m.days.before} días)`);
  L.push(`  durante ${m.during ?? 'n/a'}  (${m.days.during} días)`);
  L.push(`  después ${m.after ?? 'n/a — GSC aún no entrega días posteriores'}  (${m.days.after} días)`);
  L.push('');
  L.push('INDEXACIÓN de las 10 URLs del lote 1');
  for (const [state, n] of Object.entries(i.coverage.byState)) L.push(`  ${n}  ${state}`);
  L.push(`  rastreadas después de la caída: ${i.coverage.crawledAfterOutage.length}/${i.inspections.length}`);
  for (const r of i.inspections) {
    const when = r.lastCrawlTime ? r.lastCrawlTime.slice(0, 16).replace('T', ' ') : 'nunca           ';
    L.push(`    ${when}  ${r.coverageState.padEnd(34)} ${shortPath(r.url)}`);
    if (r.googleCanonical && r.googleCanonical !== r.userCanonical) {
      L.push(`${' '.repeat(22)}→ Google eligió: ${r.googleCanonical}`);
    }
  }
  return L.join('\n');
}
