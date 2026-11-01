/**
 * Search Console report against the August 2026 baselines.
 *
 *   node --experimental-strip-types scripts/gsc-report.mjs
 *
 * Needs in .env: GSC_KEY_FILE (service account JSON key, which lives OUTSIDE the
 * repo) and GSC_PROPERTY (e.g. sc-domain:imsoft.io). Read-only: the account has
 * restricted permission in GSC. "Request indexing" has no API for regular pages,
 * so that stays manual.
 *
 * All logic lives in src/lib/gsc-report.ts, covered by vitest; this file is only
 * I/O. It saves a JSON snapshot to ~/.config/imsoft/gsc-snapshots/<date>.json, outside
 * the repo because it is business data, for future comparison.
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
 * Minimal .env reader. Repo scripts are launched with the variables exported, but
 * if they are missing they are read from here so a prior "set -a" is not required.
 */
function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

const isoDate = (d) => d.toISOString().slice(0, 10);
const daysAgo = (n) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d;
};

/** The 10 URLs in reindexing batch 1 after the domain outage. */
const BATCH1 = [
  `${SITE}/es`,
  `${SITE}/es/services`,
  `${SITE}/es/zapopan/pages-web`,
  ...LANDING_INDUSTRIES.map((industry) => `${SITE}/es/guadalajara/${industry}`),
  `${SITE}/es/contact`,
  `${SITE}/es/about`,
];

async function main() {
  loadEnv();

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

  // GSC data lags ~2 days: the 28-day window ends the day before yesterday.
  const end = isoDate(daysAgo(2));
  const start = isoDate(daysAgo(29));

  const runQuery = async (dimensions, startDate, rowLimit = 500) => {
    const { data } = await gsc.searchanalytics.query({
      siteUrl,
      requestBody: { startDate, endDate: end, dimensions, rowLimit },
    });
    return data.rows ?? [];
  };

  const [totRows, qRows, pRows, dRows] = await Promise.all([
    runQuery([], start, 1),
    runQuery(['query'], start),
    runQuery(['page'], start, 200),
    // From one week before the outage, to get "before / during / after".
    runQuery(['date'], '2026-08-26'),
  ]);

  const tot = totRows[0] ?? {};
  const totals = {
    clicks: tot.clicks ?? 0,
    impressions: tot.impressions ?? 0,
    ctr: tot.ctr ?? 0,
    position: tot.position ?? 0,
  };
  const metrics = (r) => ({
    clicks: r.clicks ?? 0,
    impressions: r.impressions ?? 0,
    ctr: r.ctr ?? 0,
    position: r.position ?? 0,
  });
  const queries = qRows.map((r) => ({ query: r.keys?.[0] ?? '', ...metrics(r) }));
  const pages = pRows.map((r) => ({ page: r.keys?.[0] ?? '', ...metrics(r) }));
  const daily = dRows.map((r) => ({ date: r.keys?.[0] ?? '', ...metrics(r) }));

  // URL inspection has its own quota (2000/day); 10 in series is plenty.
  const inspections = [];
  for (const url of BATCH1) {
    try {
      const { data } = await gsc.urlInspection.index.inspect({
        requestBody: { inspectionUrl: url, siteUrl },
      });
      const s = data.inspectionResult?.indexStatusResult ?? {};
      inspections.push({
        url,
        verdict: s.verdict ?? 'UNKNOWN',
        coverageState: s.coverageState ?? 'sin dato',
        lastCrawlTime: s.lastCrawlTime ?? null,
        googleCanonical: s.googleCanonical ?? null,
        userCanonical: s.userCanonical ?? null,
      });
    } catch (err) {
      const reason = String(err?.message ?? err).split('\n')[0].slice(0, 60);
      inspections.push({ url, verdict: 'ERROR', coverageState: `error: ${reason}`, lastCrawlTime: null });
    }
  }

  const { byClass, commercial } = summarizeQueries(queries);
  const report = {
    property: siteUrl,
    range: { start, end },
    totals,
    byClass,
    commercial,
    pages,
    impact: outageImpact(daily),
    coverage: coverageSummary(inspections),
    inspections,
  };

  console.log(renderReport(report));

  const dir = path.join(os.homedir(), '.config', 'imsoft', 'gsc-snapshots');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${isoDate(new Date())}.json`);
  fs.writeFileSync(
    out,
    JSON.stringify({ generatedAt: new Date().toISOString(), ...report, queries, daily }, null, 2),
  );
  console.log(`\nsnapshot: ${out}`);
}

main().catch((err) => {
  console.error('ERROR:', err?.message ?? err);
  process.exit(1);
});
