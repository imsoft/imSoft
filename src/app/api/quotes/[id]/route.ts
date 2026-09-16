import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'

/**
 * Elimina una cotizacion (y su contrato, por cascada). Se bloquea si ya se convirtio en
 * proyecto o si el contrato esta firmado: en ese caso hay evidencia legal que no se borra.
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const db = serviceClient()
  const { data: q } = await db.from('quotes').select('id, folio, project_id').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  if (q.project_id) return NextResponse.json({ error: 'Esta cotización ya se convirtió en proyecto. Elimina o desvincula el proyecto primero.' }, { status: 409 })
  const { data: contrato } = await db.from('contracts').select('status').eq('quote_id', id).maybeSingle()
  if (contrato?.status === 'signed') return NextResponse.json({ error: 'El contrato de esta cotización ya está firmado; no se puede eliminar.' }, { status: 409 })
  const { error } = await db.from('quotes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, folio: q.folio })
}
