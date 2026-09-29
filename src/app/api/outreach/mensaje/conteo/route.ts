import { NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { mensajesDeRedes } from '@/lib/outreach-server'

export const dynamic = 'force-dynamic'

/** Cuantos mensajes por redes van hoy y en la semana, con el tope diario de cada red. */
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  return NextResponse.json(await mensajesDeRedes(serviceClient()))
}
