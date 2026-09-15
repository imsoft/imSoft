/**
 * Prospectos nuevos cada semana con Google Places.
 *
 * Recorre las busquedas de content/prospect-searches.json (giro x municipio), descarta
 * los negocios que ya estan en el CRM, rastrea el correo en el sitio de cada uno y da
 * de alta los nuevos como prospectos sin contactar. El gancho lo propone la IA cuando
 * se genera el borrador en Prospección.
 *
 * Variables de entorno: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * GOOGLE_PLACES_API_KEY.
 *
 * Uso:
 *   node --env-file=.env --experimental-strip-types scripts/find-prospects.mjs [--max 40] [--dry-run]
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { buscarProspectos, importarCandidatos } from '../src/lib/places-server.ts'

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : [])).filter((x) => x.length))
const MAX = Number(args.max) || 40
const dryRun = Boolean(args['dry-run'])

for (const v of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_PLACES_API_KEY']) {
  if (!process.env[v]) {
    console.error(`Falta ${v}`)
    process.exit(1)
  }
}

const config = JSON.parse(readFileSync(new URL('../content/prospect-searches.json', import.meta.url), 'utf8'))
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Rota las busquedas: cada semana empieza en un punto distinto para no repetir siempre las mismas.
const semana = Math.floor(Date.now() / (7 * 86_400_000))
const busquedas = config.busquedas.map((_, i, all) => all[(i + semana) % all.length])

const hoy = new Date().toISOString().slice(0, 10)
let total = 0
for (const b of busquedas) {
  if (total >= MAX) break
  const { candidatos, segmento, nuevos } = await buscarProspectos(db, b.giro, b.municipio, { max: 20, correos: true })
  const elegibles = candidatos.filter((c) => !c.enCrm && (c.correo || c.telefono || c.instagram)).slice(0, MAX - total)
  console.log(`${b.giro} / ${b.municipio}: ${candidatos.length} encontrados, ${nuevos} nuevos, ${elegibles.length} con contacto`)
  if (dryRun) {
    total += elegibles.length
    continue
  }
  if (elegibles.length === 0) continue
  const r = await importarCandidatos(db, elegibles, segmento, `Google Places semanal - ${segmento} - ${hoy}`, ['auto-semanal', `campana-${hoy.slice(0, 7)}`])
  total += r.insertados
  console.log(`  -> ${r.insertados} agregados`)
}
console.log(`\nTotal ${dryRun ? 'que se agregarian' : 'agregados'}: ${total}${dryRun ? ' (dry run, nada escrito)' : ''}`)
