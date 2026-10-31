/**
 * Logica pura del reporte de Search Console. Sin E/S: todo lo que toca la API vive en
 * scripts/gsc-report.mjs, para que esto se pueda probar con vitest sin credenciales.
 *
 * El reporte compara contra dos baselines fijados antes de desplegar la auditoria de
 * agosto de 2026, y mide el efecto de la caida del dominio (2 al 8 de septiembre).
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
  /** Canonica que eligio Google. Solo dice algo cuando difiere de la declarada. */
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
  /** Informe de indexacion de GSC del 20-ago-2026, antes de desplegar nada. */
  indexing: {
    date: '2026-08-20',
    indexed: 42,
    notIndexed: 266,
    discoveredNotIndexed: 172,
    crawledNotIndexed: 34,
  },
  /** Rendimiento de 28 dias reportado por Brandon el 27-ago-2026. */
  performance28d: {
    date: '2026-08-27',
    clicks: 15,
    impressions: 497,
    ctr: 0.03,
    position: 39.4,
  },
  /**
   * El dominio estuvo apuntando a una pagina de parking en este rango. Volvio el 8 de
   * septiembre a media tarde (UTC), asi que un rastreo de ese dia puede ser de antes o
   * de despues: se corta por la hora, no por la fecha.
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
 * Casi todas las impresiones historicas venian de gente buscando "IMS", otra empresa.
 * Separar eso de la marca propia y de las consultas comerciales es lo que permite ver
 * si el SEO funciona: solo la clase `comercial` es trafico que se puede ganar.
 */
export function classifyQuery(query: string): QueryClass {
  const q = normalize(query);

  // Primero lo que se reconoce por como esta escrito con espacios o puntuacion: "im
  // software", "i soft", "i'm soft" e "i.soft" son gente buscando IMS u otra cosa, aunque
  // pegadas se parezcan a la marca.
  if (/\bims\b/.test(q) || /\bim software\b/.test(q) || /\bi'?m?[ .-]+soft/.test(q)) {
    return 'ims-collision';
  }

  // Sin puntuacion ni espacios: "im soft" y "imsoft" son la misma cosa.
  const compact = q.replace(/[^a-z0-9]/g, '');
  if (compact.includes('imsoft') || compact.includes('imsof') || compact.includes('insoft')) {
    return 'brand';
  }
  // Otras marcas ajenas que vinieron en los reportes reales: imsdatawise, imhosys, iosoft,
  // oisoft, inisoft, "oims software", "international micro systems" (lo que significa IMS).
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

/** De las propiedades visibles, la de dominio manda; si no, el prefijo www. */
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
 * Media diaria de impresiones antes, durante y despues de la caida. "Despues" queda
 * en null hasta que GSC entregue dias posteriores al 8 de septiembre (tiene ~2 dias
 * de retraso).
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
 * Agrupa las inspecciones por estado y separa las URLs que Google ya volvio a rastrear
 * despues de la caida de las que siguen con un rastreo anterior (o sea, del parking).
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
