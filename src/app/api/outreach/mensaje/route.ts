import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { mensajeParaRed } from '@/lib/outreach-server'
import { CANALES, type Canal } from '@/lib/mensaje-red'

/** Propone el mensaje de prospeccion para una red social del contacto. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const canal = body.canal as Canal
  if (typeof body.contactId !== 'string' || !CANALES.includes(canal)) return NextResponse.json({ error: 'Faltan contactId o canal' }, { status: 400 })
  try {
    return NextResponse.json(await mensajeParaRed(serviceClient(), body.contactId, canal))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
