#!/usr/bin/env node
/**
 * Renderiza los correos de una campana de prospeccion.
 *
 *   --out         escribe `correos.md` junto a la lista, con los correos ya
 *                 personalizados (para revisarlos antes de enviar).
 *   --sync-crm    guarda cada correo en las notas de su contacto, para poder
 *                 copiarlo y pegarlo desde la ficha del CRM.
 *
 * El archivo `correos.md` y el CSV llevan nombre, empresa y correo de personas
 * reales: los dos estan en .gitignore y no deben subirse al repo.
 *
 * Uso:
 *   pnpm prospects:emails --list scripts/prospects/logistica-gdl/prospects.csv --out
 *   pnpm prospects:emails --list scripts/prospects/logistica-gdl/prospects.csv --sync-crm --dry-run
 *
 * Flags:
 *   --list <ruta>      CSV de la campana (requerido).
 *   --template <ruta>  Plantilla HTML (default: template.html junto al CSV).
 *   --out              Genera correos.md junto al CSV.
 *   --sync-crm         Escribe el correo en `contacts.notes` de cada prospecto.
 *   --keep-notes       Con --sync-crm, conserva la nota actual debajo del correo.
 *   --dry-run          No escribe nada: dice que haria.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parseCsv } from '../src/lib/import-contacts.ts'
import { renderPlainEmail, missingFields } from '../src/lib/prospect-email.ts'

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

let rows, template
try { rows = parseCsv(readFileSync(args.list, 'utf8')) } catch { fail(`No pude leer ${args.list}`) }
try { template = readFileSync(templatePath, 'utf8') } catch { fail(`No pude leer ${templatePath}`) }

if (rows.length === 0) fail('El CSV no tiene filas.')

// Un placeholder sin datos saldria literal en el correo del prospecto.
const incompletas = rows
  .map((row) => ({ email: row.email, faltan: missingFields(template, row) }))
  .filter((r) => r.faltan.length > 0)

if (incompletas.length > 0) {
  console.error('\n  ✖ Hay filas sin todos los campos que usa la plantilla:')
  for (const r of incompletas) console.error(`     · ${r.email}: falta ${r.faltan.join(', ')}`)
  fail('Corrige el CSV antes de continuar.')
}

console.log(`\n  Lista:     ${args.list}`)
console.log(`  Plantilla: ${templatePath}`)
console.log(`  Prospectos: ${rows.length}`)

if (args.out) {
  const salida = [
    '# Correos de la campana, tal como saldrian',
    '',
    `Generado con \`pnpm prospects:emails --list ${args.list} --out\`. **No lo edites a mano:**`,
    'los cambios van en el CSV o en la plantilla.',
    '',
    'Contiene datos personales de los prospectos. No lo subas al repo.',
    '',
  ]

  rows.forEach((row, i) => {
    const { subject, body } = renderPlainEmail(template, row)
    salida.push(`\n---\n\n## ${i + 1}. ${row.empresa || row.email}\n`)
    salida.push(`**Para:** \`${row.email}\`  `)
    salida.push(`**Asunto:** ${subject}\n`)
    salida.push('```')
    salida.push(body)
    salida.push('```')
  })

  const destino = join(dir, 'correos.md')
  if (args['dry-run']) console.log(`\n  🧪 DRY RUN — se escribiria ${destino}`)
  else {
    writeFileSync(destino, salida.join('\n'))
    console.log(`\n  ✅ ${destino}`)
  }
}

if (args['sync-crm']) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!SUPABASE_URL || !KEY) fail('Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.')

  const headers = { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
  let ok = 0
  const sinContacto = []

  for (const row of rows) {
    const filtro = `email=eq.${encodeURIComponent(row.email.toLowerCase())}`
    const previos = await (await fetch(`${SUPABASE_URL}/rest/v1/contacts?${filtro}&select=id,notes`, { headers })).json()

    if (!previos[0]) { sinContacto.push(row.email); continue }

    const { text } = renderPlainEmail(template, row)
    const notes = args['keep-notes'] && previos[0].notes
      ? `${text}\n\n———\nNotas previas:\n${previos[0].notes}`
      : text

    if (args['dry-run']) { ok++; continue }

    const r = await fetch(`${SUPABASE_URL}/rest/v1/contacts?${filtro}`, {
      method: 'PATCH', headers, body: JSON.stringify({ notes }),
    })
    if (r.ok) ok++
    else console.error(`     ✖ ${row.email}: ${await r.text()}`)
  }

  console.log(args['dry-run'] ? `\n  🧪 DRY RUN — se actualizarian ${ok} notas` : `\n  ✅ Notas actualizadas: ${ok}`)
  if (sinContacto.length) {
    console.log(`  ⚠️  Sin contacto en el CRM (${sinContacto.length}): ${sinContacto.join(', ')}`)
    console.log('     Importalos primero con pnpm crm:import')
  }
}

console.log()
