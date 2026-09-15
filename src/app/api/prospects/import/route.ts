import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { importarCandidatos } from '@/lib/places-server'
import type { Candidato } from '@/lib/places'

/** Da de alta como prospectos los candidatos que el admin marcó. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const candidatos: Candidato[] = Array.isArray(body.candidatos) ? body.candidatos : []
  if (candidatos.length === 0) return NextResponse.json({ error: 'No hay candidatos' }, { status: 400 })
  const segmento = typeof body.segmento === 'string' && body.segmento ? body.segmento : 'otros'
  const hoy = new Date().toISOString().slice(0, 10)
  try {
    const r = await importarCandidatos(serviceClient(), candidatos, segmento, `Google Places - ${segmento} - ${hoy}`, [`campana-${hoy.slice(0, 7)}`])
    return NextResponse.json(r)
  } catch (err) {
    console.error('[prospects/import]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
