import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { totales } from '@/lib/cotizaciones'

/** Crea el proyecto a partir de la cotizacion aceptada y lo enlaza. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const db = serviceClient()
  const { data: q } = await db.from('quotes').select('*').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })
  if (q.status !== 'accepted') return NextResponse.json({ error: 'Solo se convierte una cotización aceptada' }, { status: 400 })
  if (q.project_id) return NextResponse.json({ id: q.project_id, existed: true })

  const t = totales(q)
  const { data: proyecto, error } = await db
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
      total_price: t.total,
      currency: q.currency,
      // La cotizacion decide si el proyecto se puede pagar a meses sin intereses.
      stripe_enable_installments: Boolean(q.payment?.msi),
      stripe_installment_options: q.payment?.msi ? JSON.stringify([3, 6, 12]) : null,
    })
    .select('id')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await db.from('quotes').update({ project_id: proyecto.id }).eq('id', id)
  return NextResponse.json({ id: proyecto.id })
}
