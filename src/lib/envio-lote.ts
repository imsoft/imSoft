/**
 * Envio de correos en lote, uno por uno: se eligen contactos en la tabla del CRM, se
 * prepara el borrador personalizado de cada uno y, tras revisarlos, se mandan con una
 * pausa entre cada envio para que no salgan como rafaga.
 */
import { correoInvalido } from './correo-invalido.ts'

/** Se le puede preparar un correo: tiene correo y no esta marcado como invalido. */
export function puedeRecibirCorreo(c: { email?: string | null; tags?: string[] | null; invalid_emails?: string[] | null }): boolean {
  return Boolean((c.email ?? '').trim()) && !correoInvalido(c)
}

export const PAUSA_MIN_MS = 20_000
export const PAUSA_MAX_MS = 45_000

/** Pausa entre dos envios: de 20 a 45 segundos, distinta cada vez. */
export function pausaEntreEnvios(azar: number = Math.random()): number {
  const a = Math.min(1, Math.max(0, azar))
  return Math.round(PAUSA_MIN_MS + a * (PAUSA_MAX_MS - PAUSA_MIN_MS))
}

/** Minutos aproximados que tarda un lote de `n` envios. */
export function minutosDeLote(n: number): number {
  if (n <= 1) return 1
  return Math.max(1, Math.round(((n - 1) * (PAUSA_MIN_MS + PAUSA_MAX_MS)) / 2 / 60_000))
}

export interface ResultadoLote {
  /** Borradores nuevos, escritos en este lote. */
  listos: number
  /** Ya tenian un borrador pendiente: se reutiliza. */
  yaTenian: number
  /** "Empresa: motivo" de los que no se pudieron preparar. */
  errores: string[]
}

export function resumenDeLote(r: ResultadoLote): string {
  const partes: string[] = []
  if (r.listos) partes.push(`${r.listos} ${r.listos === 1 ? 'borrador listo' : 'borradores listos'}`)
  if (r.yaTenian) partes.push(`${r.yaTenian} ya ${r.yaTenian === 1 ? 'tenía' : 'tenían'} borrador`)
  if (r.errores.length) partes.push(`${r.errores.length} sin preparar`)
  return partes.length ? partes.join(' · ') : 'No se preparó ningún correo'
}
