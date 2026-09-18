import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, clientIp, enviarCorreo, serviceClient } from '@/lib/quotes/server'
import { correoCotizacionAceptada } from '@/lib/email/plantillas'
import { motivoNoAceptable, mxn, totales } from '@/lib/cotizaciones'

/** El cliente acepta la cotizacion desde el enlace publico. Guarda nombre, fecha, IP y navegador. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await req.json().catch(() => ({}))
  const nombre = String(body.nombre ?? '').trim()
  if (nombre.length < 3) return NextResponse.json({ error: 'Escribe tu nombre completo para aceptar.' }, { status: 400 })
  if (!body.acepta) return NextResponse.json({ error: 'Marca la casilla de aceptación.' }, { status: 400 })

  const db = serviceClient()
  const { data: q } = await db.from('quotes').select('*').eq('token', token).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  const motivo = motivoNoAceptable(q)
  if (motivo) return NextResponse.json({ error: motivo }, { status: 409 })

  const ahora = new Date().toISOString()
  const { error } = await db
    .from('quotes')
    .update({ status: 'accepted', accepted_at: ahora, accepted_name: nombre, accepted_ip: clientIp(req.headers), accepted_user_agent: req.headers.get('user-agent') ?? null, updated_at: ahora })
    .eq('id', q.id)
    .eq('status', 'sent')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    const correo = correoCotizacionAceptada({ nombre, folio: q.folio, titulo: q.title, cliente: q.client_name, empresa: q.client_company, total: mxn(totales(q).total, q.currency), quoteId: q.id, fecha: new Date(ahora) })
    await enviarCorreo({ to: ADMIN_EMAIL, ...correo })
  } catch (e) {
    console.error('[quotes] aviso de aceptación no enviado:', e)
  }
  return NextResponse.json({ ok: true })
}
