import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { abrirEnlace, metadataDeEnlace } from '@/lib/pagar-server'
import { tarjetaAdmitePlazo } from '@/lib/pagar-plazo'

/**
 * Paso 1 del cobro con plazo fijo: con la tarjeta ya tokenizada en el navegador, crea el
 * PaymentIntent (sin confirmar) y revisa que la tarjeta admita el plazo acordado. Si no lo
 * admite, cancela el intento y no se cobra nada.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (typeof body.token !== 'string' || typeof body.paymentMethodId !== 'string') return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  const r = await abrirEnlace(body.token)
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status })
  const { d, q, cobro, pagado } = r.enlace
  if (d.plazo === undefined) return NextResponse.json({ error: 'Este enlace se paga en Stripe Checkout.' }, { status: 400 })
  if (pagado) return NextResponse.json({ error: 'pagado' }, { status: 409 })
  const metadata = metadataDeEnlace(r.enlace)
  const pi = await stripe!.paymentIntents.create({
    amount: Math.round(cobro * 100),
    currency: String(q.currency || 'MXN').toLowerCase(),
    payment_method: body.paymentMethodId,
    payment_method_types: ['card'],
    description: `${q.folio} · ${d.etiqueta}`,
    ...(q.client_email ? { receipt_email: q.client_email } : {}),
    metadata,
    payment_method_options: { card: { installments: { enabled: d.plazo > 0 } } },
  })
  const planes = pi.payment_method_options?.card?.installments?.available_plans ?? []
  if (!tarjetaAdmitePlazo(planes, d.plazo)) {
    await stripe!.paymentIntents.cancel(pi.id).catch(() => {})
    return NextResponse.json({ error: 'sin-plazo', planes: planes.map((p) => p.count) }, { status: 422 })
  }
  return NextResponse.json({ intentId: pi.id })
}
