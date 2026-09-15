import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { buscarProspectos, placesConfigurado } from '@/lib/places-server'

export const maxDuration = 300

/** Busca negocios en Google Places por giro y municipio; opcionalmente rastrea sus correos. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!placesConfigurado()) return NextResponse.json({ error: 'Falta GOOGLE_PLACES_API_KEY en Vercel.' }, { status: 500 })
  const body = await req.json().catch(() => ({}))
  try {
    const r = await buscarProspectos(serviceClient(), String(body.giro ?? ''), String(body.municipio ?? 'zmg'), {
      max: Math.min(60, Math.max(10, Number(body.max) || 40)),
      correos: Boolean(body.correos),
      queryLibre: typeof body.query === 'string' ? body.query : undefined,
    })
    return NextResponse.json(r)
  } catch (err) {
    console.error('[prospects/search]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
