import type { Contract } from '@/types/quotes'
import { FIRMA_PRESTADOR, SignatureBlock } from './signature-block'
import { DocumentHeader } from './document-header'
import { huellaCorta } from '@/lib/firma-contrato'

/** Estado de la huella de integridad, calculado en el servidor por quien renderiza. */
export interface Huella {
  /** SHA-256 del texto actual del contrato. */
  actual: string
  /** true si coincide con la huella guardada al firmar; false si el texto cambio despues. */
  coincide: boolean
}

/** Contrato renderizado desde contracts.body_html (generado por renderContrato y editable en el panel). */
export function ContractDocument({ contract, clientName, clientCompany, huella }: { contract: Contract; clientName: string; clientCompany?: string | null; huella?: Huella | null }) {
  const firmado = Boolean(contract.signed_at)
  return (
    <article className="doc mx-auto max-w-3xl bg-white text-neutral-900 p-8 md:p-12 rounded-xl shadow-sm print:shadow-none print:p-0 print:max-w-none">
      <DocumentHeader tipo="Contrato" folio={contract.number} />
      <div className="contrato mt-8" dangerouslySetInnerHTML={{ __html: contract.body_html }} />
      <SignatureBlock
        leyenda="Firman de conformidad las partes, por duplicado, en la fecha indicada."
        firmas={[
          FIRMA_PRESTADOR,
          {
            titulo: 'El Cliente',
            nombre: clientName,
            detalle: clientCompany ?? null,
            aceptado: contract.signed_at
              ? `${contract.signed_signature ? 'Firmado' : 'Aceptado'} en línea por ${contract.signed_name} el ${new Date(contract.signed_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`
              : null,
            imagen: contract.signed_signature ?? null,
          },
        ]}
        pie={firmado && contract.signed_hash ? (
          <p className="mt-8 text-[11px] leading-snug text-neutral-500 break-inside-avoid">
            Huella SHA-256 del texto aceptado: <span className="font-mono">{huellaCorta(contract.signed_hash)}</span> (completa: <span className="font-mono break-all">{contract.signed_hash}</span>).
            {huella && (huella.coincide
              ? ' El texto de este documento coincide con el aceptado.'
              : ' Atención: el texto de este documento no coincide con el aceptado; el original es el de la huella.')}
          </p>
        ) : null}
      />
    </article>
  )
}
