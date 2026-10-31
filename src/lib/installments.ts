/**
 * Interest-free installments, "meses sin intereses" (Stripe Mexico, enabled in the
 * Dashboard on 2026-09-13).
 *
 * Stripe charges an extra fee on the sale depending on the term (3 m: 5 %, 6 m: 7.5 %,
 * 12 m: 12.5 %), so the site only advertises the terms that make sense and above a minimum
 * amount. The actual plans are decided by the Stripe settings.
 */

/** Terms offered on the site. */
export const INSTALLMENT_TERMS = [3, 6, 12] as const;
/** Below this, the site doesn't advertise interest-free installments. */
export const INSTALLMENTS_MIN_MXN = 15000;
/** Term shown on the pricing cards as the sample monthly payment. */
export const INSTALLMENTS_SAMPLE_TERM = 6;

const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

export function formatPesos(amount: number): string {
  return pesos.format(amount).replace(/\u00a0/g, ' ');
}

/** "o 6 pagos de $2,500 sin intereses", or null when the amount is below the minimum. */
export function installmentsLabel(totalMxn: number, months: number = INSTALLMENTS_SAMPLE_TERM, lang: string = 'es'): string | null {
  if (!Number.isFinite(totalMxn) || totalMxn < INSTALLMENTS_MIN_MXN) return null;
  const monthly = Math.ceil(totalMxn / months);
  return lang === 'en'
    ? `or ${months} interest-free payments of ${formatPesos(monthly)} MXN`
    : `o ${months} pagos de ${formatPesos(monthly)} sin intereses`;
}

/** The number in a price such as "Desde $15,000 MXN". */
export function amountFromPrice(price: string): number | null {
  const m = price.replace(/,/g, '').match(/\$\s?(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}
