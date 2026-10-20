import { NextRequest, NextResponse } from 'next/server'
import { usuarioDeBearer } from '@/lib/app-sesion'
import { contratosDelCliente } from '@/lib/documentos-cliente'
import { serviceClient, SITE_URL } from '@/lib/quotes/server'

/** App movil: contratos del cliente (enviados y firmados), con su enlace publico. */
export async function GET(req: NextRequest) {
  const user = await usuarioDeBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  try {
    return NextResponse.json({ contratos: await contratosDelCliente(serviceClient(), user, SITE_URL) })
  } catch (e) {
    console.error('[app/contratos]', e)
    return NextResponse.json({ error: 'No pudimos leer tus contratos. Intenta de nuevo.' }, { status: 500 })
  }
}
