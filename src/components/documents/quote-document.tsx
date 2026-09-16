import { DocumentHeader } from './document-header'
import { fechaLarga, importesHitos, mxn, plazoEntrega, textoFormaDePago, totales, type QuoteLike } from '@/lib/cotizaciones'
import { FIRMA_PRESTADOR, SignatureBlock } from './signature-block'

/**
 * La cotizacion tal como la ve el cliente: en el panel (vista previa), en la pagina
 * publica de aceptacion y al imprimir a PDF. Sin interactividad; el boton de aceptar
 * vive fuera de este componente.
 */
export function QuoteDocument({ quote }: { quote: QuoteLike & { created_at?: string | null } }) {
  const t = totales(quote)
  const plazo = plazoEntrega(quote)
  const hitos = importesHitos(t.total, quote.payment.hitos)
  const formaPago = textoFormaDePago(quote)
  return (
    <article className="doc mx-auto max-w-3xl bg-white text-neutral-900 p-8 md:p-12 rounded-xl shadow-sm print:shadow-none print:p-0 print:max-w-none">
      <DocumentHeader
        tipo="Cotización"
        folio={quote.folio}
        extra={<p className="text-sm text-neutral-600 mt-2">Vigente hasta el {fechaLarga(quote.valid_until)}</p>}
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
              <li key={i} className="flex gap-2"><span className="w-6 shrink-0 text-right tabular-nums text-sky-600 font-semibold">{i + 1}.</span><span>{f}</span></li>
            ))}
          </ol>
        </section>
      )}

      <section className="py-6">
        <div className="ml-auto max-w-xs text-sm space-y-1">
          {t.descuento > 0 ? (
            <>
              <div className="flex justify-between"><span className="text-neutral-600">Precio de lista</span><span className="tabular-nums line-through text-neutral-500">{mxn(t.lista, quote.currency)}</span></div>
              <div className="flex justify-between gap-3 text-emerald-700"><span>Descuento · {quote.discount?.motivo}{quote.discount?.tipo === 'pct' ? ` (−${quote.discount.valor} %)` : ''}</span><span className="tabular-nums shrink-0">−{mxn(t.descuento, quote.currency)}</span></div>
              <div className="flex justify-between"><span className="text-neutral-600">Precio con descuento</span><span className="tabular-nums">{mxn(t.subtotal, quote.currency)}</span></div>
            </>
          ) : (
            <div className="flex justify-between"><span className="text-neutral-600">Precio del proyecto</span><span className="tabular-nums">{mxn(t.subtotal, quote.currency)}</span></div>
          )}
          {quote.apply_iva && <div className="flex justify-between"><span className="text-neutral-600">IVA 16 %</span><span className="tabular-nums">{mxn(t.iva, quote.currency)}</span></div>}
          <div className="flex justify-between text-lg font-bold border-t border-neutral-200 pt-2"><span>Total</span><span className="tabular-nums">{mxn(t.total, quote.currency)}</span></div>
          {t.descuento > 0 && <p className="text-xs text-neutral-500 pt-1">Descuento válido si la cotización se acepta a más tardar el {fechaLarga(quote.valid_until)}.</p>}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 py-6 border-t border-neutral-200 text-sm">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Forma de pago</p>
          <ul className="space-y-1">
            {hitos.map((h) => <li key={h.label}><span className="font-medium">{h.label}:</span> {h.pct} % · {mxn(h.importe, quote.currency)}</li>)}
            {formaPago.slice(hitos.length).map((l, i) => <li key={i} className="text-neutral-600">{l}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Condiciones</p>
          <ul className="space-y-1 text-neutral-700">
            <li>Entrega: a más tardar el {plazo.texto}.</li>
            <li>Garantía de {quote.terms.garantia_dias} días naturales tras la entrega.</li>
            <li>{quote.terms.soporte}</li>
            <li>{quote.terms.propiedad}</li>
            <li>{quote.terms.cambios_alcance}</li>
            {quote.terms.penalizacion_dia > 0 && <li>Retrasos del cliente en insumos: {mxn(quote.terms.penalizacion_dia, quote.currency)} por día hábil a partir del quinto.</li>}
            <li>Precio fijo: no hay cobros adicionales sobre lo aquí cotizado.</li>
          </ul>
        </div>
      </section>

      {quote.notes && (
        <section className="py-4 border-t border-neutral-200 text-sm text-neutral-700 whitespace-pre-line">{quote.notes}</section>
      )}

      <SignatureBlock
        leyenda="Aceptación de la cotización. Al firmar, o al aceptar en línea, el cliente acepta el alcance, el precio, la forma de pago y las condiciones descritas."
        firmas={[
          FIRMA_PRESTADOR,
          {
            titulo: 'El Cliente',
            nombre: quote.client_name,
            detalle: quote.client_company ?? null,
            aceptado: quote.accepted_at
              ? `Aceptada en línea por ${quote.accepted_name} el ${new Date(quote.accepted_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`
              : null,
          },
        ]}
      />
    </article>
  )
}
