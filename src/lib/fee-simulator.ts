/**
 * Fee simulator: what the client pays, what Stripe keeps, what goes to the SAT and what is
 * left, per milestone and per payment method. Pure logic; the UI lives in
 * src/app/[lang]/dashboard/admin/simulador/fee-simulator.tsx.
 *
 * Assumptions (verified 2026-09-14):
 * - Stripe Mexico: 3.6 % + $3 MXN per domestic card charge; installments +5 % (3),
 *   +7.5 % (6), +12.5 % (12), computed on the total charged, VAT included.
 * - With a card the client pays the total; corporate-client withholdings (1.25 % ISR and
 *   two thirds of the VAT) only apply when paying by transfer against a CFDI.
 * - RESICO (individual): ISR on income received before VAT, by monthly bracket, with no
 *   deductions. It's an estimate for quoting, not a tax return.
 */

export type Method = 'transfer' | 'card' | '3' | '6' | '12';
export type Milestones = '1' | '2' | '3';

export const VAT_RATE = 0.16;
export const STRIPE_PCT = 0.036;
export const STRIPE_FIXED = 3;
/** Extra Stripe rate per method: null = no card (transfer), 0 = card in one payment. */
export const INSTALLMENT_EXTRA: Record<Method, number | null> = { transfer: null, card: 0, '3': 0.05, '6': 0.075, '12': 0.125 };
export const MILESTONE_SPLITS: Record<Milestones, number[]> = { '1': [1], '2': [0.5, 0.5], '3': [0.4, 0.3, 0.3] };
export const CORPORATE_ISR_WITHHOLDING = 0.0125;
export const CORPORATE_VAT_WITHHOLDING = 2 / 3;
/** RESICO monthly brackets for individuals: [income cap, rate]. */
export const RESICO_BRACKETS: Array<[number, number]> = [
  [25000, 0.01],
  [50000, 0.011],
  [83333.33, 0.015],
  [208333.33, 0.02],
  [291666.67, 0.025],
];

export interface Config {
  price: number;
  method: Method;
  milestones: Milestones;
  chargeVat: boolean;
  corporateClient: boolean;
  monthlyIncome: number;
  vatOnFee: boolean;
}

export interface MilestoneBreakdown {
  base: number;
  vat: number;
  charge: number;
  fee: number;
  withheldIsr: number;
  withheldVat: number;
  /** Cash that lands on the day of the charge. */
  received: number;
  monthlyPayment: number | null;
}

export interface SimulationResult {
  parts: MilestoneBreakdown[];
  charge: number;
  vat: number;
  fee: number;
  withheldIsr: number;
  withheldVat: number;
  received: number;
  rate: number;
  isr: number;
  isrDue: number;
  vatDue: number;
  net: number;
}

export const METHODS: Method[] = ['transfer', 'card', '3', '6', '12'];

export function resicoRate(monthlyIncome: number): number {
  for (const [cap, rate] of RESICO_BRACKETS) if (monthlyIncome <= cap) return rate;
  return 0.025;
}

export function computeMilestone(base: number, cfg: Config, method: Method = cfg.method): MilestoneBreakdown {
  const vat = cfg.chargeVat ? base * VAT_RATE : 0;
  const charge = base + vat;
  const extra = INSTALLMENT_EXTRA[method];
  const isCard = extra !== null;
  let fee = 0;
  if (isCard) {
    fee = charge * (STRIPE_PCT + extra) + STRIPE_FIXED;
    if (cfg.vatOnFee) fee *= 1 + VAT_RATE;
  }
  const withheldIsr = !isCard && cfg.corporateClient ? base * CORPORATE_ISR_WITHHOLDING : 0;
  const withheldVat = !isCard && cfg.corporateClient ? vat * CORPORATE_VAT_WITHHOLDING : 0;
  const months = isCard && extra > 0 ? Number(method) : null;
  return { base, vat, charge, fee, withheldIsr, withheldVat, received: charge - fee - withheldIsr - withheldVat, monthlyPayment: months ? charge / months : null };
}

export function simulate(cfg: Config, method: Method = cfg.method): SimulationResult {
  const parts = MILESTONE_SPLITS[cfg.milestones].map((p) => computeMilestone(cfg.price * p, cfg, method));
  const sum = (k: keyof MilestoneBreakdown) => parts.reduce((s, x) => s + (Number(x[k]) || 0), 0);
  const rate = resicoRate(cfg.monthlyIncome);
  const isr = cfg.price * rate;
  const withheldIsr = sum('withheldIsr');
  const withheldVat = sum('withheldVat');
  const fee = sum('fee');
  const vat = sum('vat');
  return {
    parts,
    charge: sum('charge'),
    vat,
    fee,
    withheldIsr,
    withheldVat,
    received: sum('received'),
    rate,
    isr,
    isrDue: Math.max(0, isr - withheldIsr),
    vatDue: Math.max(0, vat - withheldVat),
    net: cfg.price - fee - isr,
  };
}

/**
 * Inverse: base price (before VAT) to quote so that, after the Stripe fee, `net` pesos
 * land, not counting the VAT that is handed over anyway. Rounded up to the hundred.
 */
export function priceForNet(net: number, cfg: Config): number {
  const extra = INSTALLMENT_EXTRA[cfg.method];
  if (extra === null) return Math.ceil(net / 100) * 100;
  const r = STRIPE_PCT + extra;
  const k = cfg.vatOnFee ? 1 + VAT_RATE : 1;
  const count = MILESTONE_SPLITS[cfg.milestones].length;
  const vatFactor = cfg.chargeVat ? 1 + VAT_RATE : 1;
  const price = (net + STRIPE_FIXED * count * k) / (1 - vatFactor * r * k);
  return Math.ceil(price / 100) * 100;
}

export function methodLabel(m: Method, lang: string): string {
  const es: Record<Method, string> = { transfer: 'Transferencia', card: 'Tarjeta, un pago', '3': '3 meses sin intereses', '6': '6 meses sin intereses', '12': '12 meses sin intereses' };
  const en: Record<Method, string> = { transfer: 'Bank transfer', card: 'Card, one payment', '3': '3 interest-free months', '6': '6 interest-free months', '12': '12 interest-free months' };
  return (lang === 'en' ? en : es)[m];
}

export function milestoneNames(m: Milestones, lang: string): string[] {
  const es: Record<Milestones, string[]> = { '1': ['Pago único'], '2': ['Anticipo', 'Liquidación'], '3': ['Anticipo', 'Entrega intermedia', 'Liquidación'] };
  const en: Record<Milestones, string[]> = { '1': ['Single payment'], '2': ['Deposit', 'Final payment'], '3': ['Deposit', 'Mid-project', 'Final payment'] };
  return (lang === 'en' ? en : es)[m];
}

/** Config keys as the simulator saved them in localStorage before the English rename (2026-10-31). */
const LEGACY_CONFIG_KEYS: Record<string, keyof Config> = {
  precio: 'price',
  metodo: 'method',
  hitos: 'milestones',
  cobraIva: 'chargeVat',
  clientePersonaMoral: 'corporateClient',
  ingresoMensual: 'monthlyIncome',
  ivaSobreComision: 'vatOnFee',
};

/**
 * Saved settings (localStorage) over the defaults. Accepts the current keys and the legacy
 * Spanish ones, so the admin doesn't lose what was saved before the rename; unknown keys
 * are dropped.
 */
export function configFromStorage(saved: unknown, defaults: Config): Config {
  if (!saved || typeof saved !== 'object') return defaults;
  const out: Config = { ...defaults };
  const target = out as unknown as Record<string, unknown>;
  for (const [k, v] of Object.entries(saved as Record<string, unknown>)) {
    const key = k in defaults ? k : LEGACY_CONFIG_KEYS[k];
    if (key && typeof v === typeof defaults[key as keyof Config]) target[key] = v;
  }
  return out;
}
