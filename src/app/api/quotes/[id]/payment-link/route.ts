import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL, requireAdmin, serviceClient } from '@/lib/quotes/server'
import { stripe } from '@/lib/stripe'
import { montoConRecargo, validarCobro } from '@/lib/cobro-tarjeta'
import { esPlazo, firmarEnlace, nuevoIdEnlace, secretoDeEnlaces } from '@/lib/enlace-pago'

/**
 * Card payment link from a quote, without converting it into a project: free amount +
 * optional surcharge and a fixed term (single payment or 3/6/12 interest-free months).
 * One payment per link.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!stripe) return NextResponse.json({ error: 'Falta STRIPE_SECRET_KEY en el entorno.' }, { status: 500 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const amount = Number(body.amount)
  const surchargePct = Number(body.surchargePct) || 0
  const error = validarCobro(amount, surchargePct)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const { data: q } = await serviceClient().from('quotes').select('id, number, lang').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })

  const charge = montoConRecargo(amount, surchargePct)
  const label = typeof body.label === 'string' && body.label.trim() ? body.label.trim().slice(0, 80) : 'Pago'
  if (body.term !== undefined && !esPlazo(Number(body.term))) return NextResponse.json({ error: 'El plazo debe ser 0, 3, 6 o 12 meses.' }, { status: 400 })
  const term = body.term === undefined ? undefined : (Number(body.term) as 0 | 3 | 6 | 12)
  // imsoft.io link: with a term, the charge happens on our page with that exact plan;
  // without one (old API clients) it goes to Checkout with installments on or off.
  // The signed token keeps the payments module's Spanish keys (monto, recargoPct, etiqueta, plazo).
  const token = firmarEnlace({ id: nuevoIdEnlace(), quoteId: q.id, monto: amount, recargoPct: surchargePct, etiqueta: label, msi: term === undefined ? Boolean(body.msi) : term > 0, ...(term === undefined ? {} : { plazo: term }) }, secretoDeEnlaces(process.env.STRIPE_SECRET_KEY))
  const lang = q.lang === 'en' ? 'en' : 'es'
  return NextResponse.json({ url: `${SITE_URL}/${lang}/pagar/${token}`, charge })
}
