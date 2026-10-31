import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { hasLocale } from '../../dictionaries'
import { SITE_URL, serviceClient } from '@/lib/quotes/server'
import { stripe } from '@/lib/stripe'
import { withSurcharge } from '@/lib/card-charge'
import { linkSigningSecret, paymentLinkMetadata, readPaymentLink } from '@/lib/payment-link-token'
import { PAID_RETURN_QUERY, isPaidReturn, paidSummary } from '@/lib/pay-term'
import { findLinkPayment } from '@/lib/pay-server'
import { CardPaymentForm } from '@/components/pay/card-payment-form'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Pago con tarjeta · imSoft', robots: { index: false, follow: false } }

/**
 * Payment link of a quote. Each time it's opened it creates a Stripe Checkout session
 * (they last 24 h) with interest-free installments on or off according to the link, and
 * sends the client there. When done, Stripe brings them back here with ?payment=ok (older
 * sessions use ?pago=ok) and amount, concept and date are confirmed. If the link is
 * reopened, it says so instead of charging twice.
 */
export default async function PayPage({ params, searchParams }: { params: Promise<{ lang: string; token: string }>; searchParams: Promise<{ payment?: string; pago?: string }> }) {
  const { lang, token } = await params
  const justPaid = isPaidReturn(await searchParams)
  if (!hasLocale(lang)) notFound()
  const es = lang !== 'en'
  if (!stripe) return <Notice title={es ? 'El cobro con tarjeta no está disponible' : 'Card payments are unavailable'} text={es ? 'Escríbenos por WhatsApp y te compartimos otra forma de pago.' : 'Message us and we will share another payment method.'} />

  const link = readPaymentLink(token, linkSigningSecret(process.env.STRIPE_SECRET_KEY))
  if (!link) return <Notice title={es ? 'Enlace no válido' : 'Invalid link'} text={es ? 'Revisa que el enlace esté completo o pide uno nuevo.' : 'Check the link is complete or ask for a new one.'} />

  const { data: q } = await serviceClient().from('quotes').select('number, title, currency, token, client_email').eq('id', link.quoteId).maybeSingle()
  if (!q) return <Notice title={es ? 'Enlace no válido' : 'Invalid link'} text={es ? 'La cotización de este enlace ya no existe.' : 'The quote for this link no longer exists.'} />

  const charge = withSurcharge(link.amount, link.surchargePct)
  const quoteUrl = `${SITE_URL}/${lang}/cotizacion/${q.token}`
  const here = `${SITE_URL}/${lang}/pagar/${token}`
  const pi = await findLinkPayment(link.id)
  if (pi) {
    const r = paidSummary({ justPaid, charge: pi.amount / 100, label: link.label, quoteNumber: q.number, date: new Date(pi.created * 1000), currency: pi.currency.toUpperCase(), term: link.term }, es)
    return <Notice title={r.title} text={r.text} detail={r.detail} link={{ href: quoteUrl, text: es ? 'Ver la cotización' : 'View the quote' }} success={justPaid} />
  }
  // Back from Stripe with ?payment=ok but the charge doesn't show in search yet (takes a few seconds).
  if (justPaid) return <Notice title={es ? 'Estamos confirmando tu pago' : 'Confirming your payment'} text={es ? `En unos segundos aparece aquí la confirmación de ${link.label}. Si tu banco pidió autorización y la cancelaste, puedes volver a abrir el enlace para intentar de nuevo.` : `The confirmation for ${link.label} appears here in a few seconds.`} link={{ href: here, text: es ? 'Actualizar' : 'Refresh' }} />
  // With a fixed term the charge happens here: the client can only pay with the agreed plan.
  const pk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  if (link.term !== undefined && pk) {
    return <CardPaymentForm token={token} lang={lang} publishableKey={pk} concept={`${q.title} · ${link.label}`} quoteNumber={q.number} charge={charge} currency={String(q.currency || 'MXN')} term={link.term} returnUrl={`${here}?${PAID_RETURN_QUERY}`} />
  }
  const metadata = paymentLinkMetadata({ link, quoteNumber: q.number })
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    locale: es ? 'es-419' : 'en',
    line_items: [{ price_data: { currency: String(q.currency || 'MXN').toLowerCase(), product_data: { name: `${q.title} · ${link.label}`, description: `Cotización ${q.number}` }, unit_amount: Math.round(charge * 100) }, quantity: 1 }],
    payment_method_types: ['card'],
    ...(q.client_email ? { customer_email: q.client_email } : {}),
    // What the Stripe Payment Link didn't allow: installments only if the quote offers them.
    payment_method_options: { card: { installments: { enabled: link.installments } } },
    metadata,
    payment_intent_data: { metadata, description: `${q.number} · ${link.label}`, ...(q.client_email ? { receipt_email: q.client_email } : {}) },
    // On return it lands on this same page, which already knows it was paid and confirms it.
    success_url: `${here}?${PAID_RETURN_QUERY}`,
    cancel_url: quoteUrl,
  })
  if (!session.url) return <Notice title={es ? 'No se pudo abrir el pago' : 'Could not open the payment'} text={es ? 'Intenta de nuevo en unos minutos.' : 'Please try again in a few minutes.'} />
  redirect(session.url)
}

function Notice({ title, text, detail, link, success }: { title: string; text: string; detail?: string; link?: { href: string; text: string }; success?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/imsoft-isotipo-correo-v3.png" alt="imSoft" width={40} height={52} className="mx-auto mb-6" />
        {success && <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700" aria-hidden>✓</div>}
        <h1 className="text-xl font-semibold text-neutral-900">{title}</h1>
        <p className="mt-3 text-sm text-neutral-600">{text}</p>
        {detail && <p className="mt-2 text-sm text-neutral-500">{detail}</p>}
        {link && <a href={link.href} className="mt-6 inline-block rounded-lg bg-[#1E9DF1] px-5 py-2.5 text-sm font-semibold text-white">{link.text}</a>}
      </div>
    </main>
  )
}
