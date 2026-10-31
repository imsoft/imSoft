import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { searchProspects, placesConfigured } from '@/lib/places-server'

export const maxDuration = 300

/**
 * Searches businesses in Google Places by industry and municipality; optionally crawls
 * their emails. Body: { industry, municipality, max, emails, query } (the old keys `giro`,
 * `municipio` and `correos` are still accepted).
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!placesConfigured()) return NextResponse.json({ error: 'Falta GOOGLE_PLACES_API_KEY en Vercel.' }, { status: 500 })
  const body = await req.json().catch(() => ({}))
  try {
    const r = await searchProspects(serviceClient(), String(body.industry ?? body.giro ?? ''), String(body.municipality ?? body.municipio ?? 'zmg'), {
      max: Math.min(60, Math.max(10, Number(body.max) || 40)),
      emails: Boolean(body.emails ?? body.correos),
      freeQuery: typeof body.query === 'string' ? body.query : undefined,
    })
    return NextResponse.json(r)
  } catch (err) {
    console.error('[prospects/search]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
