import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { SITE_URL } from '@/lib/quotes/server'
import { abrirEnlace } from '@/lib/pagar-server'
import { planParaPlazo } from '@/lib/pagar-plazo'

/**
 * Paso 2: confirma el PaymentIntent con el plan exacto del enlace (o sin plan, a una
 * exhibicion). Si el banco pide 3D Secure, el navegador lo resuelve con el client_secret.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  if (typeof body.token !== 'string' || typeof body.intentId !== 'string') return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
  const r = await abrirEnlace(body.token)
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status })
  const { d, q, cobro, pagado } = r.enlace
  if (d.plazo === undefined) return NextResponse.json({ error: 'Este enlace se paga en Stripe Checkout.' }, { status: 400 })
  if (pagado) return NextResponse.json({ error: 'pagado' }, { status: 409 })
  const previo = await stripe!.paymentIntents.retrieve(body.intentId)
  // El intento tiene que ser de este enlace y por este monto: nadie confirma otro con este token.
  if (previo.metadata?.enlace !== d.id || previo.amount !== Math.round(cobro * 100)) return NextResponse.json({ error: 'El intento no corresponde a este enlace.' }, { status: 400 })
  if (previo.status === 'succeeded') return NextResponse.json({ status: 'succeeded' })
  const plan = planParaPlazo(d.plazo)
  const lang = q.lang === 'en' ? 'en' : 'es'
  try {
    const pi = await stripe!.paymentIntents.confirm(body.intentId, {
      return_url: `${SITE_URL}/${lang}/pagar/${body.token}`,
      payment_method_options: { card: { installments: plan ? { plan } : { enabled: false } } },
    })
    return NextResponse.json({ status: pi.status, clientSecret: pi.client_secret })
  } catch (err) {
    const e = err as { code?: string; decline_code?: string; message?: string }
    return NextResponse.json({ error: 'rechazada', code: e.decline_code || e.code || null, message: e.message ?? null }, { status: 402 })
  }
}
