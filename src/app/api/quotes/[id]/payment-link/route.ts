import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL, requireAdmin, serviceClient } from '@/lib/quotes/server'
import { stripe } from '@/lib/stripe'
import { montoConRecargo, validarCobro } from '@/lib/cobro-tarjeta'
import { firmarEnlace, nuevoIdEnlace, secretoDeEnlaces } from '@/lib/enlace-pago'

/**
 * Enlace de pago con tarjeta desde una cotizacion, sin convertirla en proyecto: monto
 * libre + recargo opcional, MSI solo si se piden. Un solo pago por enlace.
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

  const { data: q } = await serviceClient().from('quotes').select('id, folio, lang').eq('id', id).maybeSingle()
  if (!q) return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 })

  const cobro = montoConRecargo(monto, recargoPct)
  const etiqueta = typeof body.etiqueta === 'string' && body.etiqueta.trim() ? body.etiqueta.trim().slice(0, 80) : 'Pago'
  // Enlace de imsoft.io: al abrirse crea la sesion de Stripe con los MSI que diga la
  // cotizacion. Un Payment Link de Stripe no permite apagarlos (ver src/lib/enlace-pago.ts).
  const token = firmarEnlace({ id: nuevoIdEnlace(), quoteId: q.id, monto, recargoPct, etiqueta, msi: Boolean(body.msi) }, secretoDeEnlaces(process.env.STRIPE_SECRET_KEY))
  const lang = q.lang === 'en' ? 'en' : 'es'
  return NextResponse.json({ url: `${SITE_URL}/${lang}/pagar/${token}`, cobro })
}
