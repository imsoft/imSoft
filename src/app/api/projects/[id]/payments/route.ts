import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { notifyClient, paymentNotice } from '@/lib/mobile-app/notifications'
import { parsePayment } from '@/lib/payments'

/**
 * POST /api/projects/[id]/payments
 * Records a payment from the dashboard and notifies the client on their phone. The dashboard
 * used to insert straight into the database; it goes through here so the notice is sent in
 * the same step.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
  const { id: projectId } = await params
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const payment = parsePayment(b)
  if (!payment) return NextResponse.json({ error: 'Datos del pago incompletos.' }, { status: 400 })
  const db = serviceClient()
  const { data, error } = await db.from('project_payments').insert({ project_id: projectId, ...payment }).select().single()
  if (error) {
    console.error('[payments]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  await notifyClient(db, projectId, (project) => paymentNotice({ project, amount: payment.amount, currency: payment.currency, status: payment.status, projectId }))
  return NextResponse.json(data)
}
