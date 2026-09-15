import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { requireAdmin, SITE_URL } from '@/lib/quotes/server'
import { conectarCuenta } from '@/lib/gmail/server'

/** Vuelta del consentimiento de Google: guarda los tokens y regresa a Prospección. */
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  const volver = (q: string) => NextResponse.redirect(`${SITE_URL}/es/dashboard/admin/crm/prospeccion?${q}`)
  if (!auth.ok) return NextResponse.redirect(`${SITE_URL}/es/login`)
  const code = req.nextUrl.searchParams.get('code')
  const state = req.nextUrl.searchParams.get('state')
  const jar = await cookies()
  const esperado = jar.get('gmail_oauth_state')?.value
  jar.delete('gmail_oauth_state')
  if (!code || !state || state !== esperado) return volver('gmail=error&motivo=estado')
  try {
    const email = await conectarCuenta(auth.userId, code)
    return volver(`gmail=ok&email=${encodeURIComponent(email)}`)
  } catch (err) {
    console.error('[gmail/callback]', err)
    return volver(`gmail=error&motivo=${encodeURIComponent(err instanceof Error ? err.message : 'desconocido')}`)
  }
}
