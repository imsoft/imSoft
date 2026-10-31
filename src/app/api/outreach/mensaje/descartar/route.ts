import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { discardFromSocial } from '@/lib/outreach-server'
import { SOCIAL_DISCARD_REASONS, type SocialDiscardReason } from '@/lib/social-message'

/**
 * The contact is no good for social (number not on WhatsApp, someone else's profile,
 * corporate): it leaves the queue. Body: { contactId, reason }; the old key `motivo` (used
 * by the Claude-in-Chrome workflow) is still accepted.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const reason = (body.reason ?? body.motivo) as SocialDiscardReason
  if (typeof body.contactId !== 'string' || typeof reason !== 'string' || !(reason in SOCIAL_DISCARD_REASONS)) return NextResponse.json({ error: 'Faltan contactId o motivo' }, { status: 400 })
  try {
    return NextResponse.json(await discardFromSocial(serviceClient(), auth.userId, body.contactId, reason))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 400 })
  }
}
