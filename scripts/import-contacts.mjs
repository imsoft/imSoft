#!/usr/bin/env node
/**
 * Bulk import of prospects into the CRM `contacts` table.
 *
 * Reads a CSV, maps it with src/lib/import-contacts.ts and inserts it into Supabase.
 * Since `contacts.email` is UNIQUE, the load is idempotent: running it twice
 * duplicates nothing. By default existing contacts are left untouched.
 *
 * Environment variables (from .env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Usage:
 *   node --env-file=.env --experimental-strip-types scripts/import-contacts.mjs \
 *     --list scripts/prospects/prospects-logistics-gdl.csv \
 *     --source "Prospeccion en frio - logistica GDL" \
 *     --tag logistics-gdl \
 *     --dry-run
 *
 * Flags:
 *   --list <path>      CSV to import (required). Needs an "email" column. Headers may be
 *                      English (first_name, company, hook, segment...) or the old Spanish
 *                      ones (nombre, empresa, gancho, segmento...).
 *   --source <text>    Value for the `source` column. Recommended: identifies the campaign.
 *   --tag <text>       Tag for every row. Can be repeated.
 *   --type <type>      contact_type: lead | prospect | customer | partner (default: prospect)
 *   --status <status>  initial status (default: no_contact, the first kanban column)
 *   --update           Overwrites contacts that already exist with that email.
 *                      CAREFUL: overwrites notes and data edited by hand in the CRM.
 *   --dry-run          Writes nothing: validates the CSV and shows what would be inserted.
 */

import { readFileSync } from 'node:fs'
import { mapRowsToContacts, parseCsv } from '../src/lib/import-contacts.ts'

function parseArgs(argv) {
  const args = { tag: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const key = a.slice(2)
    const next = argv[i + 1]
    if (next === undefined || next.startsWith('--')) {
      args[key] = true
    } else if (key === 'tag') {
      args.tag.push(next)
      i++
    } else {
      args[key] = next
      i++
    }
  }
  return args
}

function fail(message) {
  console.error(`\n  ✖ ${message}\n`)
  process.exit(1)
}

const args = parseArgs(process.argv.slice(2))

if (!args.list) fail('Falta --list <ruta al CSV>. Usa --help para ver las opciones.')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!args['dry-run'] && (!SUPABASE_URL || !SERVICE_ROLE_KEY)) {
  fail('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. Corre con --env-file=.env')
}

let csvText
try {
  csvText = readFileSync(args.list, 'utf8')
} catch {
  fail(`No pude leer el archivo: ${args.list}`)
}

const rows = parseCsv(csvText)
if (rows.length === 0) fail('El CSV no tiene filas.')
if (!('email' in rows[0])) fail('El CSV debe tener una columna "email".')

const { contacts, skipped } = mapRowsToContacts(rows, {
  source: typeof args.source === 'string' ? args.source : null,
  contactType: typeof args.type === 'string' ? args.type : 'prospect',
  status: typeof args.status === 'string' ? args.status : 'no_contact',
  tags: args.tag,
})

console.log(`\n  Archivo:      ${args.list}`)
console.log(`  Filas leidas: ${rows.length}`)
console.log(`  A importar:   ${contacts.length}`)

if (skipped.noContact.length) {
  console.log(`\n  ⚠️  Sin ningun dato de contacto (${skipped.noContact.length}): ni correo, ni telefono, ni Instagram.`)
  for (const row of skipped.noContact) {
    console.log(`       · ${row.company || '(sin empresa)'}`)
  }
}
if (skipped.invalidEmail.length) {
  console.log(`\n  ⚠️  Correo invalido (${skipped.invalidEmail.length}): ${skipped.invalidEmail.join(', ')}`)
}
if (skipped.duplicate.length) {
  console.log(`\n  ⚠️  Repetidos en el CSV (${skipped.duplicate.length}): ${skipped.duplicate.join(', ')}`)
}

if (contacts.length === 0) fail('No quedo ninguna fila por importar.')

if (args['dry-run']) {
  console.log('\n  🧪 DRY RUN — no se escribio nada.\n')
  console.log('  Primer registro:')
  console.log(JSON.stringify(contacts[0], null, 2).split('\n').map((l) => `     ${l}`).join('\n'))
  console.log(`\n  Se insertarian ${contacts.length} contactos como "${contacts[0].contact_type}" en estado "${contacts[0].status}".`)
  console.log('\n  Cuando se vea bien, vuelve a correr SIN --dry-run.\n')
  process.exit(0)
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
}

// `resolution=ignore-duplicates` leaves what already exists in the CRM untouched; with
// --update it is overwritten with the CSV.
const resolution = args.update ? 'merge-duplicates' : 'ignore-duplicates'

const withEmail = contacts.filter((c) => c.email)
const withoutEmail = contacts.filter((c) => !c.email)

let inserted = 0
let alreadyExisted = 0

// With email: the UNIQUE on email makes the load idempotent.
if (withEmail.length > 0) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/contacts?on_conflict=email`, {
    method: 'POST',
    headers: { ...headers, Prefer: `resolution=${resolution},return=representation` },
    body: JSON.stringify(withEmail),
  })
  if (!r.ok) fail(`Supabase respondio ${r.status}: ${await r.text()}`)
  const insertedRows = await r.json()
  inserted += insertedRows.length
  alreadyExisted += withEmail.length - insertedRows.length
}

// Without email there is no unique key to upsert on, so we look it up by
// company before inserting. Slower, but avoids duplicates on re-runs.
for (const contact of withoutEmail) {
  if (contact.company) {
    const filter = `company=eq.${encodeURIComponent(contact.company)}&email=is.null`
    const existing = await (await fetch(`${SUPABASE_URL}/rest/v1/contacts?${filter}&select=id`, { headers })).json()
    if (existing[0]) {
      alreadyExisted++
      if (!args.update) continue
      const u = await fetch(`${SUPABASE_URL}/rest/v1/contacts?id=eq.${existing[0].id}`, {
        method: 'PATCH', headers, body: JSON.stringify(contact),
      })
      if (!u.ok) console.error(`     ✖ ${contact.company}: ${await u.text()}`)
      continue
    }
  }

  const r = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify([contact]),
  })
  if (r.ok) inserted++
  else console.error(`     ✖ ${contact.company || '(sin empresa)'}: ${await r.text()}`)
}

console.log(`\n  ✅ Insertados: ${inserted}`)
if (withoutEmail.length > 0) console.log(`     (${withoutEmail.length} sin correo, identificados por empresa)`)
if (alreadyExisted > 0) {
  console.log(`  ↩️  Ya existian: ${alreadyExisted}${args.update ? ' (actualizados)' : ' (sin tocar)'}`)
}
console.log('\n  Revisalos en /dashboard/admin/crm/contacts\n')
