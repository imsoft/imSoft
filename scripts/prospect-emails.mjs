#!/usr/bin/env node
/**
 * Renders the emails of a prospecting campaign.
 *
 *   --out         writes `emails.md` next to the list, with the emails already
 *                 personalized (to review them before sending).
 *   --sync-crm    stores each email in its contact's notes, so it can be
 *                 copied and pasted from the CRM contact page.
 *
 * `emails.md` and the CSV hold names, companies and emails of real people:
 * both are in .gitignore and must not be pushed to the repo.
 *
 * Usage:
 *   pnpm prospects:emails --list scripts/prospects/logistics-gdl/prospects.csv --out
 *   pnpm prospects:emails --list scripts/prospects/logistics-gdl/prospects.csv --sync-crm --dry-run
 *
 * Flags:
 *   --list <path>      Campaign CSV (required). English headers (first_name, company,
 *                      hook, subject...) or the old Spanish ones (nombre, empresa...).
 *   --template <path>  HTML template (default: template.html next to the CSV). Its
 *                      {{placeholders}} may use the English or the old Spanish column names.
 *   --out              Writes emails.md next to the CSV.
 *   --sync-crm         Writes the email into each prospect's `contacts.notes`.
 *   --message-column   Uses that CSV column as an already-written message instead of
 *                      rendering the template. For WhatsApp campaigns, where each
 *                      message is different and there is no shared template.
 *   --keep-notes       With --sync-crm, keeps the current note below the email.
 *   --dry-run          Writes nothing: says what it would do.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { CSV_HEADER_ALIASES, parseCsv } from '../src/lib/import-contacts.ts'
import {
  renderPlainEmail,
  missingFields,
  renderTemplate,
  SUBJECT_FIELD,
  HTML_FIELD,
} from '../src/lib/prospect-email.ts'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) args[key] = true
    else { args[key] = next; i++ }
  }
  return args
}

function fail(msg) {
  console.error(`\n  ✖ ${msg}\n`)
  process.exit(1)
}

const args = parseArgs(process.argv.slice(2))
if (!args.list) fail('Falta --list <ruta al CSV>.')
if (!args.out && !args['sync-crm']) fail('Elige --out, --sync-crm, o ambos.')

const dir = dirname(args.list)
const templatePath = typeof args.template === 'string' ? args.template : join(dir, 'template.html')

const messageColumn = typeof args['message-column'] === 'string' ? args['message-column'] : null

// parseCsv turns old Spanish headers into English keys; templates written with the old
// placeholders ({{nombre}}, {{gancho}}, {{asunto}}...) still get their values.
function withLegacyKeys(row) {
  const out = { ...row }
  for (const [legacy, key] of Object.entries(CSV_HEADER_ALIASES)) {
    if (key in row && !(legacy in out)) out[legacy] = row[key]
  }
  return out
}

let rows, template
try { rows = parseCsv(readFileSync(args.list, 'utf8')).map(withLegacyKeys) } catch { fail(`No pude leer ${args.list}`) }
if (!messageColumn) {
  try { template = readFileSync(templatePath, 'utf8') } catch { fail(`No pude leer ${templatePath}`) }
}

if (rows.length === 0) fail('El CSV no tiene filas.')

// The message comes already written per row: there is no template to render.
function content(row) {
  if (messageColumn) {
    const text = (row[messageColumn] || '').trim()
    return { subject: (row.subject || '').trim(), body: text, text }
  }
  return renderPlainEmail(template, row)
}

if (messageColumn) {
  const empty = rows.filter((r) => !(r[messageColumn] || '').trim())
  if (empty.length > 0) {
    console.error(`\n  ✖ ${empty.length} filas sin "${messageColumn}": ${empty.map((r) => r.company || r.email).join(', ')}`)
    fail('Completa el CSV antes de continuar.')
  }
}

// A placeholder without data would show up literally in the prospect's email.
const incomplete = messageColumn ? [] : rows
  .map((row) => ({ email: row.email, missing: missingFields(template, row) }))
  .filter((r) => r.missing.length > 0)

if (incomplete.length > 0) {
  console.error('\n  ✖ Hay filas sin todos los campos que usa la plantilla:')
  for (const r of incomplete) console.error(`     · ${r.email}: falta ${r.missing.join(', ')}`)
  fail('Corrige el CSV antes de continuar.')
}

console.log(`\n  Lista:     ${args.list}`)
console.log(messageColumn ? `  Mensaje:   columna "${messageColumn}" del CSV` : `  Plantilla: ${templatePath}`)
console.log(`  Prospectos: ${rows.length}`)

if (args.out) {
  const output = [
    '# Correos de la campana, tal como saldrian',
    '',
    `Generado con \`pnpm prospects:emails --list ${args.list} --out\`. **No lo edites a mano:**`,
    'los cambios van en el CSV o en la plantilla.',
    '',
    'Contiene datos personales de los prospectos. No lo subas al repo.',
    '',
  ]

  rows.forEach((row, i) => {
    const { subject, body } = content(row)
    output.push(`\n---\n\n## ${i + 1}. ${row.company || row.email}\n`)
    output.push(`**Para:** \`${row.email}\`  `)
    if (subject) output.push(`**Asunto:** ${subject}\n`)
    output.push('```')
    output.push(body)
    output.push('```')
  })

  const destination = join(dir, 'emails.md')
  if (args['dry-run']) console.log(`\n  🧪 DRY RUN — se escribiria ${destination}`)
  else {
    writeFileSync(destination, output.join('\n'))
    console.log(`\n  ✅ ${destination}`)
  }
}

if (args['sync-crm']) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !KEY) fail('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.')

  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
  let ok = 0
  const notInCrm = []

  for (const row of rows) {
    // WhatsApp and Instagram prospects have no email: they are found by company,
    // which is how the importer created them.
    const filter = row.email
      ? `email=eq.${encodeURIComponent(row.email.toLowerCase())}`
      : `company=eq.${encodeURIComponent(row.company || '')}&email=is.null`
    const label = row.email || row.company || '(sin identificar)'

    if (!row.email && !row.company) { notInCrm.push(label); continue }

    const existing = await (await fetch(`${SUPABASE_URL}/rest/v1/contacts?${filter}&select=id,notes`, { headers })).json()

    if (!existing[0]) { notInCrm.push(label); continue }

    const { text } = content(row)
    const notes = args['keep-notes'] && existing[0].notes
      ? `${text}\n\n———\nNotas previas:\n${existing[0].notes}`
      : text

    if (args['dry-run']) { ok++; continue }

    const r = await fetch(`${SUPABASE_URL}/rest/v1/contacts?${filter}`, {
      method: 'PATCH', headers, body: JSON.stringify({ notes }),
    })
    if (!r.ok) { console.error(`     ✖ ${label}: ${await r.text()}`); continue }

    // The HTML goes separately so the send screen preloads it with its design;
    // Resend sends HTML, not the notes text.
    if (messageColumn) { ok++; continue }
    const fields = [
      { contact_id: existing[0].id, field_name: SUBJECT_FIELD, field_value: renderPlainEmail(template, row).subject },
      { contact_id: existing[0].id, field_name: HTML_FIELD, field_value: renderTemplate(template, row) },
    ]
    const c = await fetch(`${SUPABASE_URL}/rest/v1/contact_custom_fields?on_conflict=contact_id,field_name`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(fields),
    })
    if (c.ok) ok++
    else console.error(`     ✖ ${row.email} (campos): ${await c.text()}`)
  }

  console.log(args['dry-run'] ? `\n  🧪 DRY RUN — se actualizarian ${ok} notas` : `\n  ✅ Notas actualizadas: ${ok}`)
  if (notInCrm.length) {
    console.log(`  ⚠️  Sin contacto en el CRM (${notInCrm.length}): ${notInCrm.join(', ')}`)
    console.log('     Importalos primero con pnpm crm:import')
  }
}

console.log()
