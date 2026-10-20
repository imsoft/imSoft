import { EMISOR } from '@/config/emisor'

interface Firma {
  titulo: string
  nombre: string
  detalle?: string | null
  /** Texto cuando ya hubo aceptacion en linea; si no, se deja la linea para firma a mano. */
  aceptado?: string | null
  /** PNG (data URL) con el trazo del cliente, cuando firmo dibujando. */
  imagen?: string | null
}

/**
 * Zona de firmas para imprimir: espacio para firmar a mano, linea, nombre y fecha. Si el
 * documento ya se acepto en linea, en lugar de la linea vacia se imprime la constancia y,
 * si la hay, la firma dibujada.
 */
export function SignatureBlock({ firmas, leyenda, pie }: { firmas: Firma[]; leyenda?: string; pie?: React.ReactNode }) {
  return (
    <section className="mt-12 break-inside-avoid">
      {leyenda && <p className="text-sm text-neutral-700 mb-8">{leyenda}</p>}
      <div className={`grid gap-10 ${firmas.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-sm'}`}>
        {firmas.map((f) => (
          <div key={f.titulo} className="text-sm">
            <div className="h-20 border-b border-neutral-800 flex items-end pb-1 relative">
              {f.imagen && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.imagen} alt={`Firma de ${f.nombre}`} className="absolute inset-x-0 bottom-0 h-20 w-auto max-w-full object-contain object-bottom-left" />
              )}
              {f.aceptado && !f.imagen && <span className="text-emerald-800 text-xs leading-snug">{f.aceptado}</span>}
            </div>
            <p className="mt-2 font-semibold">{f.nombre}</p>
            <p className="text-neutral-600">{f.titulo}</p>
            {f.detalle && <p className="text-neutral-600">{f.detalle}</p>}
            {f.aceptado && f.imagen && <p className="text-emerald-800 text-xs leading-snug mt-1">{f.aceptado}</p>}
            {!f.aceptado && <p className="text-neutral-500 mt-1">Fecha: ____ / ____ / ________</p>}
          </div>
        ))}
      </div>
      {pie}
    </section>
  )
}

export const FIRMA_PRESTADOR = { titulo: 'El Prestador', nombre: EMISOR.nombre, detalle: `${EMISOR.marca} · RFC ${EMISOR.rfc}` }
