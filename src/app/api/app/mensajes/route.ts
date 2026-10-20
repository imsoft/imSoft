import { NextRequest, NextResponse } from 'next/server'
import { usuarioDeBearer } from '@/lib/app-sesion'
import { serviceClient, SITE_URL } from '@/lib/quotes/server'
import { getResend } from '@/lib/email/resend-client'
import { correoContacto } from '@/lib/email/plantillas'
import { mensajeParaApp, nombreParaMensaje, validarMensaje } from '@/lib/app-mensajes'

/**
 * App movil: los mensajes que el cliente le ha escrito a imSoft (los mismos que ve en el
 * panel web) y mandar uno nuevo. Va por aqui y no directo a la base porque el formulario
 * publico exige captcha y la app ya viene con sesion.
 */
export async function GET(req: NextRequest) {
  const user = await usuarioDeBearer(req.headers.get('authorization'))
  if (!user?.email) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  const { data, error } = await serviceClient().from('contact_messages').select('id, message, status, created_at').ilike('email', user.email).order('created_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: 'No pudimos leer tus mensajes. Intenta de nuevo.' }, { status: 500 })
  return NextResponse.json({ mensajes: (data ?? []).map(mensajeParaApp) })
}

export async function POST(req: NextRequest) {
  const user = await usuarioDeBearer(req.headers.get('authorization'))
  if (!user?.email) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const invalido = validarMensaje(body.mensaje)
  if (invalido) return NextResponse.json({ error: invalido }, { status: 400 })
  const db = serviceClient()
  const { data: empresa } = await db.from('companies').select('name').eq('user_id', user.id).limit(1).maybeSingle()
  const nombre = nombreParaMensaje({ nombre: (user.user_metadata?.full_name as string | undefined) ?? (user.user_metadata?.name as string | undefined), empresa: empresa?.name, email: user.email })
  const mensaje = String(body.mensaje).trim()
  const { data, error } = await db.from('contact_messages').insert({ ...nombre, email: user.email, phone_number: null, message: mensaje, status: 'unread' }).select('id, message, status, created_at').single()
  if (error || !data) return NextResponse.json({ error: 'No se pudo guardar el mensaje. Intenta de nuevo.' }, { status: 500 })
  // Aviso a imSoft; si el correo falla, el mensaje ya quedo guardado y aparece en el panel.
  try {
    await getResend().emails.send({
      from: `imSoft <${process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io'}>`,
      to: process.env.ADMIN_NOTIFICATION_EMAIL || 'contacto@imsoft.io',
      replyTo: user.email,
      ...correoContacto({ nombre: [nombre.first_name, nombre.last_name].filter(Boolean).join(' '), email: user.email, mensaje: `${mensaje}\n\n(Enviado desde la app)`, panelUrl: `${SITE_URL}/es/dashboard/admin/contact-messages` }),
    })
  } catch (err) {
    console.error('[app/mensajes] aviso', err)
  }
  return NextResponse.json({ mensaje: mensajeParaApp(data) })
}
