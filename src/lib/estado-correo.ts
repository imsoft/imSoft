/**
 * En que va la secuencia de correos de un contacto (primer correo y dos seguimientos),
 * para que la tabla del CRM lo muestre y ofrezca la accion que toca: escribir, abrir el
 * borrador, dar seguimiento o nada.
 */
import { fechaSiguientePaso } from './outreach.ts'

export interface FilaCorreo {
  id: string
  step: number
  status: 'draft' | 'sent' | 'replied' | 'closed' | 'skipped'
  sent_at: string | null
}

export type EstadoCorreo =
  | { tipo: 'ninguno' }
  | { tipo: 'borrador'; paso: number; borradorId: string }
  | { tipo: 'enviado'; paso: number; fecha: string; siguientePaso: 2 | 3; tocaEl: string }
  | { tipo: 'respondio'; fecha: string | null }
  | { tipo: 'terminado'; fecha: string | null }

/** Dia (YYYY-MM-DD) en hora de Guadalajara: un envio de las 8 pm no debe caer en el dia siguiente. */
function diaLocal(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })
}

export function estadoDeCorreo(filas: FilaCorreo[]): EstadoCorreo {
  const vivas = filas.filter((f) => f.status !== 'skipped')
  if (vivas.length === 0) return { tipo: 'ninguno' }
  const ultimaFecha = vivas.map((f) => f.sent_at).filter(Boolean).sort().pop() ?? null
  if (vivas.some((f) => f.status === 'replied')) return { tipo: 'respondio', fecha: ultimaFecha ? diaLocal(ultimaFecha) : null }
  const borrador = vivas.filter((f) => f.status === 'draft').sort((a, b) => a.step - b.step)[0]
  if (borrador) return { tipo: 'borrador', paso: borrador.step, borradorId: borrador.id }
  const enviados = vivas.filter((f) => f.status === 'sent' && f.sent_at).sort((a, b) => b.step - a.step)
  const ultimo = enviados[0]
  if (!ultimo || ultimo.step >= 3 || vivas.some((f) => f.status === 'closed')) return { tipo: 'terminado', fecha: ultimaFecha ? diaLocal(ultimaFecha) : null }
  const siguientePaso = (ultimo.step + 1) as 2 | 3
  return { tipo: 'enviado', paso: ultimo.step, fecha: diaLocal(ultimo.sent_at!), siguientePaso, tocaEl: fechaSiguientePaso(new Date(ultimo.sent_at!), siguientePaso) }
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** "2026-09-24" -> "24 sep". */
export function fechaCorta(iso: string | null | undefined): string {
  const m = (iso ?? '').match(/^\d{4}-(\d{2})-(\d{2})/)
  return m ? `${Number(m[2])} ${MESES[Number(m[1]) - 1]}` : ''
}

/** Linea que se muestra bajo el correo en la tabla. `hoy` en formato YYYY-MM-DD. */
export function etiquetaDeCorreo(e: EstadoCorreo, hoy: string): string | null {
  switch (e.tipo) {
    case 'ninguno': return null
    case 'borrador': return e.paso === 1 ? 'Borrador listo para revisar' : `Seguimiento ${e.paso - 1} listo para revisar`
    case 'respondio': return 'Respondió'
    case 'terminado': return e.fecha ? `Secuencia terminada el ${fechaCorta(e.fecha)}` : 'Secuencia terminada'
    case 'enviado': {
      const que = e.paso === 1 ? 'Enviado' : `Seguimiento ${e.paso - 1} enviado`
      return `${que} el ${fechaCorta(e.fecha)} · ${e.tocaEl <= hoy ? 'ya toca seguimiento' : `seguimiento el ${fechaCorta(e.tocaEl)}`}`
    }
  }
}

/** Se le puede escribir algo ahora: primer correo, abrir su borrador o dar seguimiento. */
export function accionDeCorreo(e: EstadoCorreo): 'escribir' | 'abrir-borrador' | 'seguimiento' | null {
  if (e.tipo === 'ninguno') return 'escribir'
  if (e.tipo === 'borrador') return 'abrir-borrador'
  if (e.tipo === 'enviado') return 'seguimiento'
  return null
}
