import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { requireAdmin } from '@/lib/quotes/server'
import { gmailConfigurado, urlDeConsentimiento } from '@/lib/gmail/server'

/** Manda al admin a la pantalla de consentimiento de Google. */
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!gmailConfigurado()) return NextResponse.json({ error: 'Faltan GOOGLE_OAUTH_CLIENT_ID y GOOGLE_OAUTH_CLIENT_SECRET en el entorno.' }, { status: 500 })
  const state = randomBytes(16).toString('hex')
  const jar = await cookies()
  jar.set('gmail_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  return NextResponse.redirect(urlDeConsentimiento(state))
}
