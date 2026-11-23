import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/quotes/server'

/**
 * The public portfolio is cached (ISR, hourly). After a project is created, edited or
 * deleted in the dashboard, this refreshes the list, every detail page and the home page
 * (which shows projects too) right away instead of waiting for the hour.
 */
export async function POST() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  revalidatePath('/[lang]/portfolio', 'layout')
  revalidatePath('/[lang]', 'page')
  return NextResponse.json({ revalidated: true })
}
