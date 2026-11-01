import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { recordSocialMessage } from '@/lib/outreach-server'
import { CHANNELS, CHANNEL_LABEL, type Channel } from '@/lib/social-message'

/**
 * The admin already sent the message on the network: it's recorded and the prospect moves
 * to qualification. Body: { contactId, channel, text }; the old keys `canal` and `texto`
 * (used by the Claude-in-Chrome workflow) are still accepted.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const channel = (body.channel ?? body.canal) as Channel
  const text = body.text ?? body.texto
  if (typeof body.contactId !== 'string' || !CHANNELS.includes(channel) || typeof text !== 'string' || !text.trim()) return NextResponse.json({ error: 'Faltan contactId, canal o texto' }, { status: 400 })
  try {
    return NextResponse.json(await recordSocialMessage(serviceClient(), auth.userId, body.contactId, channel, text.trim(), CHANNEL_LABEL[channel]))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
