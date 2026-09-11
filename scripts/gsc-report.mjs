/**
 * Reporte de Search Console contra los baselines de agosto de 2026.
 *
 *   node --experimental-strip-types scripts/gsc-report.mjs
 *
 * Necesita en .env: GSC_KEY_FILE (llave JSON de la cuenta de servicio, que vive FUERA
 * del repo) y GSC_PROPERTY (p. ej. sc-domain:imsoft.io). Solo lee: la cuenta tiene
 * permiso restringido en GSC. "Solicitar indexacion" no tiene API para paginas
 * normales, asi que eso sigue siendo manual.
 *
 * Toda la logica esta en src/lib/gsc-report.ts, cubierta por vitest; aqui solo hay
 * E/S. Guarda un snapshot JSON en ~/.config/imsoft/gsc-snapshots/<fecha>.json, fuera
 * del repo porque son datos del negocio, para comparar en el futuro.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';
import { LANDING_INDUSTRIES } from '../src/config/landing-pages-index.ts';
import {
  coverageSummary,
  outageImpact,
  pickProperty,
  renderReport,
  summarizeQueries,
} from '../src/lib/gsc-report.ts';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://www.imsoft.io';

/**
 * Lector minimo de .env. Los scripts del repo se lanzan con las variables exportadas,
 * pero si faltan se leen de aqui para no depender de un "set -a" previo.
 */
function cargarEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const linea of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const fecha = (d) => d.toISOString().slice(0, 10);
const diasAtras = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
};

/** Las 10 URLs del lote 1 de reindexacion tras la caida del dominio. */
const LOTE1 = [
  `${SITE}/es`,
  `${SITE}/es/services`,
  `${SITE}/es/zapopan/paginas-web`,
  ...LANDING_INDUSTRIES.map((industria) => `${SITE}/es/guadalajara/${industria}`),
  `${SITE}/es/contact`,
  `${SITE}/es/about`,
];

async function main() {
  cargarEnv();

  const keyFile = process.env.GSC_KEY_FILE;
  if (!keyFile || !fs.existsSync(keyFile)) {
    throw new Error('Falta GSC_KEY_FILE en .env, o el archivo no existe.');
  }

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  const gsc = google.searchconsole({ version: 'v1', auth });

  let siteUrl = process.env.GSC_PROPERTY;
  if (!siteUrl) {
    const { data } = await gsc.sites.list();
    siteUrl = pickProperty(data.siteEntry ?? []);
    if (!siteUrl) throw new Error('La cuenta de servicio no ve ninguna propiedad en GSC.');
  }

  // GSC entrega datos con ~2 dias de retraso: la ventana de 28 dias termina anteayer.
  const end = fecha(diasAtras(2));
  const start = fecha(diasAtras(29));

  const consulta = async (dimensions, startDate, rowLimit = 500) => {
    const { data } = await gsc.searchanalytics.query({
      siteUrl,
      requestBody: { startDate, endDate: end, dimensions, rowLimit },
    });
    return data.rows ?? [];
  };

  const [totRows, qRows, pRows, dRows] = await Promise.all([
    consulta([], start, 1),
    consulta(['query'], start),
    consulta(['page'], start, 200),
    // Desde una semana antes de la caida, para tener "antes / durante / despues".
    consulta(['date'], '2026-08-26'),
  ]);

  const tot = totRows[0] ?? {};
  const totales = {
    clicks: tot.clicks ?? 0,
    impressions: tot.impressions ?? 0,
    ctr: tot.ctr ?? 0,
    position: tot.position ?? 0,
  };
  const fila = (r) => ({
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  });
  const queries = qRows.map((r) => ({ query: r.keys?.[0] ?? '', ...fila(r) }));
  const paginas = pRows.map((r) => ({ page: r.keys?.[0] ?? '', ...fila(r) }));
  const diario = dRows.map((r) => ({ date: r.keys?.[0] ?? '', ...fila(r) }));

  // La inspeccion de URL tiene cuota propia (2000/dia); 10 en serie va sobrado.
  const inspecciones = [];
  for (const url of LOTE1) {
    try {
      const { data } = await gsc.urlInspection.index.inspect({
        requestBody: { inspectionUrl: url, siteUrl },
      });
      const s = data.inspectionResult?.indexStatusResult ?? {};
      inspecciones.push({
        url,
        verdict: s.verdict ?? 'UNKNOWN',
        coverageState: s.coverageState ?? 'sin dato',
        lastCrawlTime: s.lastCrawlTime ?? null,
        googleCanonical: s.googleCanonical ?? null,
        userCanonical: s.userCanonical ?? null,
      });
    } catch (err) {
      const motivo = String(err?.message ?? err).split('\n')[0].slice(0, 60);
      inspecciones.push({ url, verdict: 'ERROR', coverageState: `error: ${motivo}`, lastCrawlTime: null });
    }
  }

  const { porClase, comerciales } = summarizeQueries(queries);
  const report = {
    propiedad: siteUrl,
    rango: { start, end },
    totales,
    porClase,
    comerciales,
    paginas,
    impacto: outageImpact(diario),
    cobertura: coverageSummary(inspecciones),
    inspecciones,
  };

  console.log(renderReport(report));

  const dir = path.join(os.homedir(), '.config', 'imsoft', 'gsc-snapshots');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${fecha(new Date())}.json`);
  fs.writeFileSync(
    out,
    JSON.stringify({ generadoEn: new Date().toISOString(), ...report, queries, diario }, null, 2),
  );
  console.log(`\nsnapshot: ${out}`);
}

main().catch((err) => {
  console.error('ERROR:', err?.message ?? err);
  process.exit(1);
});
