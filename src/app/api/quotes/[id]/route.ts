import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'

/**
 * Deletes a quote (and its contract, by cascade). Blocked if it was already converted
 * into a project or the contract is signed: then there is legal evidence that is not deleted.
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const db = serviceClient()
  const { data: q } = await db.from('quotes').select('id, number, project_id').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  if (q.project_id) return NextResponse.json({ error: 'Esta cotización ya se convirtió en proyecto. Elimina o desvincula el proyecto primero.' }, { status: 409 })
  const { data: contract } = await db.from('contracts').select('status').eq('quote_id', id).maybeSingle()
  if (contract?.status === 'signed') return NextResponse.json({ error: 'El contrato de esta cotización ya está firmado; no se puede eliminar.' }, { status: 409 })
  const { error } = await db.from('quotes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, number: q.number })
}
