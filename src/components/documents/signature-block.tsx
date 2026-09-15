import { EMISOR } from '@/config/emisor'

interface Firma {
  titulo: string
  nombre: string
  detalle?: string | null
  /** Texto cuando ya hubo aceptacion en linea; si no, se deja la linea para firma a mano. */
  aceptado?: string | null
}

/**
 * Zona de firmas para imprimir: espacio para firmar a mano, linea, nombre y fecha. Si el
 * documento ya se acepto en linea, en lugar de la linea vacia se imprime la constancia.
 */
export function SignatureBlock({ firmas, leyenda }: { firmas: Firma[]; leyenda?: string }) {
  return (
    <section className="mt-12 break-inside-avoid">
      {leyenda && <p className="text-sm text-neutral-700 mb-8">{leyenda}</p>}
      <div className={`grid gap-10 ${firmas.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-sm'}`}>
        {firmas.map((f) => (
          <div key={f.titulo} className="text-sm">
            <div className="h-20 border-b border-neutral-800 flex items-end pb-1">
              {f.aceptado && <span className="text-emerald-800 text-xs leading-snug">{f.aceptado}</span>}
            </div>
            <p className="mt-2 font-semibold">{f.nombre}</p>
            <p className="text-neutral-600">{f.titulo}</p>
            {f.detalle && <p className="text-neutral-600">{f.detalle}</p>}
            {!f.aceptado && <p className="text-neutral-500 mt-1">Fecha: ____ / ____ / ________</p>}
          </div>
        ))}
      </div>
    </section>
  )
}

export const FIRMA_PRESTADOR = { titulo: 'El Prestador', nombre: EMISOR.nombre, detalle: `${EMISOR.marca} · RFC ${EMISOR.rfc}` }
