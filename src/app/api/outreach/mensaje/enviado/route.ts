import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { registrarMensajeRed } from '@/lib/outreach-server'
import { CANALES, ETIQUETA_CANAL, type Canal } from '@/lib/mensaje-red'

/** El admin ya mando el mensaje por la red: se registra y el prospecto pasa a calificacion. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const canal = body.canal as Canal
  if (typeof body.contactId !== 'string' || !CANALES.includes(canal) || typeof body.texto !== 'string' || !body.texto.trim()) return NextResponse.json({ error: 'Faltan contactId, canal o texto' }, { status: 400 })
  try {
    return NextResponse.json(await registrarMensajeRed(serviceClient(), auth.userId, body.contactId, canal, body.texto.trim(), ETIQUETA_CANAL[canal]))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
