import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireAdmin, SITE_URL } from '@/lib/quotes/server'
import { connectAccount } from '@/lib/gmail/server'

/** Return from Google consent: stores the tokens and goes back to Prospecting. */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  const goBack = (q: string) => NextResponse.redirect(`${SITE_URL}/es/dashboard/admin/crm/prospecting?${q}`)
  if (!auth.ok) return NextResponse.redirect(`${SITE_URL}/es/login`)
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const jar = await cookies()
  const expected = jar.get('gmail_oauth_state')?.value
  jar.delete('gmail_oauth_state')
  if (!code || !state || state !== expected) return goBack('gmail=error&motivo=estado')
  try {
    const email = await connectAccount(auth.userId, code)
    return goBack(`gmail=ok&email=${encodeURIComponent(email)}`)
  } catch (err) {
    console.error('[gmail/callback]', err)
    return goBack(`gmail=error&motivo=${encodeURIComponent(err instanceof Error ? err.message : 'desconocido')}`)
  }
}
