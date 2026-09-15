import type { Contract } from '@/types/quotes'
import { FIRMA_PRESTADOR, SignatureBlock } from './signature-block'

/** Contrato renderizado desde contracts.body_html (generado por renderContrato y editable en el panel). */
export function ContractDocument({ contract, clientName, clientCompany }: { contract: Contract; clientName: string; clientCompany?: string | null }) {
  return (
    <article className="doc mx-auto max-w-3xl bg-white text-neutral-900 p-8 md:p-12 rounded-xl shadow-sm print:shadow-none print:p-0 print:max-w-none">
      <div className="contrato" dangerouslySetInnerHTML={{ __html: contract.body_html }} />
      <SignatureBlock
        leyenda="Firman de conformidad las partes, por duplicado, en la fecha indicada."
        firmas={[
          FIRMA_PRESTADOR,
          {
            titulo: 'El Cliente',
            nombre: clientName,
            detalle: clientCompany ?? null,
            aceptado: contract.signed_at
              ? `Aceptado en línea por ${contract.signed_name} el ${new Date(contract.signed_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`
              : null,
          },
        ]}
      />
    </article>
  )
}
