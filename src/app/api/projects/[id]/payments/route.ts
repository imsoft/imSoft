import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { notifyClient, paymentNotice } from '@/lib/mobile-app/notifications'
import { pagoValido } from '@/lib/pagos'

/**
 * POST /api/projects/[id]/payments
 * Registra un pago desde el panel y avisa al cliente en su telefono. Antes el panel insertaba
 * directo en la base; pasa por aqui para que el aviso salga en el mismo paso.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status })
  const { id: projectId } = await params
  const b = (await req.json().catch(() => null)) as Record<string, unknown> | null
  const pago = pagoValido(b)
  if (!pago) return NextResponse.json({ error: 'Datos del pago incompletos.' }, { status: 400 })
  const db = serviceClient()
  const { data, error } = await db.from('project_payments').insert({ project_id: projectId, ...pago }).select().single()
  if (error) {
    console.error('[payments]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  await notifyClient(db, projectId, (project) => paymentNotice({ project, amount: pago.amount, currency: pago.currency, status: pago.status, projectId }))
  return NextResponse.json(data)
}
