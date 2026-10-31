import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, SITE_URL, sendEmail, requireAdmin, serviceClient } from '@/lib/quotes/server'
import { quoteToClientEmail } from '@/lib/email/templates'
import { longDate, formatMoney, quoteTotals } from '@/lib/quotes'

/** Emails the quote to the client with the acceptance link, and marks it as sent. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const db = serviceClient()
  const { data: q } = await db.from('quotes').select('*').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  if (!q.client_email) return NextResponse.json({ error: 'La cotización no tiene correo del cliente' }, { status: 400 })

  const url = `${SITE_URL}/${q.lang}/cotizacion/${q.token}`
  const t = quoteTotals(q)
  const whatsapp = `https://wa.me/523325365558?text=${encodeURIComponent(`Hola Brandon, tengo una duda sobre la cotización ${q.number}.`)}`
  const email = quoteToClientEmail({
    client: q.client_name,
    number: q.number,
    title: q.title,
    total: formatMoney(t.total, q.currency),
    vatIncluded: Boolean(q.apply_iva),
    validUntil: longDate(q.valid_until),
    link: url,
    whatsapp,
    discount: t.discount > 0 ? `${formatMoney(t.discount, q.currency)} · ${q.discount?.reason ?? ''}` : null,
  })
  await sendEmail({ to: q.client_email, replyTo: ADMIN_EMAIL, ...email })
  if (q.status === 'draft') await db.from('quotes').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', id)
  return NextResponse.json({ ok: true })
}
