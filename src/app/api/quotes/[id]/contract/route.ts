import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { generateToken, renderContract, nextNumber } from '@/lib/quotes'

/**
 * Generates the contract from the accepted quote (one per quote). With
 * `{ regenerate: true }` it rebuilds the text of a contract that is still a draft with
 * the current template, keeping its number and link.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const db = serviceClient()
  const { data: q } = await db.from('quotes').select('*').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  if (q.status !== 'accepted') return NextResponse.json({ error: 'El contrato se genera cuando la cotización está aceptada' }, { status: 400 })
  const { data: existing } = await db.from('contracts').select('id, number, status').eq('quote_id', id).maybeSingle()
  if (existing) {
    const body = await req.json().catch(() => ({}))
    if (body?.regenerate !== true) return NextResponse.json({ id: existing.id, existed: true })
    if (existing.status !== 'draft') return NextResponse.json({ error: 'Solo se regenera un contrato en borrador' }, { status: 400 })
    const { error } = await db.from('contracts').update({ body_html: renderContract(q, existing.number), updated_at: new Date().toISOString() }).eq('id', existing.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ id: existing.id, number: existing.number, regenerated: true })
  }

  const { data: last } = await db.from('contracts').select('number').like('number', 'CON-%').order('created_at', { ascending: false }).limit(1).maybeSingle()
  const contractNumber = nextNumber('CON', last?.number)
  const { data, error } = await db
    .from('contracts')
    .insert({ quote_id: id, number: contractNumber, status: 'draft', lang: q.lang, body_html: renderContract(q, contractNumber), token: generateToken(randomBytes(24)) })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id, number: contractNumber })
}
