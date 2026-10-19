import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { descartarDeRedes } from '@/lib/outreach-server'
import { MOTIVOS_DESCARTE_REDES, type MotivoDescarteRedes } from '@/lib/mensaje-red'

/** El contacto no sirve para redes (número sin WhatsApp, perfil ajeno, corporativo): sale de la cola. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const motivo = body.motivo as MotivoDescarteRedes
  if (typeof body.contactId !== 'string' || !(motivo in MOTIVOS_DESCARTE_REDES)) return NextResponse.json({ error: 'Faltan contactId o motivo' }, { status: 400 })
  try {
    return NextResponse.json(await descartarDeRedes(serviceClient(), auth.userId, body.contactId, motivo))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
