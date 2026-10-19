import { NextRequest, NextResponse } from 'next/server'
import { SITE_URL, requireAdmin, serviceClient } from '@/lib/quotes/server'
import { stripe } from '@/lib/stripe'
import { montoConRecargo, validarCobro } from '@/lib/cobro-tarjeta'
import { esPlazo, firmarEnlace, nuevoIdEnlace, secretoDeEnlaces } from '@/lib/enlace-pago'

/**
 * Enlace de pago con tarjeta desde una cotizacion, sin convertirla en proyecto: monto
 * libre + recargo opcional y plazo fijo (una exhibicion o 3/6/12 MSI). Un solo pago por enlace.
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
  if (body.plazo !== undefined && !esPlazo(Number(body.plazo))) return NextResponse.json({ error: 'El plazo debe ser 0, 3, 6 o 12 meses.' }, { status: 400 })
  const plazo = body.plazo === undefined ? undefined : (Number(body.plazo) as 0 | 3 | 6 | 12)
  // Enlace de imsoft.io: con plazo, el cobro se hace en nuestra pagina con ese plan exacto;
  // sin plazo (clientes viejos del API) va a Checkout con los MSI encendidos o apagados.
  const token = firmarEnlace({ id: nuevoIdEnlace(), quoteId: q.id, monto, recargoPct, etiqueta, msi: plazo === undefined ? Boolean(body.msi) : plazo > 0, ...(plazo === undefined ? {} : { plazo }) }, secretoDeEnlaces(process.env.STRIPE_SECRET_KEY))
  const lang = q.lang === 'en' ? 'en' : 'es'
  return NextResponse.json({ url: `${SITE_URL}/${lang}/pagar/${token}`, cobro })
}
