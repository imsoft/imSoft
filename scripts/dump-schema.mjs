#!/usr/bin/env node
/**
 * Vuelca el esquema `public` de Supabase a un archivo versionable.
 *
 * Lee el OpenAPI que PostgREST publica en /rest/v1/, asi que NO necesita el
 * Supabase CLI, ni vincular el proyecto, ni la contrasena de la base: le basta
 * la llave que ya esta en .env.
 *
 * El archivo que genera es la referencia del esquema real para el repo, porque
 * varias tablas (contacts, deals, activities) se crearon con los .sql sueltos
 * de scripts/ y nunca entraron a supabase/migrations.
 *
 * Solo escribe nombres de tablas, columnas y tipos del esquema `public`.
 * Ningun dato ni secreto.
 *
 * Uso:
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
const tablas = Object.keys(definitions).sort()

/** PostgREST anota PK y FK dentro de `description`. */
function anotaciones(descripcion = '') {
  const notas = []
  if (descripcion.includes('<pk/>')) notas.push('PK')
  const fk = descripcion.match(/<fk table='([^']+)' column='([^']+)'\/>/)
  if (fk) notas.push(`FK → ${fk[1]}.${fk[2]}`)
  return notas.join(', ')
}

const lineas = [
  '# Esquema `public` de Supabase',
  '',
  '> Generado con `pnpm db:schema`. **No lo edites a mano.**',
  '>',
  '> Es la referencia del esquema real en produccion. Varias tablas del CRM se',
  '> crearon con los `.sql` sueltos de `scripts/` y no estan en `supabase/migrations`,',
  '> asi que este archivo es la unica fuente fiel del estado actual.',
  '',
  `Tablas y vistas: ${tablas.length}`,
  '',
]

for (const tabla of tablas) {
  const def = definitions[tabla]
  const requeridas = new Set(def.required ?? [])
  const columnas = Object.entries(def.properties ?? {})

  lineas.push(`## ${tabla}`, '')
  lineas.push('| Columna | Tipo | Nulo | Default | Notas |')
  lineas.push('| --- | --- | --- | --- | --- |')

  for (const [nombre, prop] of columnas) {
    const tipo = prop.format ?? prop.type ?? ''
    const nulo = requeridas.has(nombre) ? 'NO' : 'sí'
    const def_ = prop.default !== undefined ? `\`${prop.default}\`` : ''
    lineas.push(`| ${nombre} | ${tipo} | ${nulo} | ${def_} | ${anotaciones(prop.description)} |`)
  }

  lineas.push('')
}

writeFileSync(OUT, lineas.join('\n'))
console.log(`\n  ✅ ${tablas.length} tablas → ${OUT}\n`)
