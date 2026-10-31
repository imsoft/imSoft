import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL, requireAdmin, serviceClient } from '@/lib/quotes/server'
import { stripe } from '@/lib/stripe'
import { planAmounts, validatePlan, quoteTotals } from '@/lib/quotes'
import { DIAS_PRIMERA_MENSUALIDAD, lineasDelPlan, metadataDelPlan } from '@/lib/plan-mensual'

/**
 * Stripe Checkout link for the monthly plan of a quote accepted with that option and
 * already converted into a project: it charges the deposit right away and leaves the
 * monthly subscription active, starting after the grace period. The webhook records each
 * charge in project_payments and cancels the subscription once the last fee is paid.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!stripe) return NextResponse.json({ error: 'Falta STRIPE_SECRET_KEY en el entorno.' }, { status: 500 })
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const firstPaymentDays = Number.isFinite(Number(body.firstPaymentDays)) ? Math.min(90, Math.max(0, Math.round(Number(body.firstPaymentDays)))) : DIAS_PRIMERA_MENSUALIDAD

  const { data: q } = await serviceClient().from('quotes').select('*').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  if (q.status !== 'accepted' || q.accepted_payment_option !== 'plan') return NextResponse.json({ error: 'El cliente no eligió el plan mensual en esta cotización.' }, { status: 400 })
  if (!q.project_id) return NextResponse.json({ error: 'Convierte la cotización en proyecto antes de generar el enlace del plan.' }, { status: 400 })
  const plan = q.payment?.plan
  const planError = validatePlan(plan)
  if (!plan || planError) return NextResponse.json({ error: planError ?? 'La cotización no tiene plan.' }, { status: 400 })

  const { deposit, monthlyFee } = planAmounts(quoteTotals(q).total, plan)
  const lang = q.lang === 'en' ? 'en' : 'es'
  const returnUrl = `${SITE_URL}/${lang}/cotizacion/${q.token}`
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    locale: lang === 'en' ? 'en' : 'es-419',
    line_items: lineasDelPlan({ titulo: q.title, currency: q.currency || 'MXN', anticipo: deposit, mensualidad: monthlyFee, months: plan.months }),
    ...(q.client_email ? { customer_email: q.client_email } : {}),
    metadata: { ...metadataDelPlan({ projectId: q.project_id, quoteId: q.id, plan }), quote_number: q.number },
    subscription_data: {
      metadata: metadataDelPlan({ projectId: q.project_id, quoteId: q.id, plan }),
      description: `${q.number} · ${q.title} · plan a ${plan.months} meses`,
      ...(firstPaymentDays > 0 ? { trial_period_days: firstPaymentDays } : {}),
    },
    success_url: `${returnUrl}?plan=ok`,
    cancel_url: `${returnUrl}?plan=cancelado`,
  })
  return NextResponse.json({ url: session.url, deposit, monthlyFee, months: plan.months, firstPaymentDays })
}
