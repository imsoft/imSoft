#!/usr/bin/env node
/**
 * Dumps the Supabase `public` schema to a versionable file.
 *
 * Reads the OpenAPI spec PostgREST serves at /rest/v1/, so it does NOT need the
 * Supabase CLI, linking the project, or the database password: the key already
 * in .env is enough.
 *
 * The generated file is the repo's reference for the real schema, because
 * several tables (contacts, deals, activities) were created with the loose .sql
 * files in scripts/ and never made it into supabase/migrations.
 *
 * It only writes table, column and type names of the `public` schema.
 * No data and no secrets.
 *
 * Usage:
 *   pnpm db:schema
 */

import { writeFileSync } from 'node:fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const OUT = process.argv.includes('--out')
  ? process.argv[process.argv.indexOf('--out') + 1]
  : 'supabase/schema-public.md'

if (!SUPABASE_URL || !KEY) {
  console.error('\n  ✖ Faltan NEXT_PUBLIC_SUPABASE_URL o la llave. Corre con --env-file=.env\n')
  process.exit(1)
}

const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: 'application/openapi+json' },
})

if (!response.ok) {
  console.error(`\n  ✖ Supabase respondio ${response.status}\n`)
  process.exit(1)
}

const spec = await response.json()
const definitions = spec.definitions ?? {}
const tables = Object.keys(definitions).sort()

/** PostgREST annotates PK and FK inside `description`. */
function annotations(description = '') {
  const notes = []
  if (description.includes('<pk/>')) notes.push('PK')
  const fk = description.match(/<fk table='([^']+)' column='([^']+)'\/>/)
  if (fk) notes.push(`FK → ${fk[1]}.${fk[2]}`)
  return notes.join(', ')
}

const lines = [
  '# Esquema `public` de Supabase',
  '',
  '> Generado con `pnpm db:schema`. **No lo edites a mano.**',
  '>',
  '> Es la referencia del esquema real en produccion. Varias tablas del CRM se',
  '> crearon con los `.sql` sueltos de `scripts/` y no estan en `supabase/migrations`,',
  '> asi que este archivo es la unica fuente fiel del estado actual.',
  '',
  `Tablas y vistas: ${tables.length}`,
  '',
]

for (const table of tables) {
  const def = definitions[table]
  const required = new Set(def.required ?? [])
  const columns = Object.entries(def.properties ?? {})

  lines.push(`## ${table}`, '')
  lines.push('| Columna | Tipo | Nulo | Default | Notas |')
  lines.push('| --- | --- | --- | --- | --- |')

  for (const [name, prop] of columns) {
    const type = prop.format ?? prop.type ?? ''
    const nullable = required.has(name) ? 'NO' : 'sí'
    const defaultValue = prop.default !== undefined ? `\`${prop.default}\`` : ''
    lines.push(`| ${name} | ${type} | ${nullable} | ${defaultValue} | ${annotations(prop.description)} |`)
  }

  lines.push('')
}

writeFileSync(OUT, lines.join('\n'))
console.log(`\n  ✅ ${tables.length} tablas → ${OUT}\n`)
