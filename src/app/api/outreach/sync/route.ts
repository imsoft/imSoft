import { NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { syncOutreach } from '@/lib/outreach-server'

export const maxDuration = 120

/** Detects replies in Gmail and creates the follow-ups that are already due. */
export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  try {
    return NextResponse.json(await syncOutreach(serviceClient(), auth.userId))
  } catch (err) {
    console.error('[outreach/sync]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error' }, { status: 500 })
  }
}
