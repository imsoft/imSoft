import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { editarBorrador } from '@/lib/outreach-server'

/** Edita asunto, cuerpo o fecha de un borrador. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  try {
    const r = await editarBorrador(serviceClient(), id, { subject: body.subject, cuerpo: body.cuerpo, scheduled_for: body.scheduled_for })
    return NextResponse.json(r)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
