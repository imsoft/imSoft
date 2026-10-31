import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { importCandidates } from '@/lib/places-server'
import type { Candidate } from '@/lib/places'

/**
 * Adds the candidates the admin checked as prospects. Body: { candidates, segment } (the
 * old keys `candidatos` and `segmento` are still accepted).
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const list = body.candidates ?? body.candidatos
  const candidates: Candidate[] = Array.isArray(list) ? list : []
  if (candidates.length === 0) return NextResponse.json({ error: 'No hay candidatos' }, { status: 400 })
  const rawSegment = body.segment ?? body.segmento
  const segment = typeof rawSegment === 'string' && rawSegment ? rawSegment : 'other'
  const today = new Date().toISOString().slice(0, 10)
  try {
    const r = await importCandidates(serviceClient(), candidates, segment, `Google Places - ${segment} - ${today}`, [`campaign-${today.slice(0, 7)}`])
    return NextResponse.json(r)
  } catch (err) {
    console.error('[prospects/import]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
