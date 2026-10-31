import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { editDraft } from '@/lib/outreach-server'

/** Edits a draft's subject, body or date. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  try {
    const r = await editDraft(serviceClient(), id, { subject: body.subject, body: body.body ?? body.cuerpo, scheduled_for: body.scheduled_for })
    return NextResponse.json(r)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
