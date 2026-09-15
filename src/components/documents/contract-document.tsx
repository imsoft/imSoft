import type { Contract } from '@/types/quotes'

/** Contrato renderizado desde contracts.body_html (generado por renderContrato y editable en el panel). */
export function ContractDocument({ contract, clientName }: { contract: Contract; clientName: string }) {
  return (
    <article className="doc mx-auto max-w-3xl bg-white text-neutral-900 p-8 md:p-12 rounded-xl shadow-sm print:shadow-none print:p-0 print:max-w-none">
      <div className="contrato" dangerouslySetInnerHTML={{ __html: contract.body_html }} />
      <section className="mt-10 grid gap-8 sm:grid-cols-2 text-sm">
        <div className="border-t border-neutral-400 pt-2">
          <p className="font-semibold">El Prestador</p>
          <p>Brandon Uriel García Ramos · imSoft</p>
          <p className="text-neutral-600">Acepta al emitir este contrato.</p>
        </div>
        <div className="border-t border-neutral-400 pt-2">
          <p className="font-semibold">El Cliente</p>
          <p>{clientName}</p>
          {contract.signed_at ? (
            <p className="text-emerald-800">Aceptado por {contract.signed_name} el {new Date(contract.signed_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}.</p>
          ) : (
            <p className="text-neutral-600">Pendiente de aceptación.</p>
          )}
        </div>
      </section>
    </article>
  )
}
