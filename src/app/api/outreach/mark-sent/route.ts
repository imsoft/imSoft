import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { recordManualSends } from '@/lib/outreach-server'

/** Records contacts already reached by hand as step 1 sent, so they enter the follow-ups. */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const ids: string[] = Array.isArray(body.contactIds) ? body.contactIds.filter((x: unknown) => typeof x === 'string') : []
  if (ids.length === 0) return NextResponse.json({ error: 'Faltan contactIds' }, { status: 400 })
  const sentAt = typeof body.sentAt === 'string' && !Number.isNaN(Date.parse(body.sentAt)) ? new Date(body.sentAt).toISOString() : new Date().toISOString()
  return NextResponse.json(await recordManualSends(serviceClient(), ids, sentAt))
}
