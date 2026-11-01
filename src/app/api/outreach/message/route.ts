import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { socialMessageFor } from '@/lib/outreach-server'
import { CHANNELS, type Channel } from '@/lib/social-message'

/**
 * Proposes the prospecting message for one of the contact's social networks.
 * Body: { contactId, channel }. The Claude-in-Chrome workflow still sends `canal` and reads
 * `texto`/`gancho`, so the old keys are accepted and returned alongside the new ones.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const channel = (body.channel ?? body.canal) as Channel
  if (typeof body.contactId !== 'string' || !CHANNELS.includes(channel)) return NextResponse.json({ error: 'Faltan contactId o canal' }, { status: 400 })
  try {
    const r = await socialMessageFor(serviceClient(), body.contactId, channel)
    return NextResponse.json({ ...r, texto: r.text, gancho: r.hook })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
