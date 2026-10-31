/**
 * Pure quote and contract logic: totals, document numbers, validity, milestones and the
 * contract template. No I/O; the admin pages and routes use it.
 */
import { VAT_RATE, INSTALLMENT_EXTRA } from './fee-simulator';
import { installmentsLabel, INSTALLMENTS_MIN_MXN } from './installments';
import { ISSUER } from '@/config/issuer';
import { TRANSFER_DISCOUNT_PCT } from '@/config/pricing';

export interface QuoteItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}
export interface Milestone {
  label: string;
  pct: number;
  /**
   * How many monthly bank transfers cover this milestone (1 = a single payment).
   * It is a direct agreement with the client: it has nothing to do with Stripe or card installments.
   */
  monthly_payments?: number;
}
/**
 * N-month subscription plan (2026-10-31): a deposit that covers the work, a monthly fee
 * that includes hosting and support, the system runs on imSoft infrastructure until it is
 * paid off and the code is transferred at the end. Sold as license + service, never as
 * credit. The surcharge covers the time and hosting of those months.
 */
export interface MonthlyPlan {
  months: number;
  /** Percentage of the total paid up front. */
  deposit_pct: number;
  /** Percentage added to the total for paying through the plan. */
  surcharge_pct: number;
}
export const DEFAULT_PLAN: MonthlyPlan = { months: 24, deposit_pct: 30, surcharge_pct: 40 };

export interface QuotePayment {
  milestones: Milestone[];
  card_installments: boolean;
  /** Bank-transfer discount (%). When missing, the one in src/config/pricing.ts. */
  transfer_discount_pct?: number;
  /** Monthly plan offered; null or missing = not offered. */
  plan?: MonthlyPlan | null;
}

export type PaymentOptionKey = 'transfer' | 'card' | 'installments_6' | 'installments_12' | 'plan';
export interface PaymentOption {
  key: PaymentOptionKey;
  title: string;
  /** What the client pays in total with this option. */
  total: number;
  /** One line that explains it ("12 pagos de $5,958 con tarjeta"). */
  summary: string;
}

export function validatePlan(plan: MonthlyPlan | null | undefined): string | null {
  if (!plan) return null;
  if (!(plan.months >= 6 && plan.months <= 36)) return 'El plan va de 6 a 36 meses.';
  if (!(plan.deposit_pct >= 10 && plan.deposit_pct <= 60)) return 'El anticipo del plan va del 10 al 60 %.';
  if (!(plan.surcharge_pct >= 0 && plan.surcharge_pct <= 80)) return 'El recargo del plan va del 0 al 80 %.';
  return null;
}

export function transferDiscountPct(p: Pick<QuotePayment, 'transfer_discount_pct'>): number {
  const v = Number(p.transfer_discount_pct);
  return Number.isFinite(v) && v >= 0 && v <= 20 ? v : TRANSFER_DISCOUNT_PCT;
}

/** What the plan costs: deposit, total and monthly fee, over the total with VAT. */
export function planAmounts(total: number, plan: MonthlyPlan) {
  const deposit = round2((total * plan.deposit_pct) / 100);
  const planTotal = round2(total * (1 + plan.surcharge_pct / 100));
  const monthlyFee = round2((planTotal - deposit) / plan.months);
  return { deposit, planTotal, monthlyFee };
}

/** Card total over N interest-free months: the cost of the term (Stripe + VAT) goes into the price. */
export function totalWithInstallments(total: number, months: 6 | 12): number {
  return round2(total * (1 + (INSTALLMENT_EXTRA[String(months) as '6' | '12'] ?? 0) * (1 + VAT_RATE)));
}

/**
 * The payment options the client sees, each with its total. The list price already
 * includes the card fee; bank transfers get a discount; installments and the plan cost
 * more and say how much. The client picks one when accepting and it goes into the contract.
 */
export function paymentOptions(q: Pick<QuoteLike, 'items' | 'apply_iva' | 'payment' | 'currency' | 'discount'>): PaymentOption[] {
  const { total } = quoteTotals(q);
  const c = q.currency;
  const discountPct = transferDiscountPct(q.payment);
  const out: PaymentOption[] = [];
  const transferTotal = round2(total * (1 - discountPct / 100));
  out.push({ key: 'transfer', title: 'Transferencia bancaria', total: transferTotal, summary: discountPct > 0 ? `${discountPct} % de descuento: ${formatMoney(transferTotal, c)} en total` : `${formatMoney(total, c)} en total` });
  out.push({ key: 'card', title: 'Tarjeta en una sola exhibición', total, summary: `${formatMoney(total, c)} en total, por enlace de pago seguro` });
  if (q.payment.card_installments && c === 'MXN' && total >= INSTALLMENTS_MIN_MXN) {
    for (const m of [6, 12] as const) {
      const t = totalWithInstallments(total, m);
      out.push({ key: m === 6 ? 'installments_6' : 'installments_12', title: `Tarjeta a ${m} meses sin intereses`, total: t, summary: `${m} pagos de ${formatMoney(t / m, c)}; ${formatMoney(t, c)} en total` });
    }
  }
  if (q.payment.plan && !validatePlan(q.payment.plan)) {
    const { deposit, planTotal, monthlyFee } = planAmounts(total, q.payment.plan);
    out.push({ key: 'plan', title: `Plan mensual a ${q.payment.plan.months} meses`, total: planTotal, summary: `Anticipo de ${formatMoney(deposit, c)} y ${q.payment.plan.months} mensualidades de ${formatMoney(monthlyFee, c)}, con hosting y soporte incluidos` });
  }
  return out;
}

export function isPaymentOptionKey(v: unknown): v is PaymentOptionKey {
  return typeof v === 'string' && ['transfer', 'card', 'installments_6', 'installments_12', 'plan'].includes(v);
}
export interface QuoteTerms {
  warranty_days: number;
  support: string;
  ownership: string;
  scope_changes: string;
  /** MXN per business day the client is late delivering inputs. 0 = no penalty. */
  daily_penalty: number;
  /** Project deadline (ISO). The term in weeks is counted from the quote. */
  deadline?: string | null;
  /** Fallback only, for old quotes without a deadline. */
  delivery_weeks: number;
}
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

/** Quote discount or promotion. Always with a reason: the client sees it. */
export interface QuoteDiscount {
  /** Text the client sees, e.g. "Cliente desde 2023". */
  reason: string;
  type: 'pct' | 'amount';
  /** Percentage (0-100) or amount in the quote currency, depending on `type`. */
  value: number;
}

/** Named promotions, so the text is not made up every time. */
export const PROMOTIONS: Array<{ key: string; reason: string; type: QuoteDiscount['type']; value: number }> = [
  { key: 'launch', reason: 'Promoción de lanzamiento: primer proyecto con imSoft', type: 'pct', value: 10 },
  { key: 'first-project', reason: 'Primer proyecto con imSoft', type: 'pct', value: 10 },
  { key: 'returning', reason: 'Cliente recurrente de imSoft', type: 'pct', value: 10 },
  { key: 'referral', reason: 'Cliente referido', type: 'pct', value: 5 },
  { key: 'seasonal', reason: 'Promoción de temporada', type: 'pct', value: 10 },
];

/** Above this percentage the margin (Stripe + income tax) gets thinner than it looks. */
export const MAX_RECOMMENDED_DISCOUNT_PCT = 20;

export interface QuoteLike {
  number: string;
  status: QuoteStatus;
  lang: string;
  client_name: string;
  client_company?: string | null;
  client_email?: string | null;
  client_rfc?: string | null;
  client_address?: string | null;
  title: string;
  intro?: string | null;
  /** Single project price: one line in `items`. See projectPrice(). */
  items: QuoteItem[];
  /** What the application includes, one feature per entry. */
  features?: string[] | null;
  currency: string;
  apply_iva: boolean;
  /** Optional discount; applied to the list price before VAT. */
  discount?: QuoteDiscount | null;
  payment: QuotePayment;
  terms: QuoteTerms;
  notes?: string | null;
  valid_until: string;
  accepted_at?: string | null;
  accepted_name?: string | null;
  /** Payment option the client chose when accepting (see paymentOptions). */
  accepted_payment_option?: PaymentOptionKey | null;
}

/** The project price before VAT (the only line in `items`). */
export function projectPrice(q: Pick<QuoteLike, 'items'>): number {
  return subtotal(q.items);
}

/** How a single price is stored in `items`, so quoteTotals() keeps working. */
export function itemsFromPrice(title: string, price: number): QuoteItem[] {
  return [{ name: title, quantity: 1, price: Number(price) || 0 }];
}

export function validateFeatures(features: string[]): string | null {
  const clean = features.map((f) => f.trim()).filter(Boolean);
  if (clean.length === 0) return 'Agrega al menos una característica de la aplicación.';
  return null;
}

export interface DeliveryTerm {
  deadline: string;
  days: number;
  weeks: number;
  text: string;
}

/**
 * Delivery term from the deadline: calendar days and weeks (rounded up) counted from
 * when the quote was created. Without a deadline, delivery_weeks is used as before.
 */
export function deliveryTerm(q: Pick<QuoteLike, 'terms'> & { created_at?: string | null }, today = new Date()): DeliveryTerm {
  const from = q.created_at ? q.created_at.slice(0, 10) : today.toISOString().slice(0, 10);
  let deadline = q.terms.deadline?.slice(0, 10) || null;
  if (!deadline) {
    const d = new Date(`${from}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + (q.terms.delivery_weeks || 0) * 7);
    deadline = d.toISOString().slice(0, 10);
  }
  const days = Math.max(0, Math.round((Date.parse(`${deadline}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000));
  const weeks = Math.max(1, Math.ceil(days / 7));
  const text = `${longDate(deadline)} (${weeks} ${weeks === 1 ? 'semana' : 'semanas'} a partir de la cotización)`;
  return { deadline, days, weeks, text };
}

export function subtotal(items: QuoteItem[]): number {
  return round2(items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0));
}

/** Discount amount over the list price (never more than the price). */
export function discountAmount(listPrice: number, d?: QuoteDiscount | null): number {
  if (!d || !(d.value > 0)) return 0;
  const raw = d.type === 'pct' ? (listPrice * d.value) / 100 : d.value;
  return round2(Math.min(listPrice, Math.max(0, raw)));
}

/** Effective discount percentage, for warnings. */
export function discountPct(q: Pick<QuoteLike, 'items' | 'discount'>): number {
  const listPrice = subtotal(q.items);
  if (!(listPrice > 0)) return 0;
  return round2((discountAmount(listPrice, q.discount) / listPrice) * 100);
}

/** A valid discount: with a reason and a positive value within range. */
export function validateDiscount(d: QuoteDiscount | null | undefined): string | null {
  if (!d) return null;
  if (!d.reason?.trim()) return 'El descuento necesita un motivo; el cliente lo va a ver.';
  if (!(d.value > 0)) return 'El descuento debe ser mayor que cero.';
  if (d.type === 'pct' && d.value >= 100) return 'El descuento no puede ser del 100 %.';
  return null;
}

/**
 * Totals: `listPrice` is the price without discount, `subtotal` the price after the
 * discount (base for VAT and the milestones), `vat` and `total`.
 */
export function quoteTotals(q: Pick<QuoteLike, 'items' | 'apply_iva'> & { discount?: QuoteDiscount | null }) {
  const listPrice = subtotal(q.items);
  const discount = discountAmount(listPrice, q.discount);
  const sub = round2(listPrice - discount);
  const vat = q.apply_iva ? round2(sub * VAT_RATE) : 0;
  return { listPrice, discount, subtotal: sub, vat, total: round2(sub + vat) };
}

/** Amount of each milestone over the total with VAT; the last one absorbs the rounding. */
export function milestoneAmounts(total: number, milestones: Milestone[]): Array<Milestone & { amount: number }> {
  if (milestones.length === 0) return [];
  let accumulated = 0;
  return milestones.map((m, i) => {
    const amount = i === milestones.length - 1 ? round2(total - accumulated) : round2((total * m.pct) / 100);
    accumulated = round2(accumulated + amount);
    return { ...m, amount };
  });
}

export function validateMilestones(milestones: Milestone[]): string | null {
  if (milestones.length === 0) return 'Agrega al menos un hito de pago.';
  const sum = milestones.reduce((s, m) => s + (Number(m.pct) || 0), 0);
  if (Math.abs(sum - 100) > 0.01) return `Los hitos suman ${sum}%; deben sumar 100%.`;
  if (milestones.some((m) => !m.label.trim())) return 'Cada hito necesita un nombre.';
  if (milestones.some((m) => m.monthly_payments !== undefined && (!Number.isInteger(Number(m.monthly_payments)) || Number(m.monthly_payments) < 1 || Number(m.monthly_payments) > 24))) return 'Las mensualidades de un hito van de 1 a 24.';
  return null;
}

/** Number of monthly payments for a milestone (1 if paid at once). */
export function monthlyPaymentCount(m: Pick<Milestone, 'monthly_payments'>): number {
  const n = Math.round(Number(m.monthly_payments) || 1);
  return n >= 1 ? n : 1;
}

/** Splits a milestone amount into monthly payments; the last one absorbs the rounding. */
export function monthlyPaymentAmounts(amount: number, n: number): number[] {
  const k = Math.max(1, Math.round(n));
  const base = round2(amount / k);
  return Array.from({ length: k }, (_, i) => (i === k - 1 ? round2(amount - base * (k - 1)) : base));
}

/** "en 3 mensualidades de $X", or '' for a single payment. */
export function monthlyPaymentsText(amount: number, m: Pick<Milestone, 'monthly_payments'>, currency = 'MXN'): string {
  const n = monthlyPaymentCount(m);
  if (n <= 1) return '';
  const parts = monthlyPaymentAmounts(amount, n);
  const equal = parts.every((x) => x === parts[0]);
  return equal
    ? `en ${n} mensualidades de ${formatMoney(parts[0], currency)}`
    : `en ${n} mensualidades: ${n - 1} de ${formatMoney(parts[0], currency)} y una última de ${formatMoney(parts[n - 1], currency)}`;
}

export function validateItems(items: QuoteItem[]): string | null {
  if (items.length === 0) return 'Agrega al menos un concepto.';
  if (items.some((i) => !i.name.trim())) return 'Cada concepto necesita nombre.';
  if (items.some((i) => !(Number(i.quantity) > 0) || !(Number(i.price) >= 0))) return 'Cantidad y precio deben ser válidos.';
  return null;
}

/** COT-2026-007 / CON-2026-003, from the last number of the same kind and year. */
export function nextNumber(prefix: 'COT' | 'CON', lastNumber: string | null | undefined, today = new Date()): string {
  const year = today.getUTCFullYear();
  const m = (lastNumber ?? '').match(new RegExp(`^${prefix}-(\\d{4})-(\\d+)$`));
  const n = m && Number(m[1]) === year ? Number(m[2]) + 1 : 1;
  return `${prefix}-${year}-${String(n).padStart(3, '0')}`;
}

/** ISO date (YYYY-MM-DD) `days` days after `from`. */
export function dateAfterDays(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function isExpired(q: Pick<QuoteLike, 'valid_until' | 'status'>, today = new Date()): boolean {
  if (q.status === 'accepted') return false;
  return today.toISOString().slice(0, 10) > q.valid_until;
}

/** Whether it can be accepted online right now; if not, why. */
export function notAcceptableReason(q: Pick<QuoteLike, 'valid_until' | 'status'>, today = new Date()): string | null {
  if (q.status === 'accepted') return 'Esta cotización ya fue aceptada.';
  if (q.status === 'rejected') return 'Esta cotización fue rechazada.';
  if (q.status === 'draft') return 'Esta cotización todavía no se ha enviado.';
  if (isExpired(q, today)) return `Esta cotización venció el ${longDate(q.valid_until)}. Pide una nueva.`;
  return null;
}

export function generateToken(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const formatMoney = (n: number, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);

export function longDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/** Payment terms text for the quote and the contract. */
export function paymentTermsText(q: Pick<QuoteLike, 'items' | 'apply_iva' | 'payment' | 'currency' | 'discount'>): string[] {
  const { total } = quoteTotals(q);
  const milestones = milestoneAmounts(total, q.payment.milestones);
  const lines = milestones.map((m) => { const monthly = monthlyPaymentsText(m.amount, m, q.currency); return `${m.label}: ${m.pct}% (${formatMoney(m.amount, q.currency)})${monthly ? `, ${monthly} por transferencia` : ''}`; });
  if (milestones.some((m) => monthlyPaymentCount(m) > 1)) lines.push('Las mensualidades son pagos por transferencia bancaria, sin intereses: la primera vence al cumplirse el hito y las siguientes cada mes.');
  const discountPct = transferDiscountPct(q.payment);
  if (discountPct > 0) lines.push(`Pagando por transferencia bancaria, ${discountPct} % de descuento: ${formatMoney(round2(total * (1 - discountPct / 100)), q.currency)} en total.`);
  if (q.payment.card_installments && q.currency === 'MXN' && total >= INSTALLMENTS_MIN_MXN) {
    const six = installmentsLabel(totalWithInstallments(total, 6), 6);
    lines.push(`Con tarjeta de crédito a 6 o 12 meses sin intereses con bancos participantes; el costo del plazo va en el total: a 6 meses ${formatMoney(totalWithInstallments(total, 6), q.currency)}${six ? ` (${six.replace(/^o /, '')})` : ''} y a 12 meses ${formatMoney(totalWithInstallments(total, 12), q.currency)}.`);
  }
  if (q.payment.plan && !validatePlan(q.payment.plan)) {
    const { deposit, planTotal, monthlyFee } = planAmounts(total, q.payment.plan);
    lines.push(`Plan mensual a ${q.payment.plan.months} meses: anticipo de ${formatMoney(deposit, q.currency)} y ${q.payment.plan.months} mensualidades de ${formatMoney(monthlyFee, q.currency)} (${formatMoney(planTotal, q.currency)} en total), con hosting y soporte incluidos; el sistema opera en infraestructura de imSoft y el código se transfiere al cubrir la última mensualidad.`);
  }
  lines.push(`Por transferencia bancaria o con tarjeta mediante enlace de pago seguro (Stripe). Se emite CFDI por cada pago; dudas de facturación a ${ISSUER.billingEmail}.`);
  return lines;
}

/** How the contract names the option the client chose. */
export function chosenOptionText(q: Pick<QuoteLike, 'items' | 'apply_iva' | 'payment' | 'currency' | 'discount' | 'accepted_payment_option'>): string | null {
  const o = paymentOptions(q).find((x) => x.key === q.accepted_payment_option);
  return o ? `${o.title}: ${o.summary}` : null;
}

function esc(s: string | null | undefined): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Business days the client has to review a delivery before it counts as accepted. */
export const REVIEW_BUSINESS_DAYS = 5;

/**
 * Software development services contract, in HTML, built from the accepted quote. It is
 * stored in contracts.body_html and can be edited before it is sent. It is a working
 * draft: a lawyer should review it before it is used as a final contract.
 */
export function renderContract(q: QuoteLike & { created_at?: string | null }, contractNumber: string, date = new Date()): string {
  const t = quoteTotals(q);
  const term = deliveryTerm(q, date);
  const milestones = milestoneAmounts(t.total, q.payment.milestones);
  const client = [q.client_name, q.client_company ? `en representación de ${q.client_company}` : '', q.client_rfc ? `RFC ${q.client_rfc}` : '', q.client_address].filter(Boolean).map(esc).join(', ');
  const features = (q.features ?? []).map((f) => f.trim()).filter(Boolean);
  const scopeItems = features.length > 0
    ? features.map((f) => `<li>${esc(f)}</li>`).join('')
    : q.items.map((i) => `<li><strong>${esc(i.name)}</strong>${i.description ? `: ${esc(i.description)}` : ''}${i.quantity !== 1 ? ` (${i.quantity})` : ''}</li>`).join('');
  const scopeListTag = features.length > 0 ? 'ol' : 'ul';
  const payments = milestones.map((m) => { const monthly = monthlyPaymentsText(m.amount, m, q.currency); return `<li>${esc(m.label)}: ${m.pct}% del total, ${formatMoney(m.amount, q.currency)}${monthly ? `, pagadero ${monthly} por transferencia bancaria; la primera vence al cumplirse el hito y las siguientes el mismo día de cada mes` : ''}.</li>`; }).join('');
  const hasMonthlyPayments = milestones.some((m) => monthlyPaymentCount(m) > 1);
  const chosenOption = chosenOptionText(q);
  const plan = q.payment.plan && !validatePlan(q.payment.plan) ? planAmounts(t.total, q.payment.plan) : null;
  const penaltyText = q.terms.daily_penalty > 0
    ? `Si el Cliente no entrega los insumos, contenidos, accesos o aprobaciones que le corresponden en las fechas acordadas, el calendario se recorre por el mismo número de días y, a partir del quinto día hábil de retraso, el Cliente pagará al Prestador ${formatMoney(q.terms.daily_penalty, q.currency)} por cada día hábil adicional de retraso.`
    : 'Si el Cliente no entrega los insumos, contenidos, accesos o aprobaciones que le corresponden en las fechas acordadas, el calendario de entrega se recorre por el mismo número de días de retraso.';
  const dateText = date.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Mexico_City' });

  return `
<h1>Contrato de prestación de servicios de desarrollo de software</h1>
<p class="document-number">Con base en la cotización ${esc(q.number)} · ${esc(dateText)}</p>

<p>Contrato que celebran, por una parte, <strong>${esc(ISSUER.name)}</strong>, persona física con RFC ${esc(ISSUER.rfc)}, inscrita en el ${esc(ISSUER.taxRegime)}, con domicilio en ${esc(ISSUER.address)}, ${esc(ISSUER.city)}, quien opera bajo la marca ${esc(ISSUER.brand)}, en adelante <strong>el Prestador</strong>; y por la otra, <strong>${client}</strong>, en adelante <strong>el Cliente</strong>. Ambas partes se reconocen capacidad para obligarse y acuerdan las siguientes cláusulas.</p>

<h2>Primera. Objeto</h2>
<p>El Prestador desarrollará y entregará al Cliente el proyecto <strong>${esc(q.title)}</strong>, conforme a la cotización ${esc(q.number)} aceptada por el Cliente, que forma parte de este contrato y comprende${features.length > 0 ? ` las siguientes ${features.length} características` : ''}:</p>
<${scopeListTag}>${scopeItems}</${scopeListTag}>
${q.intro ? `<p>${esc(q.intro)}</p>` : ''}

<h2>Segunda. Precio y forma de pago</h2>
<p>El precio total es de <strong>${formatMoney(t.total, q.currency)}</strong> (${t.discount > 0 ? `precio de lista de ${formatMoney(t.listPrice, q.currency)} menos un descuento de ${formatMoney(t.discount, q.currency)} por concepto de "${esc(q.discount?.reason ?? '')}", es decir, ${formatMoney(t.subtotal, q.currency)}` : formatMoney(t.subtotal, q.currency)}${q.apply_iva ? ` más ${formatMoney(t.vat, q.currency)} de IVA` : ', sin IVA'}), pagadero así:</p>${t.discount > 0 ? `
<p>El descuento aplica únicamente a este contrato y no constituye un precio de referencia para trabajos futuros.</p>` : ''}
<ul>${payments}</ul>
${chosenOption ? `<p>El Cliente eligió como forma de pago: <strong>${esc(chosenOption)}</strong>. ${q.accepted_payment_option === 'transfer' ? 'El descuento por transferencia aplica mientras cada pago se cubra por ese medio en la fecha pactada; un pago con tarjeta se cobra sin el descuento.' : ''}${q.accepted_payment_option === 'installments_6' || q.accepted_payment_option === 'installments_12' ? 'Los meses sin intereses los otorga el banco emisor de la tarjeta; el total indicado incluye el costo del plazo y no cambia si el banco no ofrece ese plan, en cuyo caso el Cliente puede pagar en una sola exhibición al precio de lista.' : ''}</p>` : ''}
<p>Los pagos se realizan por transferencia bancaria o mediante enlace de pago con tarjeta${q.payment.card_installments ? ', incluidos meses sin intereses cuando el banco emisor lo permita' : ''}. El Prestador emite CFDI por cada pago recibido; los asuntos de facturación se atienden en ${esc(ISSUER.billingEmail)}. ${hasMonthlyPayments ? 'Las mensualidades pactadas son un pago diferido sin intereses. Los entregables se ponen en producción al cubrirse la primera mensualidad del hito correspondiente; la propiedad se transfiere conforme a la cláusula Quinta, al quedar pagado el total. El atraso en cualquier mensualidad faculta al Prestador a suspender el servicio, los accesos y el soporte hasta que el pago se regularice, sin que ello modifique las fechas de las mensualidades restantes.' : 'Ningún entregable se pone en producción ni se transfiere hasta recibir el pago del hito correspondiente.'}</p>${plan && q.accepted_payment_option === 'plan' ? `
<p><strong>Plan de suscripción.</strong> El Cliente paga un anticipo de ${formatMoney(plan.deposit, q.currency)} al aceptar este contrato y ${q.payment.plan!.months} mensualidades consecutivas de ${formatMoney(plan.monthlyFee, q.currency)} (${formatMoney(plan.planTotal, q.currency)} en total), la primera al ponerse el sistema en producción y las siguientes el mismo día de cada mes, mediante cargo automático a tarjeta o domiciliación. Durante el plan, el Prestador otorga al Cliente una licencia de uso del sistema, lo aloja en su propia infraestructura y le da hosting, soporte y mantenimiento correctivo sin costo adicional; el Cliente conserva en todo momento la propiedad de sus datos y puede exportarlos. El atraso de más de 10 días naturales en una mensualidad faculta al Prestador a suspender el acceso al sistema hasta que se regularice, y el de más de 60 días a dar por terminado el plan, en cuyo caso el Cliente recibe sus datos y el Prestador conserva el código. Al cubrirse la última mensualidad, el Prestador transfiere al Cliente el código fuente y la propiedad conforme a la cláusula Quinta y le ofrece continuar el hosting y soporte mediante una mensualidad reducida cotizada por separado. El Cliente puede liquidar anticipadamente el saldo restante en cualquier momento sin penalización. Este plan es un servicio de licencia, hosting y soporte, no un crédito ni un financiamiento.</p>` : ''}

<h2>Tercera. Plazo de entrega</h2>
<p>El Prestador entregará el proyecto a más tardar el <strong>${esc(longDate(term.deadline))}</strong>, es decir, en un plazo de ${term.weeks} ${term.weeks === 1 ? 'semana' : 'semanas'} contado desde la cotización, siempre que el Cliente entregue el anticipo y los insumos iniciales oportunamente. El plazo se ajustará de común acuerdo si el alcance cambia o si el Cliente retrasa la entrega de insumos, conforme a las cláusulas Sexta y Séptima.</p>

<h2>Cuarta. Entrega y aceptación</h2>
<p>Cada entrega se notificará al Cliente por escrito, con acceso al entregable en un ambiente de pruebas o en producción. El Cliente contará con ${REVIEW_BUSINESS_DAYS} días hábiles para revisarla y reportar por escrito los defectos respecto a lo contratado; el Prestador los corregirá y volverá a presentar la entrega. Si transcurre ese plazo sin observaciones, o si el Cliente usa el entregable para su operación, la entrega se tendrá por aceptada. Las observaciones que amplíen o cambien el alcance se tratan conforme a la cláusula Sexta y no suspenden la aceptación.</p>

<h2>Quinta. Propiedad de los entregables</h2>
<p>${esc(q.terms.ownership)} El Prestador conserva el derecho de mencionar el proyecto en su portafolio, salvo que el Cliente indique lo contrario por escrito. Las herramientas, librerías y componentes de terceros conservan sus propias licencias. El Prestador conserva la propiedad de sus herramientas, componentes y conocimientos genéricos desarrollados antes o fuera de este contrato, y otorga al Cliente licencia para usarlos como parte del proyecto.</p>

<h2>Sexta. Cambios de alcance</h2>
<p>${esc(q.terms.scope_changes)}</p>

<h2>Séptima. Obligaciones del Cliente</h2>
<p>El Cliente entregará oportunamente la información, contenidos, accesos, materiales y aprobaciones necesarios para el desarrollo, y revisará los avances en un plazo razonable. ${esc(penaltyText)} El Cliente garantiza que cuenta con los derechos y autorizaciones sobre los contenidos, datos, marcas y materiales que entregue, y responderá frente a terceros por cualquier reclamación derivada de ellos.</p>

<h2>Octava. Garantía y soporte</h2>
<p>El Prestador corregirá sin costo, durante ${q.terms.warranty_days} días naturales después de la entrega, cualquier defecto de funcionamiento respecto a lo contratado. La garantía no cubre cambios de alcance, fallas causadas por terceros, ni modificaciones realizadas por personas ajenas al Prestador. ${esc(q.terms.support)} Las solicitudes de garantía y soporte se envían a ${esc(ISSUER.supportEmail)}. Fuera de la garantía, el mantenimiento, las mejoras y el soporte se cotizan por separado.</p>

<h2>Novena. Servicios de terceros y operación</h2>
<p>El proyecto puede apoyarse en servicios de terceros, como alojamiento, dominios, correo, pasarelas de pago, mensajería o proveedores de inteligencia artificial. Sus costos, disponibilidad, condiciones y cambios de precio son ajenos al Prestador y corren por cuenta del Cliente, ya sea contratándolos a su nombre o reembolsándolos al Prestador, salvo lo que la cotización incluya expresamente. Los resultados que el software produzca a partir de datos del Cliente o con apoyo de inteligencia artificial, como cálculos, documentos, reportes o recomendaciones, son herramientas de trabajo: su revisión, validación y uso profesional, legal o comercial son responsabilidad exclusiva del Cliente y de quien los firme o emita.</p>

<h2>Décima. Datos personales</h2>
<p>El Cliente es responsable de los datos personales que capture, trate o almacene en el sistema, y de contar con el aviso de privacidad y los consentimientos que exige la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. El Prestador actúa como encargado: trata esos datos únicamente para desarrollar, operar y dar soporte al proyecto, siguiendo las instrucciones del Cliente, con medidas de seguridad razonables, y los devuelve o elimina al terminar el contrato, salvo obligación legal de conservarlos.</p>

<h2>Décima primera. Límite de responsabilidad</h2>
<p>La responsabilidad total del Prestador por cualquier causa derivada de este contrato se limita al monto efectivamente pagado por el Cliente en los doce meses anteriores al hecho que la origine. El Prestador no responde por lucro cesante, pérdida de datos, de negocio o de oportunidades, ni por daños indirectos, aun cuando se le haya advertido de su posibilidad. Esta limitación no aplica en casos de dolo o negligencia grave del Prestador.</p>

<h2>Décima segunda. Confidencialidad</h2>
<p>Ambas partes tratarán como confidencial la información técnica, comercial y de negocio que conozcan con motivo de este contrato, y no la divulgarán a terceros sin autorización escrita, durante la vigencia del contrato y dos años después.</p>

<h2>Décima tercera. Vigencia, terminación y cesión</h2>
<p>Este contrato entra en vigor en la fecha de su aceptación y termina cuando ambas partes cumplan sus obligaciones, incluido el periodo de garantía. Cualquiera de las partes puede darlo por terminado anticipadamente mediante aviso escrito. En ese caso, el Cliente pagará el trabajo realizado hasta la fecha, y el Prestador entregará los avances correspondientes a lo pagado. Los anticipos no son reembolsables una vez iniciado el trabajo. Ninguna de las partes podrá ceder este contrato sin el consentimiento escrito de la otra. Las cláusulas de propiedad, datos personales, límite de responsabilidad y confidencialidad sobreviven a la terminación.</p>

<h2>Décima cuarta. Comunicaciones y aceptación</h2>
<p>Las comunicaciones entre las partes se realizan por escrito a los correos indicados en este contrato y en la cotización, y se tienen por recibidas al día hábil siguiente de su envío. Las partes reconocen la aceptación en línea de este contrato, con registro de nombre, fecha, hora y dirección de red, como manifestación válida de su consentimiento, con los mismos efectos que la firma autógrafa, conforme al Código de Comercio y al Código Civil Federal.</p>

<h2>Décima quinta. Jurisdicción</h2>
<p>Para la interpretación y cumplimiento de este contrato, las partes se someten a las leyes y a los tribunales competentes de ${esc(ISSUER.city)}, renunciando a cualquier otro fuero que pudiera corresponderles.</p>

<p>Leído que fue por ambas partes y enteradas de su contenido y alcance, lo aceptan en ${esc(ISSUER.city)}, el ${esc(dateText)}.</p>
`.trim();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
