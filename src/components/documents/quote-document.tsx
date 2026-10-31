import { DocumentHeader } from './document-header'
import { longDate, milestoneAmounts, formatMoney, paymentOptions, deliveryTerm, paymentTermsText, monthlyPaymentsText, quoteTotals, type QuoteLike } from '@/lib/quotes'
import { PROVIDER_SIGNER, SignatureBlock } from './signature-block'

/**
 * The quote as the client sees it: in the panel (preview), on the public acceptance
 * page and when printed to PDF. No interactivity; the accept button lives outside this
 * component.
 */
export function QuoteDocument({ quote }: { quote: QuoteLike & { created_at?: string | null } }) {
  const t = quoteTotals(quote)
  const term = deliveryTerm(quote)
  const milestones = milestoneAmounts(t.total, quote.payment.milestones)
  const paymentTerms = paymentTermsText(quote)
  const options = paymentOptions(quote)
  return (
    <article className="doc mx-auto max-w-3xl bg-white text-neutral-900 p-8 md:p-12 rounded-xl shadow-sm print:shadow-none print:p-0 print:max-w-none">
      <DocumentHeader
        kind="Cotización"
        number={quote.number}
        extra={<p className="text-sm text-neutral-600 mt-2">Vigente hasta el {longDate(quote.valid_until)}</p>}
      />

      <section className="grid gap-6 sm:grid-cols-2 py-6 border-b border-neutral-200">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Para</p>
          <p className="font-semibold">{quote.client_name}</p>
          {quote.client_company && <p className="text-sm text-neutral-700">{quote.client_company}</p>}
          {quote.client_rfc && <p className="text-sm text-neutral-600">RFC {quote.client_rfc}</p>}
          {quote.client_address && <p className="text-sm text-neutral-600">{quote.client_address}</p>}
          {quote.client_email && <p className="text-sm text-neutral-600">{quote.client_email}</p>}
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-1">Proyecto</p>
          <p className="font-semibold text-lg leading-snug">{quote.title}</p>
          {quote.intro && <p className="text-sm text-neutral-700 mt-1 whitespace-pre-line">{quote.intro}</p>}
        </div>
      </section>

      {(quote.features ?? []).filter((f) => f.trim()).length > 0 && (
        <section className="py-6 border-b border-neutral-200">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Qué incluye · {(quote.features ?? []).filter((f) => f.trim()).length} características</p>
          <ol className="grid gap-2 sm:grid-cols-2 text-sm">
            {(quote.features ?? []).filter((f) => f.trim()).map((f, i) => (
              <li key={i} className="flex gap-2"><span className="w-6 shrink-0 text-right tabular-nums text-primary font-semibold">{i + 1}.</span><span>{f}</span></li>
            ))}
          </ol>
        </section>
      )}

      <section className="py-6">
        <div className="ml-auto max-w-xs text-sm space-y-1">
          {t.discount > 0 ? (
            <>
              <div className="flex justify-between"><span className="text-neutral-600">Precio de lista</span><span className="tabular-nums line-through text-neutral-500">{formatMoney(t.listPrice, quote.currency)}</span></div>
              <div className="flex justify-between gap-3 text-emerald-700"><span>Descuento · {quote.discount?.reason}{quote.discount?.type === 'pct' ? ` (−${quote.discount.value} %)` : ''}</span><span className="tabular-nums shrink-0">−{formatMoney(t.discount, quote.currency)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Precio con descuento</span><span className="tabular-nums">{formatMoney(t.subtotal, quote.currency)}</span></div>
            </>
          ) : (
            <div className="flex justify-between"><span className="text-neutral-600">Precio del proyecto</span><span className="tabular-nums">{formatMoney(t.subtotal, quote.currency)}</span></div>
          )}
          {quote.apply_iva && <div className="flex justify-between"><span className="text-neutral-600">IVA 16 %</span><span className="tabular-nums">{formatMoney(t.vat, quote.currency)}</span></div>}
          <div className="flex justify-between text-lg font-bold border-t border-neutral-200 pt-2"><span>Total</span><span className="tabular-nums">{formatMoney(t.total, quote.currency)}</span></div>
          {t.discount > 0 && <p className="text-xs text-neutral-500 pt-1">Descuento válido si la cotización se acepta a más tardar el {longDate(quote.valid_until)}.</p>}
        </div>
      </section>

      {options.length > 1 && (
        <section className="py-6 border-t border-neutral-200 text-sm">
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-3">Elige cómo pagar</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {options.map((o) => (
              <div key={o.key} className={`rounded-lg border p-3 ${quote.accepted_payment_option === o.key ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200'}`}>
                <div className="flex justify-between gap-3"><span className="font-medium">{o.title}</span><span className="tabular-nums font-semibold shrink-0">{formatMoney(o.total, quote.currency)}</span></div>
                <p className="text-neutral-600 mt-0.5">{o.summary}</p>
                {quote.accepted_payment_option === o.key && <p className="text-xs font-medium mt-1">Opción elegida</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-6 sm:grid-cols-2 py-6 border-t border-neutral-200 text-sm">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Forma de pago</p>
          <ul className="space-y-1">
            {milestones.map((h) => {
              const m = monthlyPaymentsText(h.amount, h, quote.currency)
              return <li key={h.label}><span className="font-medium">{h.label}:</span> {h.pct} % · {formatMoney(h.amount, quote.currency)}{m && <span className="block text-neutral-600">{m}, por transferencia</span>}</li>
            })}
            {paymentTerms.slice(milestones.length).map((l, i) => <li key={i} className="text-neutral-600">{l}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Condiciones</p>
          <ul className="space-y-1 text-neutral-700">
            <li>Entrega: a más tardar el {term.text}.</li>
            <li>Garantía de {quote.terms.warranty_days} días naturales tras la entrega.</li>
            <li>{quote.terms.support}</li>
            <li>{quote.terms.ownership}</li>
            <li>{quote.terms.scope_changes}</li>
            {quote.terms.daily_penalty > 0 && <li>Retrasos del cliente en insumos: {formatMoney(quote.terms.daily_penalty, quote.currency)} por día hábil a partir del quinto.</li>}
            <li>Precio fijo: no hay cobros adicionales sobre lo aquí cotizado.</li>
          </ul>
        </div>
      </section>

      {quote.notes && (
        <section className="py-4 border-t border-neutral-200 text-sm text-neutral-700 whitespace-pre-line">{quote.notes}</section>
      )}

      <SignatureBlock
        caption="Aceptación de la cotización. Al firmar, o al aceptar en línea, el cliente acepta el alcance, el precio, la forma de pago y las condiciones descritas."
        signers={[
          PROVIDER_SIGNER,
          {
            title: 'El Cliente',
            name: quote.client_name,
            detail: quote.client_company ?? null,
            acceptedText: quote.accepted_at
              ? `Aceptada en línea por ${quote.accepted_name} el ${new Date(quote.accepted_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`
              : null,
          },
        ]}
      />
    </article>
  )
}
