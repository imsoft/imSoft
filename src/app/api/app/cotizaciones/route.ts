import { NextRequest, NextResponse } from 'next/server'
import { usuarioDeBearer } from '@/lib/app-sesion'
import { cotizacionesParaApp } from '@/lib/app-cotizaciones'
import { serviceClient, SITE_URL } from '@/lib/quotes/server'

/**
 * App movil: cotizaciones del cliente. La tabla es solo de admin en la base, asi que se leen
 * aqui con service role y se filtran por el correo del cliente o por su empresa.
 */
export async function GET(req: NextRequest) {
  const user = await usuarioDeBearer(req.headers.get('authorization'))
  if (!user) return NextResponse.json({ error: 'La sesión no es válida. Vuelve a entrar.' }, { status: 401 })
  const db = serviceClient()
  const { data: empresas } = await db.from('companies').select('id').eq('user_id', user.id)
  const idsEmpresa = (empresas ?? []).map((e) => e.id as string)
  const condiciones = [user.email ? `client_email.ilike.${user.email.replace(/[,()]/g, '')}` : null, idsEmpresa.length ? `company_id.in.(${idsEmpresa.join(',')})` : null].filter(Boolean)
  if (!condiciones.length) return NextResponse.json({ cotizaciones: [] })
  const { data, error } = await db
    .from('quotes')
    .select('id, folio, title, status, items, apply_iva, discount, currency, valid_until, token, lang')
    .or(condiciones.join(','))
    .order('created_at', { ascending: false })
  if (error) {
    console.error('[app/cotizaciones]', error)
    return NextResponse.json({ error: 'No pudimos leer tus cotizaciones. Intenta de nuevo.' }, { status: 500 })
  }
  return NextResponse.json({ cotizaciones: cotizacionesParaApp(data ?? [], SITE_URL) })
}
