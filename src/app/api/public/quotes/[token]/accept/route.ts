import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, SITE_URL, clientIp, enviarCorreo, esc, serviceClient } from '@/lib/quotes/server'
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
    await enviarCorreo({
      to: ADMIN_EMAIL,
      subject: `✓ Cotización aceptada: ${q.folio} · ${q.title}`,
      html: `<p><strong>${esc(nombre)}</strong> aceptó la cotización <strong>${esc(q.folio)}</strong> (${esc(q.title)}) por ${mxn(totales(q).total, q.currency)}.</p><p><a href="${SITE_URL}/es/dashboard/admin/cotizaciones/${q.id}">Abrir en el panel</a> para generar el contrato y el enlace de pago.</p>`,
    })
  } catch (e) {
    console.error('[quotes] aviso de aceptación no enviado:', e)
  }
  return NextResponse.json({ ok: true })
}
