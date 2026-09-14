/**
 * Simulador de cobros: cuanto paga el cliente, cuanto se queda Stripe, cuanto va al
 * SAT y cuanto queda, por hito y por forma de pago. Logica pura; la UI vive en
 * src/app/[lang]/dashboard/admin/simulador/simulador.tsx.
 *
 * Supuestos (verificados el 14-sep-2026):
 * - Stripe Mexico: 3.6 % + $3 MXN por cargo con tarjeta nacional; MSI +5 % (3),
 *   +7.5 % (6), +12.5 % (12), calculados sobre el total cobrado, IVA incluido.
 * - Con tarjeta el cliente paga el total; las retenciones de persona moral (1.25 % ISR y
 *   dos tercios del IVA) solo aplican pagando por transferencia contra CFDI.
 * - RESICO persona fisica: ISR sobre ingresos cobrados sin IVA, por tramo mensual, sin
 *   deducciones. Es una estimacion para cotizar, no una declaracion.
 */

export type Metodo = 'transfer' | 'card' | '3' | '6' | '12';
export type Hitos = '1' | '2' | '3';

export const IVA = 0.16;
export const STRIPE_PCT = 0.036;
export const STRIPE_FIJA = 3;
export const MSI_EXTRA: Record<Metodo, number | null> = { transfer: null, card: 0, '3': 0.05, '6': 0.075, '12': 0.125 };
export const HITOS: Record<Hitos, number[]> = { '1': [1], '2': [0.5, 0.5], '3': [0.4, 0.3, 0.3] };
export const RET_ISR_PM = 0.0125;
export const RET_IVA_PM = 2 / 3;
/** Tramos mensuales RESICO persona fisica: [tope de ingreso, tasa]. */
export const RESICO: Array<[number, number]> = [
  [25000, 0.01],
  [50000, 0.011],
  [83333.33, 0.015],
  [208333.33, 0.02],
  [291666.67, 0.025],
];

export interface Config {
  precio: number;
  metodo: Metodo;
  hitos: Hitos;
  cobraIva: boolean;
  clientePersonaMoral: boolean;
  ingresoMensual: number;
  ivaSobreComision: boolean;
}

export interface Hito {
  base: number;
  iva: number;
  cobro: number;
  fee: number;
  retISR: number;
  retIVA: number;
  cae: number;
  mensualidad: number | null;
}

export interface Resultado {
  partes: Hito[];
  cobro: number;
  iva: number;
  fee: number;
  retISR: number;
  retIVA: number;
  cae: number;
  tasa: number;
  isr: number;
  isrPagar: number;
  ivaEnterar: number;
  neto: number;
}

export const METODOS: Metodo[] = ['transfer', 'card', '3', '6', '12'];

export function tasaResico(ingresoMensual: number): number {
  for (const [tope, tasa] of RESICO) if (ingresoMensual <= tope) return tasa;
  return 0.025;
}

export function calcularHito(base: number, cfg: Config, metodo: Metodo = cfg.metodo): Hito {
  const iva = cfg.cobraIva ? base * IVA : 0;
  const cobro = base + iva;
  const extra = MSI_EXTRA[metodo];
  const esTarjeta = extra !== null;
  let fee = 0;
  if (esTarjeta) {
    fee = cobro * (STRIPE_PCT + extra) + STRIPE_FIJA;
    if (cfg.ivaSobreComision) fee *= 1 + IVA;
  }
  const retISR = !esTarjeta && cfg.clientePersonaMoral ? base * RET_ISR_PM : 0;
  const retIVA = !esTarjeta && cfg.clientePersonaMoral ? iva * RET_IVA_PM : 0;
  const meses = esTarjeta && extra > 0 ? Number(metodo) : null;
  return { base, iva, cobro, fee, retISR, retIVA, cae: cobro - fee - retISR - retIVA, mensualidad: meses ? cobro / meses : null };
}

export function calcular(cfg: Config, metodo: Metodo = cfg.metodo): Resultado {
  const partes = HITOS[cfg.hitos].map((p) => calcularHito(cfg.precio * p, cfg, metodo));
  const sum = (k: keyof Hito) => partes.reduce((s, x) => s + (Number(x[k]) || 0), 0);
  const tasa = tasaResico(cfg.ingresoMensual);
  const isr = cfg.precio * tasa;
  const retISR = sum('retISR');
  const retIVA = sum('retIVA');
  const fee = sum('fee');
  const iva = sum('iva');
  return {
    partes,
    cobro: sum('cobro'),
    iva,
    fee,
    retISR,
    retIVA,
    cae: sum('cae'),
    tasa,
    isr,
    isrPagar: Math.max(0, isr - retISR),
    ivaEnterar: Math.max(0, iva - retIVA),
    neto: cfg.precio - fee - isr,
  };
}

/**
 * Inverso: precio base (sin IVA) a cotizar para que, tras la comision de Stripe, caigan
 * `neto` pesos sin contar el IVA que de todos modos se entrega. Redondeado a la centena.
 */
export function precioParaNeto(neto: number, cfg: Config): number {
  const extra = MSI_EXTRA[cfg.metodo];
  if (extra === null) return Math.ceil(neto / 100) * 100;
  const r = STRIPE_PCT + extra;
  const k = cfg.ivaSobreComision ? 1 + IVA : 1;
  const nHitos = HITOS[cfg.hitos].length;
  const factorIva = cfg.cobraIva ? 1 + IVA : 1;
  const precio = (neto + STRIPE_FIJA * nHitos * k) / (1 - factorIva * r * k);
  return Math.ceil(precio / 100) * 100;
}

export function etiquetaMetodo(m: Metodo, lang: string): string {
  const es: Record<Metodo, string> = { transfer: 'Transferencia', card: 'Tarjeta, un pago', '3': '3 meses sin intereses', '6': '6 meses sin intereses', '12': '12 meses sin intereses' };
  const en: Record<Metodo, string> = { transfer: 'Bank transfer', card: 'Card, one payment', '3': '3 interest-free months', '6': '6 interest-free months', '12': '12 interest-free months' };
  return (lang === 'en' ? en : es)[m];
}

export function nombresHitos(h: Hitos, lang: string): string[] {
  const es: Record<Hitos, string[]> = { '1': ['Pago único'], '2': ['Anticipo', 'Liquidación'], '3': ['Anticipo', 'Entrega intermedia', 'Liquidación'] };
  const en: Record<Hitos, string[]> = { '1': ['Single payment'], '2': ['Deposit', 'Final payment'], '3': ['Deposit', 'Mid-project', 'Final payment'] };
  return (lang === 'en' ? en : es)[h];
}
