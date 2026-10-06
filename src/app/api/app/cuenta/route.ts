import { NextRequest, NextResponse } from 'next/server'
import { serviceClient } from '@/lib/quotes/server'
import { esAdmin } from '@/lib/roles'
import { usuarioDeBearer } from '@/lib/app-sesion'

/**
 * App movil: el cliente elimina su cuenta (Apple lo exige dentro de la app). Se quita su
 * acceso; la empresa y sus proyectos se conservan sin dueño, porque son registros de
 * facturacion de imSoft. La sesion se comprueba con el token que manda la app.
 */
export async function DELETE(req: NextRequest) {
  const user = await usuarioDeBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  // El administrador no se borra desde la app: dejaria el panel sin dueño.
  if (esAdmin(user)) return NextResponse.json({ error: 'La cuenta de administrador no se elimina desde la app.' }, { status: 403 })
  const db = serviceClient()
  try {
    const { error: e1 } = await db.from('companies').update({ user_id: null }).eq('user_id', user.id)
    if (e1) throw new Error(e1.message)
    const { error: e2 } = await db.auth.admin.deleteUser(user.id)
    if (e2) throw new Error(e2.message)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[app/cuenta]', err)
    return NextResponse.json({ error: 'No pudimos eliminar la cuenta. Escríbenos y lo hacemos por ti.' }, { status: 500 })
  }
}
