import { NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { socialMessageCounts } from '@/lib/outreach-server'

export const dynamic = 'force-dynamic'

/** How many social messages went out today and this week, with each network's daily cap. The Spanish keys (hoy, semana, topes) are kept for the Chrome workflow. */
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const counts = await socialMessageCounts(serviceClient())
  return NextResponse.json({ ...counts, hoy: counts.today, semana: counts.week, topes: counts.caps })
}
