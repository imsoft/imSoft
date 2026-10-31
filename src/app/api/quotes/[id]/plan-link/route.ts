import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL, requireAdmin, serviceClient } from '@/lib/quotes/server'
import { stripe } from '@/lib/stripe'
import { importesPlan, planValido, totales } from '@/lib/cotizaciones'
import { DIAS_PRIMERA_MENSUALIDAD, lineasDelPlan, metadataDelPlan } from '@/lib/plan-mensual'

/**
 * Enlace de Stripe Checkout para el plan mensual de una cotizacion aceptada con esa
 * opcion y ya convertida en proyecto: cobra el anticipo al momento y deja la suscripcion
 * mensual activa, que arranca tras el periodo de gracia. El webhook registra cada cobro
 * en project_payments y cancela la suscripcion al cubrirse la ultima mensualidad.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!stripe) return NextResponse.json({ error: 'Falta STRIPE_SECRET_KEY en el entorno.' }, { status: 500 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const dias = Number.isFinite(Number(body.diasPrimeraMensualidad)) ? Math.min(90, Math.max(0, Math.round(Number(body.diasPrimeraMensualidad)))) : DIAS_PRIMERA_MENSUALIDAD

  const { data: q } = await serviceClient().from('quotes').select('*').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  if (q.status !== 'accepted' || q.accepted_payment_option !== 'plan') return NextResponse.json({ error: 'El cliente no eligió el plan mensual en esta cotización.' }, { status: 400 })
  if (!q.project_id) return NextResponse.json({ error: 'Convierte la cotización en proyecto antes de generar el enlace del plan.' }, { status: 400 })
  const plan = q.payment?.plan
  const invalido = planValido(plan)
  if (!plan || invalido) return NextResponse.json({ error: invalido ?? 'La cotización no tiene plan.' }, { status: 400 })

  const { anticipo, mensualidad } = importesPlan(totales(q).total, plan)
  const lang = q.lang === 'en' ? 'en' : 'es'
  const vuelta = `${SITE_URL}/${lang}/cotizacion/${q.token}`
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    locale: lang === 'en' ? 'en' : 'es-419',
    line_items: lineasDelPlan({ titulo: q.title, currency: q.currency || 'MXN', anticipo, mensualidad, months: plan.months }),
    ...(q.client_email ? { customer_email: q.client_email } : {}),
    metadata: { ...metadataDelPlan({ projectId: q.project_id, quoteId: q.id, plan }), quote_number: q.number },
    subscription_data: {
      metadata: metadataDelPlan({ projectId: q.project_id, quoteId: q.id, plan }),
      description: `${q.number} · ${q.title} · plan a ${plan.months} meses`,
      ...(dias > 0 ? { trial_period_days: dias } : {}),
    },
    success_url: `${vuelta}?plan=ok`,
    cancel_url: `${vuelta}?plan=cancelado`,
  })
  return NextResponse.json({ url: session.url, anticipo, mensualidad, months: plan.months, diasPrimeraMensualidad: dias })
}
