/**
 * Logica pura del reporte de Search Console. Sin E/S: todo lo que toca la API vive en
 * scripts/gsc-report.mjs, para que esto se pueda probar con vitest sin credenciales.
 *
 * El reporte compara contra dos baselines fijados antes de desplegar la auditoria de
 * agosto de 2026, y mide el efecto de la caida del dominio (2 al 8 de septiembre).
 */

export type QueryClass = 'marca' | 'colision-ims' | 'comercial';

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

export interface Totales {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export const BASELINE = {
  /** Informe de indexacion de GSC del 20-ago-2026, antes de desplegar nada. */
  indexacion: {
    fecha: '2026-08-20',
    indexadas: 42,
    sinIndexar: 266,
    descubiertaSinIndexar: 172,
    rastreadaSinIndexar: 34,
  },
  /** Rendimiento de 28 dias reportado por Brandon el 27-ago-2026. */
  rendimiento28d: {
    fecha: '2026-08-27',
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
  caida: { desde: '2026-09-02', hasta: '2026-09-08', recuperadoEn: '2026-09-08T16:30:00Z' },
} as const;

function normalizar(texto: string): string {
  return texto
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
  const q = normalizar(query);

  // Primero lo que se reconoce por como esta escrito con espacios o puntuacion: "im
  // software", "i soft", "i'm soft" e "i.soft" son gente buscando IMS u otra cosa, aunque
  // pegadas se parezcan a la marca.
  if (/\bims\b/.test(q) || /\bim software\b/.test(q) || /\bi'?m?[ .-]+soft/.test(q)) {
    return 'colision-ims';
  }

  // Sin puntuacion ni espacios: "im soft" y "imsoft" son la misma cosa.
  const pegado = q.replace(/[^a-z0-9]/g, '');
  if (pegado.includes('imsoft') || pegado.includes('imsof') || pegado.includes('insoft')) {
    return 'marca';
  }
  // Otras marcas ajenas que vinieron en los reportes reales: imsdatawise, imhosys, iosoft,
  // oisoft, inisoft, "oims software", "international micro systems" (lo que significa IMS).
  if (
    /^ims[a-z]*$/.test(pegado) ||
    /^imh[a-z]*$/.test(pegado) ||
    /^[a-z]{1,4}soft$/.test(pegado) ||
    /\boims\b/.test(q) ||
    /\bmicro ?systems?\b/.test(q) ||
    /\biomify\b/.test(q)
  ) {
    return 'colision-ims';
  }
  return 'comercial';
}

export interface ResumenClase {
  clicks: number;
  impressions: number;
  consultas: number;
}

export function summarizeQueries(rows: QueryRow[]): {
  porClase: Record<QueryClass, ResumenClase>;
  comerciales: QueryRow[];
} {
  const vacio = (): ResumenClase => ({ clicks: 0, impressions: 0, consultas: 0 });
  const porClase: Record<QueryClass, ResumenClase> = {
    marca: vacio(),
    'colision-ims': vacio(),
    comercial: vacio(),
  };
  const comerciales: QueryRow[] = [];

  for (const row of rows) {
    const clase = classifyQuery(row.query);
    porClase[clase].clicks += row.clicks;
    porClase[clase].impressions += row.impressions;
    porClase[clase].consultas += 1;
    if (clase === 'comercial') comerciales.push(row);
  }

  comerciales.sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks);
  return { porClase, comerciales: comerciales.slice(0, 15) };
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

export function deltaVsBaseline(actual: Totales) {
  const base = BASELINE.rendimiento28d;
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
  const { desde, hasta } = BASELINE.caida;
  const antes = daily.filter((r) => r.date < desde && r.date >= '2026-08-26');
  const durante = daily.filter((r) => r.date >= desde && r.date <= hasta);
  const despues = daily.filter((r) => r.date > hasta);
  const media = (rows: DateRow[]): number | null =>
    rows.length === 0
      ? null
      : Number((rows.reduce((s, r) => s + r.impressions, 0) / rows.length).toFixed(1));
  return {
    antes: media(antes),
    durante: media(durante),
    despues: media(despues),
    dias: { antes: antes.length, durante: durante.length, despues: despues.length },
  };
}

/**
 * Agrupa las inspecciones por estado y separa las URLs que Google ya volvio a rastrear
 * despues de la caida de las que siguen con un rastreo anterior (o sea, del parking).
 */
export function coverageSummary(rows: InspectionRow[]) {
  const corte = BASELINE.caida.recuperadoEn;
  const porEstado: Record<string, number> = {};
  const rastreadasTrasCaida: string[] = [];
  const sinRastrearTrasCaida: string[] = [];

  for (const r of rows) {
    porEstado[r.coverageState] = (porEstado[r.coverageState] ?? 0) + 1;
    if (r.lastCrawlTime && r.lastCrawlTime > corte) rastreadasTrasCaida.push(r.url);
    else sinRastrearTrasCaida.push(r.url);
  }
  return { porEstado, rastreadasTrasCaida, sinRastrearTrasCaida };
}

export interface ReportInput {
  propiedad: string;
  rango: { start: string; end: string };
  totales: Totales;
  porClase: Record<QueryClass, ResumenClase>;
  comerciales: QueryRow[];
  paginas: PageRow[];
  impacto: ReturnType<typeof outageImpact>;
  cobertura: ReturnType<typeof coverageSummary>;
  inspecciones: InspectionRow[];
}

const fmtPct = (p: number | null): string => (p === null ? 'n/a' : `${p > 0 ? '+' : ''}${p}%`);
const corto = (url: string): string => url.replace(/^https?:\/\/www\.imsoft\.io/, '') || '/';

export function renderReport(i: ReportInput): string {
  const d = deltaVsBaseline(i.totales);
  const L: string[] = [];

  L.push(`SEARCH CONSOLE · ${i.propiedad} · ${i.rango.start} → ${i.rango.end} (28 días)`);
  L.push('');
  L.push('RENDIMIENTO vs baseline del 27-ago');
  L.push(`  clics        ${d.clicks.actual}  (base ${d.clicks.base}, ${fmtPct(d.clicks.pct)})`);
  L.push(
    `  impresiones  ${d.impressions.actual}  (base ${d.impressions.base}, ${fmtPct(d.impressions.pct)})`,
  );
  L.push(`  CTR          ${(i.totales.ctr * 100).toFixed(1)}%`);
  L.push(
    `  posición     ${i.totales.position.toFixed(1)}  (base ${d.position.base}, ${d.position.diff > 0 ? '+' : ''}${d.position.diff})`,
  );
  L.push('');
  L.push('CONSULTAS por clase (clics / impresiones / nº consultas)');
  for (const c of ['comercial', 'marca', 'colision-ims'] as const) {
    const r = i.porClase[c];
    L.push(`  ${c.padEnd(13)} ${r.clicks} / ${r.impressions} / ${r.consultas}`);
  }
  L.push('');
  L.push('TOP consultas COMERCIALES (las que se pueden ganar)');
  if (i.comerciales.length === 0) L.push('  (ninguna todavía)');
  for (const q of i.comerciales.slice(0, 10)) {
    L.push(`  ${String(q.impressions).padStart(4)} impr · ${q.clicks} clic · pos ${q.position.toFixed(0)}  ${q.query}`);
  }
  L.push('');
  L.push('TOP páginas');
  for (const p of i.paginas.slice(0, 10)) {
    L.push(`  ${String(p.impressions).padStart(4)} impr · ${p.clicks} clic · pos ${p.position.toFixed(0)}  ${corto(p.page)}`);
  }
  L.push('');
  L.push('CAÍDA DEL DOMINIO (2–8 sep): impresiones/día');
  const m = i.impacto;
  L.push(`  antes   ${m.antes ?? 'n/a'}  (${m.dias.antes} días)`);
  L.push(`  durante ${m.durante ?? 'n/a'}  (${m.dias.durante} días)`);
  L.push(`  después ${m.despues ?? 'n/a — GSC aún no entrega días posteriores'}  (${m.dias.despues} días)`);
  L.push('');
  L.push('INDEXACIÓN de las 10 URLs del lote 1');
  for (const [estado, n] of Object.entries(i.cobertura.porEstado)) L.push(`  ${n}  ${estado}`);
  L.push(`  rastreadas después de la caída: ${i.cobertura.rastreadasTrasCaida.length}/${i.inspecciones.length}`);
  for (const r of i.inspecciones) {
    const cuando = r.lastCrawlTime ? r.lastCrawlTime.slice(0, 16).replace('T', ' ') : 'nunca           ';
    L.push(`    ${cuando}  ${r.coverageState.padEnd(34)} ${corto(r.url)}`);
    if (r.googleCanonical && r.googleCanonical !== r.userCanonical) {
      L.push(`${' '.repeat(22)}→ Google eligió: ${r.googleCanonical}`);
    }
  }
  return L.join('\n');
}
