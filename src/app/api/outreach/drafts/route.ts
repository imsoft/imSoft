import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { createDraftForContact, createStep1Drafts } from '@/lib/outreach-server'

export const maxDuration = 300

/**
 * Generates first-email drafts: for one contact (contactId) or in batch for uncontacted
 * prospects. Accepts the old body keys (`seguimiento`, `limite`) too.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await req.json().catch(() => ({}))
  const limit = Math.min(50, Math.max(1, Number(body.limit ?? body.limite) || 15))
  try {
    if (typeof body.contactId === 'string') return NextResponse.json(await createDraftForContact(serviceClient(), body.contactId, { followUp: body.followUp === true || body.seguimiento === true }))
    const r = await createStep1Drafts(serviceClient(), limit, typeof body.campaign === 'string' ? body.campaign : null)
    return NextResponse.json(r)
  } catch (err) {
    console.error('[outreach/drafts]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
