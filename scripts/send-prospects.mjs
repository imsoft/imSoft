#!/usr/bin/env node
/**
 * Sends prospecting (cold outreach) emails with Resend.
 *
 * Reads a CSV list, personalizes an HTML template per row (placeholders
 * {{first_name}}, {{company}}, etc.) and sends an individual email to each
 * prospect. Keeps a log of sent emails so they are not repeated when the
 * script runs again.
 *
 * Environment variables (from .env):
 *   RESEND_API_KEY     — Resend API key (required)
 *   RESEND_FROM_EMAIL  — verified sender, e.g. contacto@imsoft.io
 *
 * Usage:
 *   node --env-file=.env scripts/send-prospects.mjs \
 *     --list scripts/prospects/prospects.csv \
 *     --template scripts/prospects/template.html \
 *     --subject "Una idea para optimizar el sitio de {{company}}" \
 *     --dry-run
 *
 * Flags:
 *   --list <path>          Prospects CSV (required). Needs "first_name" and "email" columns
 *                          (the old Spanish headers, e.g. "nombre", "empresa", still work).
 *   --template <path>      HTML template (default: scripts/prospects/template.html)
 *   --subject <text>       Subject. Accepts {{...}} placeholders (default below).
 *   --from <email>         Sender (default: RESEND_FROM_EMAIL or contacto@imsoft.io)
 *   --from-name <text>     Sender name (default: "imSoft")
 *   --reply-to <email>     Reply-To (default: same as --from)
 *   --delay <ms>           Pause between sends (default: 700ms, ~1.4 emails/sec)
 *   --limit <n>            Send at most N emails in this run
 *   --log <path>           Sent log (default: scripts/prospects/sent-log.csv)
 *   --default-name <t>     Text when the row has no name (default: ""; old flag --default-nombre also works)
 *   --dry-run              Sends nothing: validates the list and writes a preview.
 *   --resend               Ignores the log and resends even if already sent.
 *
 * Templates and subjects may use the English column names or the old Spanish ones
 * ({{nombre}}, {{empresa}}...): both are filled in.
 */

import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Resend } from 'resend';

// ---------- Argument parsing ----------
function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      args[key] = true; // boolean flag
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

// ---------- CRM sync ----------
// A prospect we already wrote to is no longer "no contact". It only moves from
// there: if it was already in negotiation, one more email does not send it back.
const CRM_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CRM_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CRM_ON = Boolean(CRM_URL && CRM_KEY) && !args['no-crm'];

async function crmRecordSend(email, subject, html) {
  if (!CRM_ON) return null;
  const headers = {
    apikey: CRM_KEY,
    Authorization: `Bearer ${CRM_KEY}`,
    'Content-Type': 'application/json',
  };
  try {
    const filter = `email=eq.${encodeURIComponent(email.toLowerCase())}`;
    const r = await fetch(`${CRM_URL}/rest/v1/contacts?${filter}&select=id,status`, { headers });
    const [contact] = await r.json();
    if (!contact) return 'not-in-crm';

    await fetch(`${CRM_URL}/rest/v1/contact_emails`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        contact_id: contact.id,
        status: contact.status,
        subject,
        body: html,
      }),
    });

    if (contact.status !== 'no_contact') return 'unchanged';

    const u = await fetch(`${CRM_URL}/rest/v1/contacts?${filter}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'qualification' }),
    });
    return u.ok ? 'to-qualification' : 'error';
  } catch (e) {
    console.log(`     ⚠️  CRM: ${e.message}`);
    return 'error';
  }
}



const LIST = args.list;
const TEMPLATE = args.template || 'scripts/prospects/template.html';
const SUBJECT = args.subject || 'Una idea para potenciar el software de {{company}}';
const FROM_EMAIL = args.from || process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io';
const FROM_NAME = args['from-name'] || 'imSoft';
const REPLY_TO = args['reply-to'] || FROM_EMAIL;
const DELAY = Number(args.delay ?? 700);
const LIMIT = args.limit ? Number(args.limit) : Infinity;
const LOG = args.log || 'scripts/prospects/sent-log.csv';
const DEFAULT_NAME = args['default-name'] || args['default-nombre'] || '';
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

// ---------- Minimal CSV (supports quotes and commas inside quotes) ----------
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
      else if (c === '\r') { /* ignored */ }
      else field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ''));
}

// Old Spanish CSV headers -> English keys. Same table as CSV_HEADER_ALIASES in
// src/lib/import-contacts.ts (copied: this script runs as plain JS).
const CSV_HEADER_ALIASES = {
  nombre: 'first_name', apellido: 'last_name', empresa: 'company', puesto: 'job_title', cargo: 'job_title',
  telefono: 'phone', 'teléfono': 'phone', sitio: 'website', gancho: 'hook', segmento: 'segment', zona: 'zone',
  asunto: 'subject', saludo: 'greeting', correo: 'email',
};

function readCsvAsObjects(path) {
  const rows = parseCsv(readFileSync(path, 'utf8'));
  if (rows.length === 0) return [];
  const headers = rows[0].map((h) => h.trim().toLowerCase()).map((h) => CSV_HEADER_ALIASES[h] ?? h);
  return rows.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
    return obj;
  });
}

// Templates written with the old placeholders ({{nombre}}, {{empresa}}...) keep working.
function withLegacyKeys(row) {
  const out = { ...row };
  for (const [legacy, key] of Object.entries(CSV_HEADER_ALIASES)) {
    if (key in row && !(legacy in out)) out[legacy] = row[key];
  }
  return out;
}

// ---------- Template rendering ----------
function render(tpl, data) {
  const values = withLegacyKeys(data);
  return tpl.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (_, key) => {
    const k = key.toLowerCase();
    return values[k] ?? '';
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------- Sent log ----------
function loadSent(path) {
  const set = new Set();
  if (!existsSync(path)) return set;
  const rows = parseCsv(readFileSync(path, 'utf8'));
  // format: timestamp,email,status,id
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

  // Validation + local dedup within the list
  const seen = new Set();
  const queue = [];
  const skipped = { invalid: [], duplicate: [], already: [], noName: [] };

  for (const p of prospects) {
    const email = (p.email || '').toLowerCase();
    if (!EMAIL_RE.test(email)) { skipped.invalid.push(p.email); continue; }
    if (seen.has(email)) { skipped.duplicate.push(email); continue; }
    seen.add(email);
    if (alreadySent.has(email)) { skipped.already.push(email); continue; }
    if (!p.first_name) { p.first_name = DEFAULT_NAME; skipped.noName.push(email); }
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
  if (skipped.noName.length) console.log(`  ⚠️  Sin nombre (${skipped.noName.length}): se usará "${DEFAULT_NAME}" → revisa que el saludo lea bien.`);
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
    toSend.forEach((p, i) => console.log(`     ${i + 1}. ${p.first_name || '(sin nombre)'} <${p.email}>`));
    console.log('\n   Cuando todo se vea bien, vuelve a correr SIN --dry-run.\n');
    return;
  }

  ensureLog(LOG);
  const resend = new Resend(process.env.RESEND_API_KEY);

  // List-Unsubscribe via mailto: improves deliverability and offers an opt-out.
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
        const crm = await crmRecordSend(p.email, subject, html);
        const note = crm === 'to-qualification' ? ' · CRM: → Prospección'
          : crm === 'not-in-crm' ? ' · no está en el CRM'
          : crm === 'unchanged' ? ' · CRM: estado sin cambio'
          : '';
        console.log(`  ✓ ${label} — id ${data?.id ?? ''}${note}`);
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
