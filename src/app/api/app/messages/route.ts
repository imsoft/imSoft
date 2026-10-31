import { NextRequest, NextResponse } from 'next/server'
import { correoContacto } from '@/lib/email/plantillas'
import { getResend } from '@/lib/email/resend-client'
import { bodyField, legacyMessage } from '@/lib/mobile-app/legacy'
import { messageForApp, senderName, validateMessage } from '@/lib/mobile-app/messages'
import { INVALID_SESSION, userFromBearer } from '@/lib/mobile-app/session'
import { serviceClient, SITE_URL } from '@/lib/quotes/server'

const COLUMNS = 'id, message, status, created_at'

/**
 * Mobile app: the messages the client has written to imSoft (the same ones they see in the web
 * panel) and sending a new one. It goes through here instead of straight to the database
 * because the public form requires a captcha and the app already has a session.
 */
export async function GET(req: NextRequest) {
  const user = await userFromBearer(req.headers.get('authorization'))
  if (!user?.email) return NextResponse.json({ error: INVALID_SESSION }, { status: 401 })
  const { data, error } = await serviceClient().from('contact_messages').select(COLUMNS).ilike('email', user.email).order('created_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: 'No pudimos leer tus mensajes. Intenta de nuevo.' }, { status: 500 })
  const messages = (data ?? []).map(messageForApp)
  return NextResponse.json({ messages, mensajes: messages.map(legacyMessage) })
}

export async function POST(req: NextRequest) {
  const user = await userFromBearer(req.headers.get('authorization'))
  if (!user?.email) return NextResponse.json({ error: INVALID_SESSION }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const raw = bodyField(body, 'message', 'mensaje')
  const invalid = validateMessage(raw)
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })
  const db = serviceClient()
  const { data: company } = await db.from('companies').select('name').eq('user_id', user.id).limit(1).maybeSingle()
  const sender = senderName({ name: (user.user_metadata?.full_name as string | undefined) ?? (user.user_metadata?.name as string | undefined), company: company?.name, email: user.email })
  const text = String(raw).trim()
  const { data, error } = await db.from('contact_messages').insert({ ...sender, email: user.email, phone_number: null, message: text, status: 'unread' }).select(COLUMNS).single()
  if (error || !data) return NextResponse.json({ error: 'No se pudo guardar el mensaje. Intenta de nuevo.' }, { status: 500 })
  // Notify imSoft; if the email fails, the message is already saved and shows up in the panel.
  try {
    await getResend().emails.send({
      from: `imSoft <${process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io'}>`,
      to: process.env.ADMIN_NOTIFICATION_EMAIL || 'contacto@imsoft.io',
      replyTo: user.email,
      ...correoContacto({ nombre: [sender.first_name, sender.last_name].filter(Boolean).join(' '), email: user.email, mensaje: `${text}\n\n(Enviado desde la app)`, panelUrl: `${SITE_URL}/es/dashboard/admin/contact-messages` }),
    })
  } catch (err) {
    console.error('[app/messages] notice', err)
  }
  const message = messageForApp(data)
  return NextResponse.json({ message, mensaje: legacyMessage(message) })
}
