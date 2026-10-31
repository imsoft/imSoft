/**
 * Milestone billing with Stripe payment links.
 *
 * The dashboard used to generate a single link for the project total. Billing by milestone
 * (deposit and final payment, or more) needs one link per amount, and each link is stored
 * as a "pending" payment that the webhook marks as completed.
 */

export interface PaymentSummary {
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
}

/** What is left to collect: total minus completed and already-linked (pending) payments. */
export function pendingBalance(total: number, payments: PaymentSummary[]): number {
  const committed = payments
    .filter((p) => p.status === 'completed' || p.status === 'pending')
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);
  return Math.max(0, round(total - committed));
}

/** First milestone: half. After that: whatever is left. */
export function suggestedMilestone(total: number, payments: PaymentSummary[]): number {
  const balance = pendingBalance(total, payments);
  const hasCharges = payments.some((p) => p.status === 'completed' || p.status === 'pending');
  return hasCharges ? balance : round(total / 2);
}

export function suggestedLabel(payments: PaymentSummary[], lang: string): string {
  const hasCharges = payments.some((p) => p.status === 'completed' || p.status === 'pending');
  if (lang === 'en') return hasCharges ? 'Final payment' : 'Deposit (50%)';
  return hasCharges ? 'Liquidación' : 'Anticipo (50%)';
}

/** Marker stored in project_payments.notes (visible, already saved text: keep it as is). */
const URL_MARKER = 'Enlace Stripe: ';

/** Notes of the pending payment: label + URL, so it can be copied from the list. */
export function linkNotes(label: string, url: string): string {
  return `${label.trim()} · ${URL_MARKER}${url}`;
}

export function urlFromNotes(notes: string | null | undefined): string | null {
  const m = (notes ?? '').match(/Enlace Stripe: (https:\/\/\S+)/);
  return m ? m[1] : null;
}

/** Validates the amount the admin asks for a new link. */
export function validateLinkAmount(amount: number, total: number, payments: PaymentSummary[]): string | null {
  if (!Number.isFinite(amount) || amount <= 0) return 'El monto debe ser mayor a cero.';
  const balance = pendingBalance(total, payments);
  if (amount > balance + 0.005) return `El monto supera lo que falta por cobrar (${balance.toFixed(2)}).`;
  return null;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
