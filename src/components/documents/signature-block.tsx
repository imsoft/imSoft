import { ISSUER } from '@/config/issuer'

interface Signer {
  title: string
  name: string
  detail?: string | null
  /** Text once accepted online; otherwise the line is left for a handwritten signature. */
  acceptedText?: string | null
  /** PNG (data URL) with the client's stroke, when they signed by drawing. */
  image?: string | null
}

/**
 * Printable signature area: space to sign by hand, line, name and date. If the document
 * was already accepted online, the proof of acceptance and, if any, the drawn signature
 * are printed instead of the empty line.
 */
export function SignatureBlock({ signers, caption, footer }: { signers: Signer[]; caption?: string; footer?: React.ReactNode }) {
  return (
    <section className="mt-12 break-inside-avoid">
      {caption && <p className="text-sm text-neutral-700 mb-8">{caption}</p>}
      <div className={`grid gap-10 ${signers.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-sm'}`}>
        {signers.map((f) => (
          <div key={f.title} className="text-sm">
            <div className="h-20 border-b border-neutral-800 flex items-end pb-1 relative">
              {f.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.image} alt={`Firma de ${f.name}`} className="absolute inset-x-0 bottom-0 h-20 w-auto max-w-full object-contain object-bottom-left" />
              )}
              {f.acceptedText && !f.image && <span className="text-emerald-800 text-xs leading-snug">{f.acceptedText}</span>}
            </div>
            <p className="mt-2 font-semibold">{f.name}</p>
            <p className="text-neutral-600">{f.title}</p>
            {f.detail && <p className="text-neutral-600">{f.detail}</p>}
            {f.acceptedText && f.image && <p className="text-emerald-800 text-xs leading-snug mt-1">{f.acceptedText}</p>}
            {!f.acceptedText && <p className="text-neutral-500 mt-1">Fecha: ____ / ____ / ________</p>}
          </div>
        ))}
      </div>
      {footer}
    </section>
  )
}

export const PROVIDER_SIGNER = { title: 'El Prestador', name: ISSUER.name, detail: `${ISSUER.brand} · RFC ${ISSUER.rfc}` }
