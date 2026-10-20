import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { generarToken, renderContrato, siguienteFolio } from '@/lib/cotizaciones'

/**
 * Genera el contrato desde la cotizacion aceptada (uno por cotizacion). Con
 * `{ regenerar: true }` vuelve a armar el texto de un contrato que sigue en borrador
 * con la plantilla actual, conservando folio y enlace.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const db = serviceClient()
  const { data: q } = await db.from('quotes').select('*').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  if (q.status !== 'accepted') return NextResponse.json({ error: 'El contrato se genera cuando la cotización está aceptada' }, { status: 400 })
  const { data: existente } = await db.from('contracts').select('id, folio, status').eq('quote_id', id).maybeSingle()
  if (existente) {
    const body = await req.json().catch(() => ({}))
    if (body?.regenerar !== true) return NextResponse.json({ id: existente.id, existed: true })
    if (existente.status !== 'draft') return NextResponse.json({ error: 'Solo se regenera un contrato en borrador' }, { status: 400 })
    const { error } = await db.from('contracts').update({ body_html: renderContrato(q, existente.folio), updated_at: new Date().toISOString() }).eq('id', existente.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: existente.id, folio: existente.folio, regenerated: true })
  }

  const { data: ultimo } = await db.from('contracts').select('folio').like('folio', 'CON-%').order('created_at', { ascending: false }).limit(1).maybeSingle()
  const folio = siguienteFolio('CON', ultimo?.folio)
  const { data, error } = await db
    .from('contracts')
    .insert({ quote_id: id, folio, status: 'draft', lang: q.lang, body_html: renderContrato(q, folio), token: generarToken(randomBytes(24)) })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, folio })
}
