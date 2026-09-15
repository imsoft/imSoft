import { EMISOR } from '@/config/emisor'

/**
 * Encabezado comun de cotizacion y contrato: logo de imSoft y datos del emisor a la
 * izquierda, tipo de documento y folio a la derecha. <img> normal (no next/image) para
 * que salga igual en pantalla y al imprimir a PDF.
 */
export function DocumentHeader({ tipo, folio, extra }: { tipo: string; folio: string; extra?: React.ReactNode }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-200 pb-6">
      <div className="max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/logo-imsoft-blue.png" alt="imSoft" width={140} height={48} className="h-12 w-auto mb-3" />
        <p className="text-sm text-neutral-600">{EMISOR.nombre}</p>
        <p className="text-sm text-neutral-600">RFC {EMISOR.rfc} · {EMISOR.regimen}</p>
        <p className="text-sm text-neutral-600">{EMISOR.domicilio}, {EMISOR.ciudad}</p>
        <p className="text-sm text-neutral-600">{EMISOR.email} · {EMISOR.telefono} · {EMISOR.sitio.replace('https://', '')}</p>
      </div>
      <div className="sm:text-right shrink-0">
        <p className="text-xs uppercase tracking-widest text-neutral-500">{tipo}</p>
        <p className="text-xl font-semibold font-mono">{folio}</p>
        {extra}
      </div>
    </header>
  )
}
