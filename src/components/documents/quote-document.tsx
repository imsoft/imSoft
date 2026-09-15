import { EMISOR } from '@/config/emisor'
import { fechaLarga, importesHitos, mxn, textoFormaDePago, totales, type QuoteLike } from '@/lib/cotizaciones'

/**
 * La cotizacion tal como la ve el cliente: en el panel (vista previa), en la pagina
 * publica de aceptacion y al imprimir a PDF. Sin interactividad; el boton de aceptar
 * vive fuera de este componente.
 */
export function QuoteDocument({ quote }: { quote: QuoteLike }) {
  const t = totales(quote)
  const hitos = importesHitos(t.total, quote.payment.hitos)
  const formaPago = textoFormaDePago(quote)
  return (
    <article className="doc mx-auto max-w-3xl bg-white text-neutral-900 p-8 md:p-12 rounded-xl shadow-sm print:shadow-none print:p-0 print:max-w-none">
      <header className="flex flex-wrap justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <p className="text-2xl font-bold tracking-tight text-sky-600">{EMISOR.marca}</p>
          <p className="text-sm text-neutral-600">{EMISOR.nombre}</p>
          <p className="text-sm text-neutral-600">RFC {EMISOR.rfc} · {EMISOR.regimen}</p>
          <p className="text-sm text-neutral-600">{EMISOR.domicilio}, {EMISOR.ciudad}</p>
          <p className="text-sm text-neutral-600">{EMISOR.email} · {EMISOR.telefono}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-neutral-500">Cotización</p>
          <p className="text-xl font-semibold font-mono">{quote.folio}</p>
          <p className="text-sm text-neutral-600 mt-2">Vigente hasta el {fechaLarga(quote.valid_until)}</p>
        </div>
      </header>

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

      <section className="py-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
              <th className="text-left py-2 font-semibold">Concepto</th>
              <th className="text-right py-2 font-semibold w-16">Cant.</th>
              <th className="text-right py-2 font-semibold w-32">Precio</th>
              <th className="text-right py-2 font-semibold w-32">Importe</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((i, idx) => (
              <tr key={idx} className="border-b border-neutral-100 align-top">
                <td className="py-3">
                  <p className="font-medium">{i.concepto}</p>
                  {i.descripcion && <p className="text-neutral-600 whitespace-pre-line">{i.descripcion}</p>}
                </td>
                <td className="py-3 text-right tabular-nums">{i.cantidad}</td>
                <td className="py-3 text-right tabular-nums">{mxn(i.precio, quote.currency)}</td>
                <td className="py-3 text-right tabular-nums">{mxn(i.cantidad * i.precio, quote.currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3} className="pt-4 text-right text-neutral-600">Subtotal</td><td className="pt-4 text-right tabular-nums">{mxn(t.subtotal, quote.currency)}</td></tr>
            {quote.apply_iva && <tr><td colSpan={3} className="py-1 text-right text-neutral-600">IVA 16 %</td><td className="py-1 text-right tabular-nums">{mxn(t.iva, quote.currency)}</td></tr>}
            <tr className="text-lg font-bold"><td colSpan={3} className="pt-2 text-right">Total</td><td className="pt-2 text-right tabular-nums">{mxn(t.total, quote.currency)}</td></tr>
          </tfoot>
        </table>
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
            <li>Entrega estimada: {quote.terms.entrega_semanas} semanas desde el anticipo y los insumos iniciales.</li>
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

      {quote.accepted_at && (
        <footer className="mt-6 rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-900 print:bg-white">
          Aceptada por <strong>{quote.accepted_name}</strong> el {new Date(quote.accepted_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}.
        </footer>
      )}
    </article>
  )
}
