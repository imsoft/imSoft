import { NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { sincronizar } from '@/lib/outreach-server'

export const maxDuration = 120

/** Detecta respuestas en Gmail y crea los seguimientos que ya tocan. */
export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    return NextResponse.json(await sincronizar(serviceClient(), auth.userId))
  } catch (err) {
    console.error('[outreach/sync]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
