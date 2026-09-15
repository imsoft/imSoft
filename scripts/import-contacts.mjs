#!/usr/bin/env node
/**
 * Importacion masiva de prospectos a la tabla `contacts` del CRM.
 *
 * Lee un CSV, lo mapea con src/lib/import-contacts.ts y lo inserta en Supabase.
 * Como `contacts.email` es UNIQUE, la carga es idempotente: correrlo dos veces
 * no duplica nada. Por default los que ya existen se dejan intactos.
 *
 * Variables de entorno (de .env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Uso:
 *   node --env-file=.env --experimental-strip-types scripts/import-contacts.mjs \
 *     --list scripts/prospects/prospects-logistica-gdl.csv \
 *     --source "Prospeccion en frio - logistica GDL" \
 *     --tag logistica-gdl \
 *     --dry-run
 *
 * Flags:
 *   --list <ruta>      CSV a importar (requerido). Necesita columna "email".
 *   --source <texto>   Valor para la columna `source`. Recomendado: identifica la campana.
 *   --tag <texto>      Etiqueta para todas las filas. Se puede repetir.
 *   --type <tipo>      contact_type: lead | prospect | customer | partner (default: prospect)
 *   --status <estado>  status inicial (default: no_contact, la primera columna del kanban)
 *   --update           Sobreescribe los contactos que ya existan con ese correo.
 *                      CUIDADO: pisa notas y datos editados a mano en el CRM.
 *   --dry-run          No escribe nada: valida el CSV y muestra que se insertaria.
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
    console.log(`       · ${row.empresa || '(sin empresa)'}`)
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

// `resolution=ignore-duplicates` deja intacto lo que ya existe en el CRM; con
// --update se pisa con lo del CSV.
const resolution = args.update ? 'merge-duplicates' : 'ignore-duplicates'

const conCorreo = contacts.filter((c) => c.email)
const sinCorreo = contacts.filter((c) => !c.email)

let insertados = 0
let yaExistian = 0

// Con correo: el UNIQUE de email hace la carga idempotente.
if (conCorreo.length > 0) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/contacts?on_conflict=email`, {
    method: 'POST',
    headers: { ...headers, Prefer: `resolution=${resolution},return=representation` },
    body: JSON.stringify(conCorreo),
  })
  if (!r.ok) fail(`Supabase respondio ${r.status}: ${await r.text()}`)
  const filas = await r.json()
  insertados += filas.length
  yaExistian += conCorreo.length - filas.length
}

// Sin correo no hay clave unica sobre la cual hacer upsert, asi que se busca por
// empresa antes de insertar. Es mas lento, pero evita duplicar al reejecutar.
for (const contacto of sinCorreo) {
  if (contacto.company) {
    const filtro = `company=eq.${encodeURIComponent(contacto.company)}&email=is.null`
    const previo = await (await fetch(`${SUPABASE_URL}/rest/v1/contacts?${filtro}&select=id`, { headers })).json()
    if (previo[0]) {
      yaExistian++
      if (!args.update) continue
      const u = await fetch(`${SUPABASE_URL}/rest/v1/contacts?id=eq.${previo[0].id}`, {
        method: 'PATCH', headers, body: JSON.stringify(contacto),
      })
      if (!u.ok) console.error(`     ✖ ${contacto.company}: ${await u.text()}`)
      continue
    }
  }

  const r = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify([contacto]),
  })
  if (r.ok) insertados++
  else console.error(`     ✖ ${contacto.company || '(sin empresa)'}: ${await r.text()}`)
}

console.log(`\n  ✅ Insertados: ${insertados}`)
if (sinCorreo.length > 0) console.log(`     (${sinCorreo.length} sin correo, identificados por empresa)`)
if (yaExistian > 0) {
  console.log(`  ↩️  Ya existian: ${yaExistian}${args.update ? ' (actualizados)' : ' (sin tocar)'}`)
}
console.log('\n  Revisalos en /dashboard/admin/crm/contacts\n')
