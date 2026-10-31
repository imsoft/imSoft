import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { paymentOptions, quoteTotals } from '@/lib/quotes'

/** Creates the project from the accepted quote and links it. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const db = serviceClient()
  const { data: q } = await db.from('quotes').select('*').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  if (q.status !== 'accepted') return NextResponse.json({ error: 'Solo se convierte una cotización aceptada' }, { status: 400 })
  if (q.project_id) return NextResponse.json({ id: q.project_id, existed: true })

  const t = quoteTotals(q)
  // The project is charged for what the client chose when accepting: by transfer it is
  // less than the list price, with installments or the plan it is more (see paymentOptions). No choice, list price.
  const chosen = paymentOptions(q).find((o) => o.key === q.accepted_payment_option)
  const totalToCharge = chosen?.total ?? t.total
  const withInstallments = chosen ? chosen.key === 'installments_6' || chosen.key === 'installments_12' : Boolean(q.payment?.card_installments)
  const { data: project, error } = await db
    .from('projects')
    .insert({
      title_es: q.title,
      title: q.title,
      description_es: q.intro ?? null,
      description: q.intro ?? null,
      client: q.client_company || q.client_name,
      company_id: q.company_id ?? null,
      status: 'planning',
      start_date: new Date().toISOString().slice(0, 10),
      total_price: totalToCharge,
      currency: q.currency,
      // Installments only if the client chose to pay that way (or, with no choice, if the quote offered them).
      stripe_enable_installments: withInstallments,
      stripe_installment_options: withInstallments ? JSON.stringify(chosen?.key === 'installments_6' ? [6] : chosen?.key === 'installments_12' ? [12] : [3, 6, 12]) : null,
    })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await db.from('quotes').update({ project_id: project.id }).eq('id', id)
  return NextResponse.json({ id: project.id })
}
