import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { hasLocale } from '../../dictionaries'
import { SITE_URL, serviceClient } from '@/lib/quotes/server'
import { stripe } from '@/lib/stripe'
import { montoConRecargo } from '@/lib/cobro-tarjeta'
import { consultaPagado, leerEnlace, secretoDeEnlaces } from '@/lib/enlace-pago'
import { resumenPagoHecho } from '@/lib/pagar-plazo'
import { PagarTarjeta } from '@/components/pagar/pagar-tarjeta'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pago con tarjeta · imSoft', robots: { index: false, follow: false } }

/**
 * Enlace de cobro de una cotizacion. Cada vez que se abre crea una sesion de Checkout de
 * Stripe (duran 24 h) con los meses sin intereses encendidos o apagados segun el enlace,
 * y manda al cliente ahi. Al terminar, Stripe lo regresa aqui con ?pago=ok y se le confirma
 * monto, concepto y fecha. Si reabre el enlace, lo dice en vez de cobrar dos veces.
 */
export default async function Pagar({ params, searchParams }: { params: Promise<{ lang: string; token: string }>; searchParams: Promise<{ pago?: string }> }) {
  const { lang, token } = await params
  const { pago } = await searchParams
  if (!hasLocale(lang)) notFound()
  const es = lang !== 'en'
  if (!stripe) return <Aviso titulo={es ? 'El cobro con tarjeta no está disponible' : 'Card payments are unavailable'} texto={es ? 'Escríbenos por WhatsApp y te compartimos otra forma de pago.' : 'Message us and we will share another payment method.'} />

  const d = leerEnlace(token, secretoDeEnlaces(process.env.STRIPE_SECRET_KEY))
  if (!d) return <Aviso titulo={es ? 'Enlace no válido' : 'Invalid link'} texto={es ? 'Revisa que el enlace esté completo o pide uno nuevo.' : 'Check the link is complete or ask for a new one.'} />

  const { data: q } = await serviceClient().from('quotes').select('folio, title, currency, token, client_email').eq('id', d.quoteId).maybeSingle()
  if (!q) return <Aviso titulo={es ? 'Enlace no válido' : 'Invalid link'} texto={es ? 'La cotización de este enlace ya no existe.' : 'The quote for this link no longer exists.'} />

  const cobro = montoConRecargo(d.monto, d.recargoPct)
  const volverA = `${SITE_URL}/${lang}/cotizacion/${q.token}`
  const aqui = `${SITE_URL}/${lang}/pagar/${token}`
  const pagado = await stripe.paymentIntents.search({ query: consultaPagado(d.id), limit: 1 })
  if (pagado.data.length) {
    const pi = pagado.data[0]
    const r = resumenPagoHecho({ recien: pago === 'ok', cobro: pi.amount / 100, etiqueta: d.etiqueta, folio: q.folio, fecha: new Date(pi.created * 1000), currency: pi.currency.toUpperCase(), plazo: d.plazo }, es)
    return <Aviso titulo={r.titulo} texto={r.texto} detalle={r.detalle} enlace={{ href: volverA, texto: es ? 'Ver la cotización' : 'View the quote' }} exito={pago === 'ok'} />
  }
  // Volvio de Stripe con ?pago=ok pero el cobro aun no aparece en la busqueda (tarda unos segundos).
  if (pago === 'ok') return <Aviso titulo={es ? 'Estamos confirmando tu pago' : 'Confirming your payment'} texto={es ? `En unos segundos aparece aquí la confirmación de ${d.etiqueta}. Si tu banco pidió autorización y la cancelaste, puedes volver a abrir el enlace para intentar de nuevo.` : `The confirmation for ${d.etiqueta} appears here in a few seconds.`} enlace={{ href: aqui, texto: es ? 'Actualizar' : 'Refresh' }} />
  // Con plazo fijo el cobro se hace aqui: el cliente solo puede pagar con el plan acordado.
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (d.plazo !== undefined && pk) {
    return <PagarTarjeta token={token} lang={lang} publishableKey={pk} concepto={`${q.title} · ${d.etiqueta}`} folio={q.folio} cobro={cobro} currency={String(q.currency || 'MXN')} plazo={d.plazo} volver={`${aqui}?pago=ok`} />
  }
  const metadata = { enlace: d.id, quote_id: d.quoteId, folio: q.folio, monto_base: String(d.monto), recargo_pct: String(d.recargoPct), msi: d.msi ? '1' : '0' }
  const volver = volverA
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: es ? 'es-419' : 'en',
    line_items: [{ price_data: { currency: String(q.currency || 'MXN').toLowerCase(), product_data: { name: `${q.title} · ${d.etiqueta}`, description: `Cotización ${q.folio}` }, unit_amount: Math.round(cobro * 100) }, quantity: 1 }],
    payment_method_types: ['card'],
    ...(q.client_email ? { customer_email: q.client_email } : {}),
    // Lo que el enlace de Stripe no permitia: MSI solo si la cotizacion los ofrece.
    payment_method_options: { card: { installments: { enabled: d.msi } } },
    metadata,
    payment_intent_data: { metadata, description: `${q.folio} · ${d.etiqueta}`, ...(q.client_email ? { receipt_email: q.client_email } : {}) },
    // De regreso cae en esta misma pagina, que ya sabe que se pago y se lo confirma.
    success_url: `${aqui}?pago=ok`,
    cancel_url: volver,
  })
  if (!session.url) return <Aviso titulo={es ? 'No se pudo abrir el pago' : 'Could not open the payment'} texto={es ? 'Intenta de nuevo en unos minutos.' : 'Please try again in a few minutes.'} />
  redirect(session.url)
}

function Aviso({ titulo, texto, detalle, enlace, exito }: { titulo: string; texto: string; detalle?: string; enlace?: { href: string; texto: string }; exito?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/imsoft-isotipo-correo-v3.png" alt="imSoft" width={40} height={52} className="mx-auto mb-6" />
        {exito && <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700" aria-hidden>✓</div>}
        <h1 className="text-xl font-semibold text-neutral-900">{titulo}</h1>
        <p className="mt-3 text-sm text-neutral-600">{texto}</p>
        {detalle && <p className="mt-2 text-sm text-neutral-500">{detalle}</p>}
        {enlace && <a href={enlace.href} className="mt-6 inline-block rounded-lg bg-[#1E9DF1] px-5 py-2.5 text-sm font-semibold text-white">{enlace.texto}</a>}
      </div>
    </main>
  )
}
