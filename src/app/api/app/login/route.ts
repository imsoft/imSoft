import { NextRequest, NextResponse } from 'next/server'
import { correoCodigoApp } from '@/lib/email/plantillas'
import { canRequestCode, codeHistory, historyAfter, metadataWithHistory, normalizeEmail } from '@/lib/mobile-app/login'
import { enviarCorreo, serviceClient } from '@/lib/quotes/server'

/** Minutes the code is valid: Supabase Auth's default OTP expiry. */
const CODE_VALID_MINUTES = 60

/**
 * Mobile app: requests a one-time code to sign in. Always answers the same whether or not the
 * account exists, so it doesn't reveal which emails are clients. The app verifies the code
 * directly with Supabase (POST /auth/v1/verify, type "email").
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = normalizeEmail(body.email)
  if (!email) return NextResponse.json({ error: 'Escribe un correo válido.' }, { status: 400 })

  const db = serviceClient()
  try {
    const { data } = await db.auth.admin.listUsers({ perPage: 1000 })
    const user = data?.users.find((u) => u.email?.toLowerCase() === email)
    if (!user) return NextResponse.json({ ok: true })

    const now = Date.now()
    const history = codeHistory(user.app_metadata)
    const allowed = canRequestCode(history, now)
    if (!allowed.ok) {
      const wait = allowed.retryAfterSeconds
      // `esperarSegundos` is for app versions already in the stores.
      return NextResponse.json({ error: `Ya te mandamos un código. Espera ${wait} segundos para pedir otro.`, retryAfterSeconds: wait, esperarSegundos: wait }, { status: 429 })
    }

    const { data: link, error } = await db.auth.admin.generateLink({ type: 'magiclink', email })
    const code = link?.properties?.email_otp
    if (error || !code) throw new Error(error?.message ?? 'Supabase returned no code')
    // The history lives in app_metadata: only the server writes it.
    await db.auth.admin.updateUserById(user.id, { app_metadata: metadataWithHistory(user.app_metadata, historyAfter(history, now)) })
    const mail = correoCodigoApp({ codigo: code, minutos: CODE_VALID_MINUTES })
    await enviarCorreo({ to: email, subject: mail.subject, html: mail.html })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[app/login]', err)
    return NextResponse.json({ error: 'No pudimos mandar el código. Intenta de nuevo en un momento.' }, { status: 500 })
  }
}
