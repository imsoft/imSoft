import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/quotes/server'
import { desconectarCuenta } from '@/lib/gmail/server'

export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  await desconectarCuenta(auth.userId)
  return NextResponse.json({ ok: true })
}
