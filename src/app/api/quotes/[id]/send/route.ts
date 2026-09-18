import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, SITE_URL, enviarCorreo, requireAdmin, serviceClient } from '@/lib/quotes/server'
import { correoCotizacionAlCliente } from '@/lib/email/plantillas'
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
  const whatsapp = `https://wa.me/523325365558?text=${encodeURIComponent(`Hola Brandon, tengo una duda sobre la cotización ${q.folio}.`)}`
  const correo = correoCotizacionAlCliente({
    cliente: q.client_name,
    folio: q.folio,
    titulo: q.title,
    total: mxn(t.total, q.currency),
    ivaIncluido: Boolean(q.apply_iva),
    vigencia: fechaLarga(q.valid_until),
    enlace: url,
    whatsapp,
    descuento: t.descuento > 0 ? `${mxn(t.descuento, q.currency)} · ${q.discount?.motivo ?? ''}` : null,
  })
  await enviarCorreo({ to: q.client_email, replyTo: ADMIN_EMAIL, ...correo })
  if (q.status === 'draft') await db.from('quotes').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id)
  return NextResponse.json({ ok: true })
}
