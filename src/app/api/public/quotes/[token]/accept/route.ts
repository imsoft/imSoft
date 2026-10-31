import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_EMAIL, clientIp, sendEmail, serviceClient } from '@/lib/quotes/server'
import { quoteAcceptedEmail } from '@/lib/email/templates'
import { isPaymentOptionKey, notAcceptableReason, formatMoney, paymentOptions, quoteTotals } from '@/lib/quotes'

/** The client accepts the quote from the public link. Stores name, date, IP and browser. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const body = await req.json().catch(() => ({}))
  const name = String(body.name ?? '').trim()
  if (name.length < 3) return NextResponse.json({ error: 'Escribe tu nombre completo para aceptar.' }, { status: 400 })
  if (!body.accepted) return NextResponse.json({ error: 'Marca la casilla de aceptación.' }, { status: 400 })

  const db = serviceClient()
  const { data: q } = await db.from('quotes').select('*').eq('token', token).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  const reason = notAcceptableReason(q)
  if (reason) return NextResponse.json({ error: reason }, { status: 409 })
  // The chosen payment option has to be one of those this quote offers.
  const options = paymentOptions(q)
  const paymentOption = isPaymentOptionKey(body.paymentOption) && options.some((o) => o.key === body.paymentOption) ? body.paymentOption : null
  if (!paymentOption && options.length > 1) return NextResponse.json({ error: 'Elige cómo prefieres pagar.' }, { status: 400 })

  const now = new Date().toISOString()
  const { error } = await db
    .from('quotes')
    .update({ status: 'accepted', accepted_at: now, accepted_name: name, accepted_payment_option: paymentOption ?? options[0]?.key ?? null, accepted_ip: clientIp(req.headers), accepted_user_agent: req.headers.get('user-agent') ?? null, updated_at: now })
    .eq('id', q.id)
    .eq('status', 'sent')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    const chosen = options.find((o) => o.key === (paymentOption ?? options[0]?.key))
    const email = quoteAcceptedEmail({ name, number: q.number, title: q.title, client: q.client_name, company: q.client_company, total: `${formatMoney(quoteTotals(q).total, q.currency)}${chosen ? ` · ${chosen.title}: ${chosen.summary}` : ''}`, quoteId: q.id, date: new Date(now) })
    await sendEmail({ to: ADMIN_EMAIL, ...email })
  } catch (e) {
    console.error('[quotes] acceptance notice not sent:', e)
  }
  return NextResponse.json({ ok: true })
}
