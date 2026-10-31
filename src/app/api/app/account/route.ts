import { NextRequest, NextResponse } from 'next/server'
import { INVALID_SESSION, userFromBearer } from '@/lib/mobile-app/session'
import { serviceClient } from '@/lib/quotes/server'
import { esAdmin } from '@/lib/roles'

/**
 * Mobile app: the client deletes their account (Apple requires it inside the app). Their access
 * is removed; the company and its projects stay without an owner, because they're imSoft's
 * billing records. The session is checked with the token the app sends.
 */
export async function DELETE(req: NextRequest) {
  const user = await userFromBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: INVALID_SESSION }, { status: 401 })
  // The admin isn't deleted from the app: it would leave the panel without an owner.
  if (esAdmin(user)) return NextResponse.json({ error: 'La cuenta de administrador no se elimina desde la app.' }, { status: 403 })
  const db = serviceClient()
  try {
    const { error: unlinkError } = await db.from('companies').update({ user_id: null }).eq('user_id', user.id)
    if (unlinkError) throw new Error(unlinkError.message)
    const { error: deleteError } = await db.auth.admin.deleteUser(user.id)
    if (deleteError) throw new Error(deleteError.message)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[app/account]', err)
    return NextResponse.json({ error: 'No pudimos eliminar la cuenta. Escríbenos y lo hacemos por ti.' }, { status: 500 })
  }
}
