import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { hasLocale } from '../../dictionaries'
import { SITE_URL, serviceClient } from '@/lib/quotes/server'
import { stripe } from '@/lib/stripe'
import { montoConRecargo } from '@/lib/cobro-tarjeta'
import { consultaPagado, leerEnlace, secretoDeEnlaces } from '@/lib/enlace-pago'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pago con tarjeta · imSoft', robots: { index: false, follow: false } }

/**
 * Enlace de cobro de una cotizacion. Cada vez que se abre crea una sesion de Checkout de
 * Stripe (duran 24 h) con los meses sin intereses encendidos o apagados segun el enlace,
 * y manda al cliente ahi. Si ya se pago, lo dice en vez de cobrar dos veces.
 */
export default async function Pagar({ params }: { params: Promise<{ lang: string; token: string }> }) {
  const { lang, token } = await params
  if (!hasLocale(lang)) notFound()
  const es = lang !== 'en'
  if (!stripe) return <Aviso titulo={es ? 'El cobro con tarjeta no está disponible' : 'Card payments are unavailable'} texto={es ? 'Escríbenos por WhatsApp y te compartimos otra forma de pago.' : 'Message us and we will share another payment method.'} />

  const d = leerEnlace(token, secretoDeEnlaces(process.env.STRIPE_SECRET_KEY))
  if (!d) return <Aviso titulo={es ? 'Enlace no válido' : 'Invalid link'} texto={es ? 'Revisa que el enlace esté completo o pide uno nuevo.' : 'Check the link is complete or ask for a new one.'} />

  const { data: q } = await serviceClient().from('quotes').select('folio, title, currency, token').eq('id', d.quoteId).maybeSingle()
  if (!q) return <Aviso titulo={es ? 'Enlace no válido' : 'Invalid link'} texto={es ? 'La cotización de este enlace ya no existe.' : 'The quote for this link no longer exists.'} />

  const pagado = await stripe.paymentIntents.search({ query: consultaPagado(d.id), limit: 1 })
  if (pagado.data.length) return <Aviso titulo={es ? 'Este pago ya está hecho' : 'This payment is already done'} texto={es ? `Recibimos el pago de ${d.etiqueta} de la cotización ${q.folio}. ¡Gracias!` : `We received the payment for quote ${q.folio}. Thank you!`} />

  const cobro = montoConRecargo(d.monto, d.recargoPct)
  const metadata = { enlace: d.id, quote_id: d.quoteId, folio: q.folio, monto_base: String(d.monto), recargo_pct: String(d.recargoPct), msi: d.msi ? '1' : '0' }
  const volver = `${SITE_URL}/${lang}/cotizacion/${q.token}`
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: es ? 'es-419' : 'en',
    line_items: [{ price_data: { currency: String(q.currency || 'MXN').toLowerCase(), product_data: { name: `${q.title} · ${d.etiqueta}`, description: `Cotización ${q.folio}` }, unit_amount: Math.round(cobro * 100) }, quantity: 1 }],
    payment_method_types: ['card'],
    // Lo que el enlace de Stripe no permitia: MSI solo si la cotizacion los ofrece.
    payment_method_options: { card: { installments: { enabled: d.msi } } },
    metadata,
    payment_intent_data: { metadata, description: `${q.folio} · ${d.etiqueta}` },
    success_url: `${volver}?pago=ok`,
    cancel_url: volver,
  })
  if (!session.url) return <Aviso titulo={es ? 'No se pudo abrir el pago' : 'Could not open the payment'} texto={es ? 'Intenta de nuevo en unos minutos.' : 'Please try again in a few minutes.'} />
  redirect(session.url)
}

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/imsoft-isotipo-correo-v3.png" alt="imSoft" width={40} height={52} className="mx-auto mb-6" />
        <h1 className="text-xl font-semibold text-neutral-900">{titulo}</h1>
        <p className="mt-3 text-sm text-neutral-600">{texto}</p>
      </div>
    </main>
  )
}
