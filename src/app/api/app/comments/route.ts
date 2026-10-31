import { NextRequest, NextResponse } from 'next/server'
import { bodyField, legacyComment } from '@/lib/mobile-app/legacy'
import { commentForApp, validateComment } from '@/lib/mobile-app/messages'
import { INVALID_SESSION, userFromBearer } from '@/lib/mobile-app/session'
import { serviceClient } from '@/lib/quotes/server'

const COLUMNS = 'id, title, description, status, admin_notes, created_at'

/** Mobile app: the client's comments (feedback), the same ones as in the web panel. */
export async function GET(req: NextRequest) {
  const user = await userFromBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: INVALID_SESSION }, { status: 401 })
  const { data, error } = await serviceClient().from('feedbacks').select(COLUMNS).eq('user_id', user.id).order('created_at', { ascending: false }).limit(100)
  if (error) return NextResponse.json({ error: 'No pudimos leer tus comentarios. Intenta de nuevo.' }, { status: 500 })
  const comments = (data ?? []).map(commentForApp)
  return NextResponse.json({ comments, comentarios: comments.map(legacyComment) })
}

export async function POST(req: NextRequest) {
  const user = await userFromBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: INVALID_SESSION }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const title = bodyField(body, 'title', 'titulo')
  const description = bodyField(body, 'description', 'descripcion')
  const invalid = validateComment(title, description)
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })
  const { data, error } = await serviceClient().from('feedbacks').insert({ user_id: user.id, title: String(title).trim(), description: String(description).trim(), status: 'pending' }).select(COLUMNS).single()
  if (error || !data) return NextResponse.json({ error: 'No se pudo guardar el comentario. Intenta de nuevo.' }, { status: 500 })
  const comment = commentForApp(data)
  return NextResponse.json({ comment, comentario: legacyComment(comment) })
}
