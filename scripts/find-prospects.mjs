/**
 * Prospectos nuevos con Google Places, lunes, miercoles y viernes.
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
 *   node --env-file=.env --experimental-strip-types scripts/find-prospects.mjs [--max 40] [--busquedas 15] [--dry-run]
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { buscarProspectos, importarCandidatos } from '../src/lib/places-server.ts'
import { numeroDeCorrida, sePuedeEscribir, tramoDeBusquedas } from '../src/lib/places.ts'

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : [])).filter((x) => x.length))
const MAX = Number(args.max) || 40
// Busquedas por corrida: cada una cuesta en Google, y con tres corridas por semana asi se recorre la lista completa en unas dos semanas.
const POR_CORRIDA = Number(args.busquedas) || 15
const dryRun = Boolean(args['dry-run'])

for (const v of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_PLACES_API_KEY']) {
  if (!process.env[v]) {
    console.error(`Falta ${v}`)
    process.exit(1)
  }
}

const config = JSON.parse(readFileSync(new URL('../content/prospect-searches.json', import.meta.url), 'utf8'))
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Cada corrida (lunes, miercoles y viernes) toma un tramo distinto de la lista.
const corrida = numeroDeCorrida()
const busquedas = tramoDeBusquedas(config.busquedas, corrida, POR_CORRIDA)
console.log(`Corrida ${corrida}: ${busquedas.length} busquedas de ${config.busquedas.length}`)

const hoy = new Date().toISOString().slice(0, 10)
let total = 0
for (const b of busquedas) {
  if (total >= MAX) break
  const { candidatos, segmento, nuevos } = await buscarProspectos(db, b.giro, b.municipio, { max: 20, correos: true })
  const elegibles = candidatos.filter((c) => !c.enCrm && sePuedeEscribir(c)).slice(0, MAX - total)
  console.log(`${b.giro} / ${b.municipio}: ${candidatos.length} encontrados, ${nuevos} nuevos, ${elegibles.length} con correo o Instagram`)
  if (dryRun) {
    total += elegibles.length
    continue
  }
  if (elegibles.length === 0) continue
  const r = await importarCandidatos(db, elegibles, segmento, `Google Places - ${segmento} - ${hoy}`, ['auto-places', `campana-${hoy.slice(0, 7)}`])
  total += r.insertados
  console.log(`  -> ${r.insertados} agregados`)
}
console.log(`\nTotal ${dryRun ? 'que se agregarian' : 'agregados'}: ${total}${dryRun ? ' (dry run, nada escrito)' : ''}`)
