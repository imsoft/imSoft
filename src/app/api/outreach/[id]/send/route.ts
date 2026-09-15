import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { enviarBorrador } from '@/lib/outreach-server'

/** Manda el borrador por Gmail. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  try {
    return NextResponse.json(await enviarBorrador(serviceClient(), auth.userId, id))
  } catch (err) {
    console.error('[outreach/send]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
