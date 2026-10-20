import { NextRequest, NextResponse } from 'next/server'
import { usuarioDeBearer } from '@/lib/app-sesion'
import { serviceClient } from '@/lib/quotes/server'
import { comentarioParaApp, validarComentario } from '@/lib/app-mensajes'

/** App movil: comentarios (feedback) del cliente, los mismos que en el panel web. */
export async function GET(req: NextRequest) {
  const user = await usuarioDeBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  const { data, error } = await serviceClient().from('feedbacks').select('id, title, description, status, admin_notes, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: 'No pudimos leer tus comentarios. Intenta de nuevo.' }, { status: 500 })
  return NextResponse.json({ comentarios: (data ?? []).map(comentarioParaApp) })
}

export async function POST(req: NextRequest) {
  const user = await usuarioDeBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const invalido = validarComentario(body.titulo, body.descripcion)
  if (invalido) return NextResponse.json({ error: invalido }, { status: 400 })
  const { data, error } = await serviceClient().from('feedbacks').insert({ user_id: user.id, title: String(body.titulo).trim(), description: String(body.descripcion).trim(), status: 'pending' }).select('id, title, description, status, admin_notes, created_at').single()
  if (error || !data) return NextResponse.json({ error: 'No se pudo guardar el comentario. Intenta de nuevo.' }, { status: 500 })
  return NextResponse.json({ comentario: comentarioParaApp(data) })
}
