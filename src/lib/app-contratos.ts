import type { ContractStatus } from '@/types/quotes'

/**
 * Lo que la app y el panel del cliente muestran de un contrato. El texto completo, la
 * firma y la huella se ven en la pagina publica (el enlace).
 */
export interface ContratoApp {
  id: string
  folio: string
  titulo: string
  /** Folio de la cotizacion de la que salio. */
  cotizacion: string
  estado: 'enviado' | 'firmado'
  /** Fecha (AAAA-MM-DD) en que el cliente lo firmo; null si sigue pendiente. */
  fechaFirma: string | null
  firmadoPor: string | null
  enlace: string
}

export interface FilaContrato {
  id: string
  folio: string
  status: ContractStatus
  token: string
  lang?: string | null
  signed_at?: string | null
  signed_name?: string | null
  quotes: { title: string; folio: string } | null
}

/** Convierte las filas de la base en lo que ve el cliente. Borradores y cancelados no salen. */
export function contratosParaApp(filas: FilaContrato[], sitio: string): ContratoApp[] {
  return filas
    .filter((c) => c.status === 'sent' || c.status === 'signed')
    .map((c) => ({
      id: c.id,
      folio: c.folio,
      titulo: c.quotes?.title ?? '',
      cotizacion: c.quotes?.folio ?? '',
      estado: c.status === 'signed' ? 'firmado' : 'enviado',
      fechaFirma: c.status === 'signed' && c.signed_at ? c.signed_at.slice(0, 10) : null,
      firmadoPor: c.status === 'signed' ? c.signed_name ?? null : null,
      enlace: `${sitio}/${c.lang || 'es'}/contrato/${c.token}`,
    }))
}
