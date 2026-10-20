import { NextRequest, NextResponse } from 'next/server'
import { usuarioDeBearer } from '@/lib/app-sesion'
import { serviceClient } from '@/lib/quotes/server'
import { empresaParaApp, validarNombreEmpresa } from '@/lib/app-empresa'

const COLS = 'id, name, logo_url'

/** App movil: la empresa del cliente (la primera suya) y cambiarle el nombre o crearla. */
export async function GET(req: NextRequest) {
  const user = await usuarioDeBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  const { data } = await serviceClient().from('companies').select(COLS).eq('user_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle()
  return NextResponse.json({ empresa: data ? empresaParaApp(data) : null })
}

export async function PUT(req: NextRequest) {
  const user = await usuarioDeBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const invalido = validarNombreEmpresa(body.nombre)
  if (invalido) return NextResponse.json({ error: invalido }, { status: 400 })
  const nombre = String(body.nombre).trim()
  const db = serviceClient()
  const ahora = new Date().toISOString()
  const { data: actual } = await db.from('companies').select('id').eq('user_id', user.id).order('created_at', { ascending: true }).limit(1).maybeSingle()
  const r = actual
    ? await db.from('companies').update({ name: nombre, updated_at: ahora }).eq('id', actual.id).eq('user_id', user.id).select(COLS).single()
    : await db.from('companies').insert({ name: nombre, user_id: user.id }).select(COLS).single()
  if (r.error || !r.data) return NextResponse.json({ error: 'No se pudo guardar la empresa. Intenta de nuevo.' }, { status: 500 })
  return NextResponse.json({ empresa: empresaParaApp(r.data) })
}
