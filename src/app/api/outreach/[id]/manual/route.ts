import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { marcarEnviadoAMano } from '@/lib/outreach-server'

/** El admin ya mando el correo por su cuenta: se registra y el prospecto pasa a calificacion. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  try {
    return NextResponse.json(await marcarEnviadoAMano(serviceClient(), auth.userId, id))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
