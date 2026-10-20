import { NextRequest, NextResponse } from 'next/server'
import { usuarioDeBearer } from '@/lib/app-sesion'
import { cotizacionesDelCliente } from '@/lib/documentos-cliente'
import { serviceClient, SITE_URL } from '@/lib/quotes/server'

/** App movil: cotizaciones del cliente (la consulta compartida vive en documentos-cliente). */
export async function GET(req: NextRequest) {
  const user = await usuarioDeBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  try {
    return NextResponse.json({ cotizaciones: await cotizacionesDelCliente(serviceClient(), user, SITE_URL) })
  } catch (e) {
    console.error('[app/cotizaciones]', e)
    return NextResponse.json({ error: 'No pudimos leer tus cotizaciones. Intenta de nuevo.' }, { status: 500 })
  }
}
