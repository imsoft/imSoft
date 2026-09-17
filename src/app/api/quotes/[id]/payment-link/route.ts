import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { stripe } from '@/lib/stripe'
import { montoConRecargo, validarCobro } from '@/lib/cobro-tarjeta'

/**
 * Enlace de pago de Stripe desde una cotizacion, sin necesidad de convertirla en proyecto:
 * monto libre + recargo opcional. El enlace se desactiva tras el primer pago.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!stripe) return NextResponse.json({ error: 'Falta STRIPE_SECRET_KEY en el entorno.' }, { status: 500 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const monto = Number(body.monto)
  const recargoPct = Number(body.recargoPct) || 0
  const error = validarCobro(monto, recargoPct)
  if (error) return NextResponse.json({ error }, { status: 400 })

  const { data: q } = await serviceClient().from('quotes').select('id, folio, title, currency, client_name').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })

  const cobro = montoConRecargo(monto, recargoPct)
  const etiqueta = typeof body.etiqueta === 'string' && body.etiqueta.trim() ? body.etiqueta.trim().slice(0, 80) : 'Pago'
  const metadata = { quote_id: q.id, folio: q.folio, monto_base: String(monto), recargo_pct: String(recargoPct) }
  try {
    const link = await stripe.paymentLinks.create({
      line_items: [{ price_data: { currency: String(q.currency || 'MXN').toLowerCase(), product_data: { name: `${q.title} · ${etiqueta}`, description: `Cotización ${q.folio}` }, unit_amount: Math.round(cobro * 100) }, quantity: 1 }],
      metadata,
      payment_intent_data: { metadata, description: `${q.folio} · ${etiqueta}` },
      restrictions: { completed_sessions: { limit: 1 } },
      // Con MSI el enlace se limita a tarjeta para que Stripe muestre los plazos.
      ...(body.msi ? { payment_method_types: ['card'] as const } : {}),
    })
    return NextResponse.json({ url: link.url, id: link.id, cobro })
  } catch (err) {
    console.error('[quotes/payment-link]', err)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Error de Stripe' }, { status: 500 })
  }
}
