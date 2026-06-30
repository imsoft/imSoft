#!/usr/bin/env node
/**
 * Envío de correos de prospección (cold outreach) con Resend.
 *
 * Lee una lista CSV, personaliza una plantilla HTML por cada fila
 * (placeholders {{nombre}}, {{empresa}}, etc.) y envía un correo individual
 * a cada prospecto. Lleva un registro de enviados para que no se repitan al
 * volver a correr el script.
 *
 * Variables de entorno (de .env):
 *   RESEND_API_KEY     — API key de Resend (requerida)
 *   RESEND_FROM_EMAIL  — remitente verificado, p.ej. contacto@imsoft.io
 *
 * Uso:
 *   node --env-file=.env scripts/send-prospects.mjs \
 *     --list scripts/prospects/prospects.csv \
 *     --template scripts/prospects/template.html \
 *     --subject "Una idea para optimizar el sitio de {{empresa}}" \
 *     --dry-run
 *
 * Flags:
 *   --list <ruta>          CSV de prospectos (requerido). Debe tener columnas "nombre" y "email".
 *   --template <ruta>      HTML de la plantilla (default: scripts/prospects/template.html)
 *   --subject <texto>      Asunto. Admite placeholders {{...}} (default abajo).
 *   --from <correo>        Remitente (default: RESEND_FROM_EMAIL o contacto@imsoft.io)
 *   --from-name <texto>    Nombre del remitente (default: "imSoft")
 *   --reply-to <correo>    Reply-To (default: igual que --from)
 *   --delay <ms>           Pausa entre envíos (default: 700ms, ~1.4 correos/seg)
 *   --limit <n>            Enviar como máximo N correos en esta corrida
 *   --log <ruta>           Registro de enviados (default: scripts/prospects/sent-log.csv)
 *   --default-nombre <t>   Texto si la fila no trae nombre (default: "")
 *   --dry-run              No envía nada: valida la lista y escribe una vista previa.
 *   --resend               Ignora el registro y reenvía aunque ya se haya enviado antes.
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Resend } from 'resend';

// ---------- Parseo de argumentos ----------
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true; // flag booleana
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

const LIST = args.list;
const TEMPLATE = args.template || 'scripts/prospects/template.html';
const SUBJECT = args.subject || 'Una idea para potenciar el software de {{empresa}}';
const FROM_EMAIL = args.from || process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io';
const FROM_NAME = args['from-name'] || 'imSoft';
const REPLY_TO = args['reply-to'] || FROM_EMAIL;
const DELAY = Number(args.delay ?? 700);
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const LOG = args.log || 'scripts/prospects/sent-log.csv';
const DEFAULT_NOMBRE = args['default-nombre'] || '';
const DRY_RUN = Boolean(args['dry-run']);
const FORCE_RESEND = Boolean(args.resend);

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!LIST) fail('Falta --list <ruta del CSV>. Ej: --list scripts/prospects/prospects.csv');
if (!existsSync(LIST)) fail(`No encuentro el CSV: ${LIST}`);
if (!existsSync(TEMPLATE)) fail(`No encuentro la plantilla: ${TEMPLATE}`);
if (!DRY_RUN && !process.env.RESEND_API_KEY) {
  fail('RESEND_API_KEY no está definida. Corre con: node --env-file=.env scripts/send-prospects.mjs ...');
}

// ---------- CSV mínimo (soporta comillas y comas dentro de comillas) ----------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* ignora */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

function readCsvAsObjects(path) {
  const rows = parseCsv(readFileSync(path, 'utf8'));
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
    return obj;
  });
}

// ---------- Render de plantilla ----------
function render(tpl, data) {
  return tpl.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, key) => {
    const k = key.toLowerCase();
    return data[k] ?? '';
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Registro de enviados ----------
function loadSent(path) {
  const set = new Set();
  if (!existsSync(path)) return set;
  const rows = parseCsv(readFileSync(path, 'utf8'));
  // formato: timestamp,email,status,id
  for (const r of rows.slice(1)) {
    const email = (r[1] ?? '').trim().toLowerCase();
    const status = (r[2] ?? '').trim();
    if (email && status === 'sent') set.add(email);
  }
  return set;
}

function ensureLog(path) {
  mkdirSync(dirname(path), { recursive: true });
  if (!existsSync(path)) writeFileSync(path, 'timestamp,email,status,id\n');
}

function logRow(path, email, status, id = '') {
  const safe = (v) => (`${v}`.includes(',') ? `"${v}"` : v);
  appendFileSync(path, `${new Date().toISOString()},${safe(email)},${status},${safe(id)}\n`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- Main ----------
async function main() {
  const template = readFileSync(TEMPLATE, 'utf8');
  const prospects = readCsvAsObjects(LIST);

  if (prospects.length === 0) fail('El CSV no tiene filas de datos.');
  if (!('email' in prospects[0])) fail('El CSV debe tener una columna "email".');

  const alreadySent = FORCE_RESEND ? new Set() : loadSent(LOG);

  // Validación + dedup local en la lista
  const seen = new Set();
  const queue = [];
  const skipped = { invalid: [], duplicate: [], already: [], noName: [] };

  for (const p of prospects) {
    const email = (p.email || '').toLowerCase();
    if (!EMAIL_RE.test(email)) { skipped.invalid.push(p.email); continue; }
    if (seen.has(email)) { skipped.duplicate.push(email); continue; }
    seen.add(email);
    if (alreadySent.has(email)) { skipped.already.push(email); continue; }
    if (!p.nombre) { p.nombre = DEFAULT_NOMBRE; skipped.noName.push(email); }
    queue.push(p);
  }

  const toSend = queue.slice(0, LIMIT);

  console.log('\n══════════════════════════════════════════════');
  console.log('  Envío de prospección — imSoft');
  console.log('══════════════════════════════════════════════');
  console.log(`  Lista:        ${LIST} (${prospects.length} filas)`);
  console.log(`  Plantilla:    ${TEMPLATE}`);
  console.log(`  Remitente:    ${FROM_NAME} <${FROM_EMAIL}>`);
  console.log(`  Reply-To:     ${REPLY_TO}`);
  console.log(`  Asunto:       ${SUBJECT}`);
  console.log(`  A enviar:     ${toSend.length}${toSend.length < queue.length ? ` (de ${queue.length} elegibles, limitado a ${LIMIT})` : ''}`);
  console.log(`  Ya enviados:  ${skipped.already.length}  ·  Duplicados: ${skipped.duplicate.length}  ·  Inválidos: ${skipped.invalid.length}`);
  if (skipped.noName.length) console.log(`  ⚠️  Sin nombre (${skipped.noName.length}): se usará "${DEFAULT_NOMBRE}" → revisa que el saludo lea bien.`);
  if (skipped.invalid.length) console.log(`  ⚠️  Correos inválidos omitidos: ${skipped.invalid.join(', ')}`);
  console.log('══════════════════════════════════════════════\n');

  if (toSend.length === 0) {
    console.log('No hay correos por enviar. ✅\n');
    return;
  }

  if (DRY_RUN) {
    const preview = render(template, toSend[0]);
    const previewSubject = render(SUBJECT, toSend[0]);
    const previewPath = 'scripts/prospects/preview.html';
    writeFileSync(previewPath, preview);
    console.log('🧪 DRY-RUN: no se envió ningún correo.');
    console.log(`   Vista previa del primer correo → ${previewPath} (ábrelo en el navegador)`);
    console.log(`   Asunto renderizado:  "${previewSubject}"`);
    console.log(`   Destinatario #1:     ${toSend[0].email}\n`);
    console.log('   Destinatarios que se enviarían:');
    toSend.forEach((p, i) => console.log(`     ${i + 1}. ${p.nombre || '(sin nombre)'} <${p.email}>`));
    console.log('\n   Cuando todo se vea bien, vuelve a correr SIN --dry-run.\n');
    return;
  }

  ensureLog(LOG);
  const resend = new Resend(process.env.RESEND_API_KEY);

  // List-Unsubscribe por mailto: mejora la entregabilidad y da opción de baja.
  const unsubHeaders = {
    'List-Unsubscribe': `<mailto:${FROM_EMAIL}?subject=BAJA>`,
  };

  let ok = 0;
  let errors = 0;

  for (let i = 0; i < toSend.length; i++) {
    const p = toSend[i];
    const html = render(template, p);
    const subject = render(SUBJECT, p);
    const label = `${i + 1}/${toSend.length} ${p.email}`;

    try {
      const { data, error } = await resend.emails.send({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: p.email,
        replyTo: REPLY_TO,
        subject,
        html,
        headers: unsubHeaders,
      });

      if (error) {
        errors++;
        const msg = error.message || JSON.stringify(error);
        console.log(`  ✖ ${label} — ${msg}`);
        logRow(LOG, p.email, 'error', msg.replace(/\s+/g, ' ').slice(0, 120));
      } else {
        ok++;
        console.log(`  ✓ ${label} — id ${data?.id ?? ''}`);
        logRow(LOG, p.email, 'sent', data?.id ?? '');
      }
    } catch (e) {
      errors++;
      console.log(`  ✖ ${label} — ${e.message}`);
      logRow(LOG, p.email, 'error', e.message.replace(/\s+/g, ' ').slice(0, 120));
    }

    if (i < toSend.length - 1) await sleep(DELAY);
  }

  console.log('\n══════════════════════════════════════════════');
  console.log(`  Enviados: ${ok}   ·   Errores: ${errors}`);
  console.log(`  Registro: ${LOG}`);
  console.log('══════════════════════════════════════════════\n');
}

main().catch((e) => fail(e.stack || e.message));
