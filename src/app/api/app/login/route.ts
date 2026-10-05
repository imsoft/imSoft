import { NextRequest, NextResponse } from 'next/server'
import { enviarCorreo, serviceClient } from '@/lib/quotes/server'
import { historialTras, normalizarCorreo, puedePedirCodigo } from '@/lib/app-login'
import { correoCodigoApp } from '@/lib/email/plantillas'

/** Minutos que vale el codigo: el vencimiento de OTP por defecto de Supabase Auth. */
const VIGENCIA_MIN = 60

/**
 * App movil: pide un codigo de un solo uso para entrar. Siempre responde lo mismo exista
 * o no la cuenta, para no revelar que correos son clientes. La app verifica el codigo
 * directo con Supabase (POST /auth/v1/verify, type "email").
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = normalizarCorreo(body.email)
  if (!email) return NextResponse.json({ error: 'Escribe un correo válido.' }, { status: 400 })

  const db = serviceClient()
  try {
    const { data } = await db.auth.admin.listUsers({ perPage: 1000 })
    const user = data?.users.find((u) => u.email?.toLowerCase() === email)
    if (!user) return NextResponse.json({ ok: true })

    const ahora = Date.now()
    const historial = Array.isArray(user.app_metadata?.codigos_app) ? (user.app_metadata.codigos_app as number[]) : []
    const permiso = puedePedirCodigo(historial, ahora)
    if (!permiso.ok) return NextResponse.json({ error: `Ya te mandamos un código. Espera ${permiso.esperarSegundos} segundos para pedir otro.`, esperarSegundos: permiso.esperarSegundos }, { status: 429 })

    const { data: link, error } = await db.auth.admin.generateLink({ type: 'magiclink', email })
    const codigo = link?.properties?.email_otp
    if (error || !codigo) throw new Error(error?.message ?? 'Supabase no devolvió el código')
    // El historial vive en app_metadata: solo lo escribe el servidor.
    await db.auth.admin.updateUserById(user.id, { app_metadata: { ...user.app_metadata, codigos_app: historialTras(historial, ahora) } })
    const correo = correoCodigoApp({ codigo, minutos: VIGENCIA_MIN })
    await enviarCorreo({ to: email, subject: correo.subject, html: correo.html })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[app/login]', err)
    return NextResponse.json({ error: 'No pudimos mandar el código. Intenta de nuevo en un momento.' }, { status: 500 })
  }
}
