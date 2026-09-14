/**
 * Cobro por hitos con enlaces de pago de Stripe.
 *
 * Antes el panel generaba un unico enlace por el total del proyecto. Cobrar por hitos
 * (anticipo y liquidacion, o mas) necesita un enlace por monto, y cada enlace queda
 * registrado como un pago "pendiente" que el webhook marca como completado.
 */

export interface PagoResumen {
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
}

/** Lo que falta por cobrar: total menos lo completado y lo ya enlazado (pendiente). */
export function saldoPendiente(total: number, pagos: PagoResumen[]): number {
  const comprometido = pagos
    .filter((p) => p.status === 'completed' || p.status === 'pending')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  return Math.max(0, redondear(total - comprometido));
}

/** Primer hito: la mitad. Despues: lo que falte. */
export function hitoSugerido(total: number, pagos: PagoResumen[]): number {
  const saldo = saldoPendiente(total, pagos);
  const hayCobros = pagos.some((p) => p.status === 'completed' || p.status === 'pending');
  return hayCobros ? saldo : redondear(total / 2);
}

export function etiquetaSugerida(pagos: PagoResumen[], lang: string): string {
  const hayCobros = pagos.some((p) => p.status === 'completed' || p.status === 'pending');
  if (lang === 'en') return hayCobros ? 'Final payment' : 'Deposit (50%)';
  return hayCobros ? 'Liquidación' : 'Anticipo (50%)';
}

const MARCA_URL = 'Enlace Stripe: ';

/** Notas del pago pendiente: etiqueta + URL, para poder copiarla desde la lista. */
export function notasEnlace(etiqueta: string, url: string): string {
  return `${etiqueta.trim()} · ${MARCA_URL}${url}`;
}

export function urlDeNotas(notes: string | null | undefined): string | null {
  const m = (notes ?? '').match(/Enlace Stripe: (https:\/\/\S+)/);
  return m ? m[1] : null;
}

/** Valida el monto que pide el admin para un enlace nuevo. */
export function validarMontoEnlace(monto: number, total: number, pagos: PagoResumen[]): string | null {
  if (!Number.isFinite(monto) || monto <= 0) return 'El monto debe ser mayor a cero.';
  const saldo = saldoPendiente(total, pagos);
  if (monto > saldo + 0.005) return `El monto supera lo que falta por cobrar (${saldo.toFixed(2)}).`;
  return null;
}

function redondear(n: number): number {
  return Math.round(n * 100) / 100;
}
