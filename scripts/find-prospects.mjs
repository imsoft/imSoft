/**
 * New prospects from Google Places, on Mondays, Wednesdays and Fridays.
 *
 * Walks the searches in content/prospect-searches.json (industry x municipality), skips
 * businesses already in the CRM, crawls each website for an email and adds the new ones
 * as uncontacted prospects. The hook is proposed by the AI when the draft is generated
 * in Prospección.
 *
 * Environment variables: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * GOOGLE_PLACES_API_KEY.
 *
 * Usage:
 *   node --env-file=.env --experimental-strip-types scripts/find-prospects.mjs [--max 80] [--searches 15] [--industries jewelry,wholesale-market] [--dry-run]
 *
 * --industries runs every search of those industries instead of today's slice (to try a
 * new industry without waiting for the rotation). The old flags --giros and --busquedas
 * still work.
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { importCandidates, searchProspects } from '../src/lib/places-server.ts'
import { isOffProfile, isReachable, matchingBrand, runNumber, searchSlice } from '../src/lib/places.ts'

const args = Object.fromEntries(process.argv.slice(2).map((a, i, all) => (a.startsWith('--') ? [a.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] === undefined ? true : all[i + 1]] : [])).filter((x) => x.length))
// Cap on new contacts per run. With the Google phone counting as WhatsApp (2026-10-26)
// many more get in per search; 80 per run, three runs a week, covers 15 a day.
const MAX = Number(args.max) || 80
// Searches per run: each one costs on Google, and with three runs a week the whole list is covered in about two weeks.
const SEARCHES_PER_RUN = Number(args.searches ?? args.busquedas) || 15
const dryRun = Boolean(args['dry-run'])

for (const v of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'GOOGLE_PLACES_API_KEY']) {
  if (!process.env[v]) {
    console.error(`Falta ${v}`)
    process.exit(1)
  }
}

const config = JSON.parse(readFileSync(new URL('../content/prospect-searches.json', import.meta.url), 'utf8'))
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Each run (Monday, Wednesday and Friday) takes a different slice of the list.
const run = runNumber()
const industriesArg = args.industries ?? args.giros
const onlyIndustries = typeof industriesArg === 'string' ? industriesArg.split(',') : null
const searches = onlyIndustries ? config.searches.filter((s) => onlyIndustries.includes(s.industry)) : searchSlice(config.searches, run, SEARCHES_PER_RUN)
console.log(`Corrida ${run}: ${searches.length} busquedas de ${config.searches.length}${onlyIndustries ? ` (solo ${onlyIndustries.join(', ')})` : ''}`)

const today = new Date().toISOString().slice(0, 10)
let total = 0
for (const s of searches) {
  if (total >= MAX) break
  const { candidates, segment, newCount } = await searchProspects(db, s.industry, s.municipality, { max: 20, emails: true })
  const eligible = candidates.filter((c) => !c.inCrm && isReachable(c) && !isOffProfile(c.name)).slice(0, MAX - total)
  console.log(`${s.industry} / ${s.municipality}: ${candidates.length} encontrados, ${newCount} nuevos, ${eligible.length} con correo, Instagram o WhatsApp`)
  if (dryRun) {
    total += eligible.length
    continue
  }
  if (eligible.length === 0) continue
  const r = await importCandidates(db, eligible, segment, `Google Places - ${segment} - ${today}`, ['auto-places', `campaign-${today.slice(0, 7)}`])
  total += r.inserted
  console.log(`  -> ${r.inserted} agregados`)
}
// Large companies, by name (content/large-companies.json): 2 per run, outside the cap.
const largeCompanies = JSON.parse(readFileSync(new URL('../content/large-companies.json', import.meta.url), 'utf8')).companies
for (const company of searchSlice(largeCompanies, run, 2)) {
  const { candidates } = await searchProspects(db, 'corporate', 'zmg', { max: 10, emails: true, freeQuery: company.query })
  const eligible = matchingBrand(candidates, company.key).filter((c) => !c.inCrm && isReachable(c))
  console.log(`corporativo / ${company.name}: ${eligible.length ? 'con correo, Instagram o WhatsApp' : 'ya en el CRM, sin contacto o no encontrado'}`)
  if (dryRun || eligible.length === 0) continue
  const r = await importCandidates(db, eligible, 'corporate', `Google Places - corporate - ${today}`, ['auto-places', 'large-company', `campaign-${today.slice(0, 7)}`])
  total += r.inserted
}
console.log(`\nTotal ${dryRun ? 'que se agregarian' : 'agregados'}: ${total}${dryRun ? ' (dry run, nada escrito)' : ''}`)
