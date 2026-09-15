import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, SITE_URL, enviarCorreo, esc, requireAdmin, serviceClient } from '@/lib/quotes/server'
import { fechaLarga, mxn, totales } from '@/lib/cotizaciones'

/** Manda la cotizacion al cliente por correo con el enlace de aceptacion, y la marca como enviada. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const db = serviceClient()
  const { data: q } = await db.from('quotes').select('*').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  if (!q.client_email) return NextResponse.json({ error: 'La cotización no tiene correo del cliente' }, { status: 400 })

  const url = `${SITE_URL}/${q.lang}/cotizacion/${q.token}`
  const t = totales(q)
  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <p>Hola ${esc(q.client_name)},</p>
      <p>Te comparto la cotización <strong>${esc(q.folio)}</strong> para <strong>${esc(q.title)}</strong>: ${mxn(t.total, q.currency)}${q.apply_iva ? ' IVA incluido' : ''}, vigente hasta el ${fechaLarga(q.valid_until)}.</p>
      <p>La puedes revisar y aceptar en línea aquí:</p>
      <p><a href="${url}" style="display:inline-block;background:#1e88e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Ver cotización</a></p>
      <p style="color:#555;font-size:13px">Si tienes dudas, responde a este correo o escríbeme por WhatsApp al +52 33 2536 5558.</p>
      <p>Brandon García · imSoft</p>
    </div>`
  await enviarCorreo({ to: q.client_email, replyTo: ADMIN_EMAIL, subject: `Cotización ${q.folio} · ${q.title} · imSoft`, html })
  if (q.status === 'draft') await db.from('quotes').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id)
  return NextResponse.json({ ok: true })
}
