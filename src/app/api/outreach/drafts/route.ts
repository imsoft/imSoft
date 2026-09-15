import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { crearBorradoresPaso1 } from '@/lib/outreach-server'

export const maxDuration = 300

/** Genera borradores del primer correo para prospectos sin contactar. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const limite = Math.min(50, Math.max(1, Number(body.limite) || 15))
  try {
    const r = await crearBorradoresPaso1(serviceClient(), limite, typeof body.campaign === 'string' ? body.campaign : null)
    return NextResponse.json(r)
  } catch (err) {
    console.error('[outreach/drafts]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
