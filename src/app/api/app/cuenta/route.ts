import { NextRequest, NextResponse } from 'next/server'
import { serviceClient } from '@/lib/quotes/server'
import { esAdmin } from '@/lib/roles'

/**
 * App movil: el cliente elimina su cuenta (Apple lo exige dentro de la app). Se quita su
 * acceso; la empresa y sus proyectos se conservan sin dueño, porque son registros de
 * facturacion de imSoft. La sesion se comprueba con el token que manda la app.
 */
export async function DELETE(req: NextRequest) {
  const token = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '').trim()
  if (!token) return NextResponse.json({ error: 'Falta la sesión.' }, { status: 401 })
  const db = serviceClient()
  const { data, error } = await db.auth.getUser(token)
  if (error || !data.user) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  // El administrador no se borra desde la app: dejaria el panel sin dueño.
  if (esAdmin(data.user)) return NextResponse.json({ error: 'La cuenta de administrador no se elimina desde la app.' }, { status: 403 })
  try {
    const { error: e1 } = await db.from('companies').update({ user_id: null }).eq('user_id', data.user.id)
    if (e1) throw new Error(e1.message)
    const { error: e2 } = await db.auth.admin.deleteUser(data.user.id)
    if (e2) throw new Error(e2.message)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[app/cuenta]', err)
    return NextResponse.json({ error: 'No pudimos eliminar la cuenta. Escríbenos y lo hacemos por ti.' }, { status: 500 })
  }
}
