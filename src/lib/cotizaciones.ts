/**
 * Logica pura de cotizaciones y contratos: totales, folios, vigencia, hitos y la
 * plantilla del contrato. Sin E/S; las paginas y rutas del panel la usan.
 */
import { IVA, MSI_EXTRA } from './simulador-cobros';
import { msiEtiqueta, MSI_MINIMO_MXN } from './msi';
import { EMISOR } from '@/config/emisor';
import { DESCUENTO_TRANSFERENCIA_PCT } from '@/config/precios';

export interface QuoteItem {
  name: string;
  description?: string;
  quantity: number;
  price: number;
}
export interface Hito {
  label: string;
  pct: number;
  /**
   * En cuantos pagos mensuales por transferencia se cubre este hito (1 = un solo pago).
   * Es un acuerdo directo con el cliente: no tiene que ver con Stripe ni con los MSI.
   */
  monthly_payments?: number;
}
/**
 * Plan de suscripcion a N meses (31-oct-2026): anticipo que cubre el trabajo, mensualidad
 * que incluye hosting y soporte, el sistema vive en infraestructura de imSoft hasta
 * liquidar y el codigo se transfiere al terminar. Se vende como licencia + servicio,
 * nunca como credito. El recargo cubre el tiempo y el hosting de esos meses.
 */
export interface PlanMensual {
  months: number;
  /** Porcentaje del total que se paga de entrada. */
  deposit_pct: number;
  /** Porcentaje sobre el total que se suma por pagar en el plan. */
  surcharge_pct: number;
}
export const PLAN_DEFAULT: PlanMensual = { months: 24, deposit_pct: 30, surcharge_pct: 40 };

export interface QuotePayment {
  milestones: Hito[];
  card_installments: boolean;
  /** Descuento por transferencia (%). Si falta, el de src/config/precios.ts. */
  transfer_discount_pct?: number;
  /** Plan mensual ofrecido; null o ausente = no se ofrece. */
  plan?: PlanMensual | null;
}

export type OpcionPagoClave = 'transfer' | 'card' | 'installments_6' | 'installments_12' | 'plan';
export interface OpcionPago {
  clave: OpcionPagoClave;
  titulo: string;
  /** Lo que paga el cliente en total con esta opcion. */
  total: number;
  /** Una linea que lo explica ("12 pagos de $5,958 con tarjeta"). */
  resumen: string;
}

export function planValido(plan: PlanMensual | null | undefined): string | null {
  if (!plan) return null;
  if (!(plan.months >= 6 && plan.months <= 36)) return 'El plan va de 6 a 36 meses.';
  if (!(plan.deposit_pct >= 10 && plan.deposit_pct <= 60)) return 'El anticipo del plan va del 10 al 60 %.';
  if (!(plan.surcharge_pct >= 0 && plan.surcharge_pct <= 80)) return 'El recargo del plan va del 0 al 80 %.';
  return null;
}

export function descuentoTransferenciaPct(p: Pick<QuotePayment, 'transfer_discount_pct'>): number {
  const v = Number(p.transfer_discount_pct);
  return Number.isFinite(v) && v >= 0 && v <= 20 ? v : DESCUENTO_TRANSFERENCIA_PCT;
}

/** Lo que cuesta el plan: anticipo, total y mensualidad, sobre el total con IVA. */
export function importesPlan(total: number, plan: PlanMensual) {
  const anticipo = round2((total * plan.deposit_pct) / 100);
  const totalPlan = round2(total * (1 + plan.surcharge_pct / 100));
  const mensualidad = round2((totalPlan - anticipo) / plan.months);
  return { anticipo, totalPlan, mensualidad };
}

/** Total con tarjeta a N meses sin intereses: el costo del plazo (Stripe + IVA) va al precio. */
export function totalConMsi(total: number, months: 6 | 12): number {
  return round2(total * (1 + (MSI_EXTRA[String(months) as '6' | '12'] ?? 0) * (1 + IVA)));
}

/**
 * Las formas de pago que ve el cliente, cada una con su total. La lista ya trae la
 * comision de tarjeta; por transferencia hay descuento; los MSI y el plan cuestan mas y
 * se dice cuanto. El cliente elige una al aceptar y queda en el contrato.
 */
export function opcionesDePago(q: Pick<QuoteLike, 'items' | 'apply_iva' | 'payment' | 'currency' | 'discount'>): OpcionPago[] {
  const { total } = totales(q);
  const c = q.currency;
  const dto = descuentoTransferenciaPct(q.payment);
  const out: OpcionPago[] = [];
  const totalTransferencia = round2(total * (1 - dto / 100));
  out.push({ clave: 'transfer', titulo: 'Transferencia bancaria', total: totalTransferencia, resumen: dto > 0 ? `${dto} % de descuento: ${mxn(totalTransferencia, c)} en total` : `${mxn(total, c)} en total` });
  out.push({ clave: 'card', titulo: 'Tarjeta en una sola exhibición', total, resumen: `${mxn(total, c)} en total, por enlace de pago seguro` });
  if (q.payment.card_installments && c === 'MXN' && total >= MSI_MINIMO_MXN) {
    for (const m of [6, 12] as const) {
      const t = totalConMsi(total, m);
      out.push({ clave: m === 6 ? 'installments_6' : 'installments_12', titulo: `Tarjeta a ${m} meses sin intereses`, total: t, resumen: `${m} pagos de ${mxn(t / m, c)}; ${mxn(t, c)} en total` });
    }
  }
  if (q.payment.plan && !planValido(q.payment.plan)) {
    const { anticipo, totalPlan, mensualidad } = importesPlan(total, q.payment.plan);
    out.push({ clave: 'plan', titulo: `Plan mensual a ${q.payment.plan.months} meses`, total: totalPlan, resumen: `Anticipo de ${mxn(anticipo, c)} y ${q.payment.plan.months} mensualidades de ${mxn(mensualidad, c)}, con hosting y soporte incluidos` });
  }
  return out;
}

export function esOpcionPago(v: unknown): v is OpcionPagoClave {
  return typeof v === 'string' && ['transfer', 'card', 'installments_6', 'installments_12', 'plan'].includes(v);
}
export interface QuoteTerms {
  warranty_days: number;
  support: string;
  ownership: string;
  scope_changes: string;
  /** MXN por dia habil de retraso del cliente en entregar insumos. 0 = sin penalizacion. */
  daily_penalty: number;
  /** Fecha limite del proyecto (ISO). El plazo en semanas se calcula desde la cotizacion. */
  deadline?: string | null;
  /** Solo de respaldo para cotizaciones viejas sin fecha_limite. */
  delivery_weeks: number;
}
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

/** Descuento o promocion de la cotizacion. Siempre con motivo: el cliente lo ve. */
export interface QuoteDiscount {
  /** Texto que ve el cliente, p. ej. "Cliente desde 2023". */
  reason: string;
  type: 'pct' | 'amount';
  /** Porcentaje (0-100) o monto en la moneda de la cotizacion, segun `tipo`. */
  value: number;
}

/** Promociones con nombre, para no inventar el texto cada vez. */
export const PROMOCIONES: Array<{ clave: string; reason: string; type: QuoteDiscount['type']; value: number }> = [
  { clave: 'primeros', reason: 'Promoción de lanzamiento: primer proyecto con imSoft', type: 'pct', value: 10 },
  { clave: 'primer-proyecto', reason: 'Primer proyecto con imSoft', type: 'pct', value: 10 },
  { clave: 'recurrente', reason: 'Cliente recurrente de imSoft', type: 'pct', value: 10 },
  { clave: 'referido', reason: 'Cliente referido', type: 'pct', value: 5 },
  { clave: 'temporada', reason: 'Promoción de temporada', type: 'pct', value: 10 },
];

/** Arriba de este porcentaje el margen (Stripe + ISR) se adelgaza mas de lo que parece. */
export const DESCUENTO_MAXIMO_RECOMENDADO_PCT = 20;

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
  /** Precio unico del proyecto: una sola linea en `items`. Ver precioProyecto(). */
  items: QuoteItem[];
  /** Que incluye la aplicacion, una caracteristica por entrada. */
  features?: string[] | null;
  currency: string;
  apply_iva: boolean;
  /** Descuento opcional; se aplica al precio de lista antes del IVA. */
  discount?: QuoteDiscount | null;
  payment: QuotePayment;
  terms: QuoteTerms;
  notes?: string | null;
  valid_until: string;
  accepted_at?: string | null;
  accepted_name?: string | null;
  /** Forma de pago que eligio el cliente al aceptar (ver opcionesDePago). */
  accepted_payment_option?: OpcionPagoClave | null;
}

/** El precio del proyecto sin IVA (la unica linea de `items`). */
export function precioProyecto(q: Pick<QuoteLike, 'items'>): number {
  return subtotal(q.items);
}

/** Como se guarda un precio unico en `items`, para que totales() siga funcionando. */
export function itemsDesdePrecio(titulo: string, price: number): QuoteItem[] {
  return [{ name: titulo, quantity: 1, price: Number(price) || 0 }];
}

export function featuresValidas(features: string[]): string | null {
  const limpias = features.map((f) => f.trim()).filter(Boolean);
  if (limpias.length === 0) return 'Agrega al menos una característica de la aplicación.';
  return null;
}

export interface PlazoEntrega {
  fechaLimite: string;
  dias: number;
  semanas: number;
  texto: string;
}

/**
 * Plazo de entrega a partir de la fecha limite: dias naturales y semanas (redondeadas
 * hacia arriba) contados desde que se creo la cotizacion. Si no hay fecha limite, se usa
 * entrega_semanas como antes.
 */
export function plazoEntrega(q: Pick<QuoteLike, 'terms'> & { created_at?: string | null }, hoy = new Date()): PlazoEntrega {
  const desde = q.created_at ? q.created_at.slice(0, 10) : hoy.toISOString().slice(0, 10);
  let fechaLimite = q.terms.deadline?.slice(0, 10) || null;
  if (!fechaLimite) {
    const d = new Date(`${desde}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + (q.terms.delivery_weeks || 0) * 7);
    fechaLimite = d.toISOString().slice(0, 10);
  }
  const dias = Math.max(0, Math.round((Date.parse(`${fechaLimite}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86400000));
  const semanas = Math.max(1, Math.ceil(dias / 7));
  const texto = `${fechaLarga(fechaLimite)} (${semanas} ${semanas === 1 ? 'semana' : 'semanas'} a partir de la cotización)`;
  return { fechaLimite, dias, semanas, texto };
}

export function subtotal(items: QuoteItem[]): number {
  return round2(items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0));
}

/** Importe del descuento sobre el precio de lista (nunca mayor que el precio). */
export function importeDescuento(lista: number, d?: QuoteDiscount | null): number {
  if (!d || !(d.value > 0)) return 0;
  const bruto = d.type === 'pct' ? (lista * d.value) / 100 : d.value;
  return round2(Math.min(lista, Math.max(0, bruto)));
}

/** Porcentaje efectivo del descuento, para avisos. */
export function porcentajeDescuento(q: Pick<QuoteLike, 'items' | 'discount'>): number {
  const lista = subtotal(q.items);
  if (!(lista > 0)) return 0;
  return round2((importeDescuento(lista, q.discount) / lista) * 100);
}

/** Descuento valido: con motivo y con valor positivo dentro de rango. */
export function descuentoValido(d: QuoteDiscount | null | undefined): string | null {
  if (!d) return null;
  if (!d.reason?.trim()) return 'El descuento necesita un motivo; el cliente lo va a ver.';
  if (!(d.value > 0)) return 'El descuento debe ser mayor que cero.';
  if (d.type === 'pct' && d.value >= 100) return 'El descuento no puede ser del 100 %.';
  return null;
}

/**
 * Totales: `lista` es el precio sin descuento, `subtotal` el precio ya con descuento
 * (base del IVA y de los hitos), `iva` y `total`.
 */
export function totales(q: Pick<QuoteLike, 'items' | 'apply_iva'> & { discount?: QuoteDiscount | null }) {
  const lista = subtotal(q.items);
  const descuento = importeDescuento(lista, q.discount);
  const sub = round2(lista - descuento);
  const iva = q.apply_iva ? round2(sub * IVA) : 0;
  return { lista, descuento, subtotal: sub, iva, total: round2(sub + iva) };
}

/** Importe de cada hito sobre el total con IVA; el ultimo absorbe el redondeo. */
export function importesHitos(total: number, hitos: Hito[]): Array<Hito & { importe: number }> {
  if (hitos.length === 0) return [];
  let acumulado = 0;
  return hitos.map((h, i) => {
    const importe = i === hitos.length - 1 ? round2(total - acumulado) : round2((total * h.pct) / 100);
    acumulado = round2(acumulado + importe);
    return { ...h, importe };
  });
}

export function hitosValidos(hitos: Hito[]): string | null {
  if (hitos.length === 0) return 'Agrega al menos un hito de pago.';
  const suma = hitos.reduce((s, h) => s + (Number(h.pct) || 0), 0);
  if (Math.abs(suma - 100) > 0.01) return `Los hitos suman ${suma}%; deben sumar 100%.`;
  if (hitos.some((h) => !h.label.trim())) return 'Cada hito necesita un nombre.';
  if (hitos.some((h) => h.monthly_payments !== undefined && (!Number.isInteger(Number(h.monthly_payments)) || Number(h.monthly_payments) < 1 || Number(h.monthly_payments) > 24))) return 'Las mensualidades de un hito van de 1 a 24.';
  return null;
}

/** Numero de mensualidades de un hito (1 si se paga de una vez). */
export function numMensualidades(h: Pick<Hito, 'monthly_payments'>): number {
  const n = Math.round(Number(h.monthly_payments) || 1);
  return n >= 1 ? n : 1;
}

/** Reparte el importe de un hito en pagos mensuales; el ultimo absorbe el redondeo. */
export function importesMensualidades(importe: number, n: number): number[] {
  const k = Math.max(1, Math.round(n));
  const base = round2(importe / k);
  return Array.from({ length: k }, (_, i) => (i === k - 1 ? round2(importe - base * (k - 1)) : base));
}

/** "en 3 mensualidades de $X" o '' si es un solo pago. */
export function textoMensualidades(importe: number, h: Pick<Hito, 'monthly_payments'>, currency = 'MXN'): string {
  const n = numMensualidades(h);
  if (n <= 1) return '';
  const partes = importesMensualidades(importe, n);
  const iguales = partes.every((x) => x === partes[0]);
  return iguales
    ? `en ${n} mensualidades de ${mxn(partes[0], currency)}`
    : `en ${n} mensualidades: ${n - 1} de ${mxn(partes[0], currency)} y una última de ${mxn(partes[n - 1], currency)}`;
}

export function itemsValidos(items: QuoteItem[]): string | null {
  if (items.length === 0) return 'Agrega al menos un concepto.';
  if (items.some((i) => !i.name.trim())) return 'Cada concepto necesita nombre.';
  if (items.some((i) => !(Number(i.quantity) > 0) || !(Number(i.price) >= 0))) return 'Cantidad y precio deben ser válidos.';
  return null;
}

/** COT-2026-007 / CON-2026-003, a partir del ultimo folio del mismo tipo y ano. */
export function siguienteFolio(prefijo: 'COT' | 'CON', ultimoFolio: string | null | undefined, hoy = new Date()): string {
  const anio = hoy.getUTCFullYear();
  const m = (ultimoFolio ?? '').match(new RegExp(`^${prefijo}-(\\d{4})-(\\d+)$`));
  const n = m && Number(m[1]) === anio ? Number(m[2]) + 1 : 1;
  return `${prefijo}-${anio}-${String(n).padStart(3, '0')}`;
}

export function fechaVigencia(dias: number, desde = new Date()): string {
  const d = new Date(desde);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function estaVencida(q: Pick<QuoteLike, 'valid_until' | 'status'>, hoy = new Date()): boolean {
  if (q.status === 'accepted') return false;
  return hoy.toISOString().slice(0, 10) > q.valid_until;
}

/** Si se puede aceptar en linea ahora mismo; si no, por que. */
export function motivoNoAceptable(q: Pick<QuoteLike, 'valid_until' | 'status'>, hoy = new Date()): string | null {
  if (q.status === 'accepted') return 'Esta cotización ya fue aceptada.';
  if (q.status === 'rejected') return 'Esta cotización fue rechazada.';
  if (q.status === 'draft') return 'Esta cotización todavía no se ha enviado.';
  if (estaVencida(q, hoy)) return `Esta cotización venció el ${fechaLarga(q.valid_until)}. Pide una nueva.`;
  return null;
}

export function generarToken(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const mxn = (n: number, currency = 'MXN') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n);

export function fechaLarga(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

/** Texto de forma de pago para cotizacion y contrato. */
export function textoFormaDePago(q: Pick<QuoteLike, 'items' | 'apply_iva' | 'payment' | 'currency' | 'discount'>): string[] {
  const { total } = totales(q);
  const hitos = importesHitos(total, q.payment.milestones);
  const lineas = hitos.map((h) => { const m = textoMensualidades(h.importe, h, q.currency); return `${h.label}: ${h.pct}% (${mxn(h.importe, q.currency)})${m ? `, ${m} por transferencia` : ''}`; });
  if (hitos.some((h) => numMensualidades(h) > 1)) lineas.push('Las mensualidades son pagos por transferencia bancaria, sin intereses: la primera vence al cumplirse el hito y las siguientes cada mes.');
  const dto = descuentoTransferenciaPct(q.payment);
  if (dto > 0) lineas.push(`Pagando por transferencia bancaria, ${dto} % de descuento: ${mxn(round2(total * (1 - dto / 100)), q.currency)} en total.`);
  if (q.payment.card_installments && q.currency === 'MXN' && total >= MSI_MINIMO_MXN) {
    const seis = msiEtiqueta(totalConMsi(total, 6), 6);
    lineas.push(`Con tarjeta de crédito a 6 o 12 meses sin intereses con bancos participantes; el costo del plazo va en el total: a 6 meses ${mxn(totalConMsi(total, 6), q.currency)}${seis ? ` (${seis.replace(/^o /, '')})` : ''} y a 12 meses ${mxn(totalConMsi(total, 12), q.currency)}.`);
  }
  if (q.payment.plan && !planValido(q.payment.plan)) {
    const { anticipo, totalPlan, mensualidad } = importesPlan(total, q.payment.plan);
    lineas.push(`Plan mensual a ${q.payment.plan.months} meses: anticipo de ${mxn(anticipo, q.currency)} y ${q.payment.plan.months} mensualidades de ${mxn(mensualidad, q.currency)} (${mxn(totalPlan, q.currency)} en total), con hosting y soporte incluidos; el sistema opera en infraestructura de imSoft y el código se transfiere al cubrir la última mensualidad.`);
  }
  lineas.push(`Por transferencia bancaria o con tarjeta mediante enlace de pago seguro (Stripe). Se emite CFDI por cada pago; dudas de facturación a ${EMISOR.emailFacturacion}.`);
  return lineas;
}

/** Como se nombra en el contrato la opcion que eligio el cliente. */
export function textoOpcionElegida(q: Pick<QuoteLike, 'items' | 'apply_iva' | 'payment' | 'currency' | 'discount' | 'accepted_payment_option'>): string | null {
  const o = opcionesDePago(q).find((x) => x.clave === q.accepted_payment_option);
  return o ? `${o.titulo}: ${o.resumen}` : null;
}

function esc(s: string | null | undefined): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Contrato de prestacion de servicios de desarrollo de software, en HTML, a partir
 * de la cotizacion aceptada. Se guarda en contracts.body_html y se puede editar antes
 * de enviarlo. Es un borrador de trabajo: un abogado deberia revisarlo antes de usarlo
 * como contrato definitivo.
 */
/** Dias habiles que tiene el cliente para revisar una entrega antes de que se tenga por aceptada. */
export const DIAS_REVISION = 5;

export function renderContrato(q: QuoteLike & { created_at?: string | null }, folioContrato: string, fecha = new Date()): string {
  const t = totales(q);
  const plazo = plazoEntrega(q, fecha);
  const hitos = importesHitos(t.total, q.payment.milestones);
  const cliente = [q.client_name, q.client_company ? `en representación de ${q.client_company}` : '', q.client_rfc ? `RFC ${q.client_rfc}` : '', q.client_address].filter(Boolean).map(esc).join(', ');
  const features = (q.features ?? []).map((f) => f.trim()).filter(Boolean);
  const alcance = features.length > 0
    ? features.map((f) => `<li>${esc(f)}</li>`).join('')
    : q.items.map((i) => `<li><strong>${esc(i.name)}</strong>${i.description ? `: ${esc(i.description)}` : ''}${i.quantity !== 1 ? ` (${i.quantity})` : ''}</li>`).join('');
  const listaAlcance = features.length > 0 ? 'ol' : 'ul';
  const pagos = hitos.map((h) => { const m = textoMensualidades(h.importe, h, q.currency); return `<li>${esc(h.label)}: ${h.pct}% del total, ${mxn(h.importe, q.currency)}${m ? `, pagadero ${m} por transferencia bancaria; la primera vence al cumplirse el hito y las siguientes el mismo día de cada mes` : ''}.</li>`; }).join('');
  const hayMensualidades = hitos.some((h) => numMensualidades(h) > 1);
  const opcionElegida = textoOpcionElegida(q);
  const plan = q.payment.plan && !planValido(q.payment.plan) ? importesPlan(t.total, q.payment.plan) : null;
  const penal = q.terms.daily_penalty > 0
    ? `Si el Cliente no entrega los insumos, contenidos, accesos o aprobaciones que le corresponden en las fechas acordadas, el calendario se recorre por el mismo número de días y, a partir del quinto día hábil de retraso, el Cliente pagará al Prestador ${mxn(q.terms.daily_penalty, q.currency)} por cada día hábil adicional de retraso.`
    : 'Si el Cliente no entrega los insumos, contenidos, accesos o aprobaciones que le corresponden en las fechas acordadas, el calendario de entrega se recorre por el mismo número de días de retraso.';
  const fechaTxt = fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Mexico_City' });

  return `
<h1>Contrato de prestación de servicios de desarrollo de software</h1>
<p class="document-number">Con base en la cotización ${esc(q.number)} · ${esc(fechaTxt)}</p>

<p>Contrato que celebran, por una parte, <strong>${esc(EMISOR.nombre)}</strong>, persona física con RFC ${esc(EMISOR.rfc)}, inscrita en el ${esc(EMISOR.regimen)}, con domicilio en ${esc(EMISOR.domicilio)}, ${esc(EMISOR.ciudad)}, quien opera bajo la marca ${esc(EMISOR.marca)}, en adelante <strong>el Prestador</strong>; y por la otra, <strong>${cliente}</strong>, en adelante <strong>el Cliente</strong>. Ambas partes se reconocen capacidad para obligarse y acuerdan las siguientes cláusulas.</p>

<h2>Primera. Objeto</h2>
<p>El Prestador desarrollará y entregará al Cliente el proyecto <strong>${esc(q.title)}</strong>, conforme a la cotización ${esc(q.number)} aceptada por el Cliente, que forma parte de este contrato y comprende${features.length > 0 ? ` las siguientes ${features.length} características` : ''}:</p>
<${listaAlcance}>${alcance}</${listaAlcance}>
${q.intro ? `<p>${esc(q.intro)}</p>` : ''}

<h2>Segunda. Precio y forma de pago</h2>
<p>El precio total es de <strong>${mxn(t.total, q.currency)}</strong> (${t.descuento > 0 ? `precio de lista de ${mxn(t.lista, q.currency)} menos un descuento de ${mxn(t.descuento, q.currency)} por concepto de "${esc(q.discount?.reason ?? '')}", es decir, ${mxn(t.subtotal, q.currency)}` : mxn(t.subtotal, q.currency)}${q.apply_iva ? ` más ${mxn(t.iva, q.currency)} de IVA` : ', sin IVA'}), pagadero así:</p>${t.descuento > 0 ? `
<p>El descuento aplica únicamente a este contrato y no constituye un precio de referencia para trabajos futuros.</p>` : ''}
<ul>${pagos}</ul>
${opcionElegida ? `<p>El Cliente eligió como forma de pago: <strong>${esc(opcionElegida)}</strong>. ${q.accepted_payment_option === 'transfer' ? 'El descuento por transferencia aplica mientras cada pago se cubra por ese medio en la fecha pactada; un pago con tarjeta se cobra sin el descuento.' : ''}${q.accepted_payment_option === 'installments_6' || q.accepted_payment_option === 'installments_12' ? 'Los meses sin intereses los otorga el banco emisor de la tarjeta; el total indicado incluye el costo del plazo y no cambia si el banco no ofrece ese plan, en cuyo caso el Cliente puede pagar en una sola exhibición al precio de lista.' : ''}</p>` : ''}
<p>Los pagos se realizan por transferencia bancaria o mediante enlace de pago con tarjeta${q.payment.card_installments ? ', incluidos meses sin intereses cuando el banco emisor lo permita' : ''}. El Prestador emite CFDI por cada pago recibido; los asuntos de facturación se atienden en ${esc(EMISOR.emailFacturacion)}. ${hayMensualidades ? 'Las mensualidades pactadas son un pago diferido sin intereses. Los entregables se ponen en producción al cubrirse la primera mensualidad del hito correspondiente; la propiedad se transfiere conforme a la cláusula Quinta, al quedar pagado el total. El atraso en cualquier mensualidad faculta al Prestador a suspender el servicio, los accesos y el soporte hasta que el pago se regularice, sin que ello modifique las fechas de las mensualidades restantes.' : 'Ningún entregable se pone en producción ni se transfiere hasta recibir el pago del hito correspondiente.'}</p>${plan && q.accepted_payment_option === 'plan' ? `
<p><strong>Plan de suscripción.</strong> El Cliente paga un anticipo de ${mxn(plan.anticipo, q.currency)} al aceptar este contrato y ${q.payment.plan!.months} mensualidades consecutivas de ${mxn(plan.mensualidad, q.currency)} (${mxn(plan.totalPlan, q.currency)} en total), la primera al ponerse el sistema en producción y las siguientes el mismo día de cada mes, mediante cargo automático a tarjeta o domiciliación. Durante el plan, el Prestador otorga al Cliente una licencia de uso del sistema, lo aloja en su propia infraestructura y le da hosting, soporte y mantenimiento correctivo sin costo adicional; el Cliente conserva en todo momento la propiedad de sus datos y puede exportarlos. El atraso de más de 10 días naturales en una mensualidad faculta al Prestador a suspender el acceso al sistema hasta que se regularice, y el de más de 60 días a dar por terminado el plan, en cuyo caso el Cliente recibe sus datos y el Prestador conserva el código. Al cubrirse la última mensualidad, el Prestador transfiere al Cliente el código fuente y la propiedad conforme a la cláusula Quinta y le ofrece continuar el hosting y soporte mediante una mensualidad reducida cotizada por separado. El Cliente puede liquidar anticipadamente el saldo restante en cualquier momento sin penalización. Este plan es un servicio de licencia, hosting y soporte, no un crédito ni un financiamiento.</p>` : ''}

<h2>Tercera. Plazo de entrega</h2>
<p>El Prestador entregará el proyecto a más tardar el <strong>${esc(fechaLarga(plazo.fechaLimite))}</strong>, es decir, en un plazo de ${plazo.semanas} ${plazo.semanas === 1 ? 'semana' : 'semanas'} contado desde la cotización, siempre que el Cliente entregue el anticipo y los insumos iniciales oportunamente. El plazo se ajustará de común acuerdo si el alcance cambia o si el Cliente retrasa la entrega de insumos, conforme a las cláusulas Sexta y Séptima.</p>

<h2>Cuarta. Entrega y aceptación</h2>
<p>Cada entrega se notificará al Cliente por escrito, con acceso al entregable en un ambiente de pruebas o en producción. El Cliente contará con ${DIAS_REVISION} días hábiles para revisarla y reportar por escrito los defectos respecto a lo contratado; el Prestador los corregirá y volverá a presentar la entrega. Si transcurre ese plazo sin observaciones, o si el Cliente usa el entregable para su operación, la entrega se tendrá por aceptada. Las observaciones que amplíen o cambien el alcance se tratan conforme a la cláusula Sexta y no suspenden la aceptación.</p>

<h2>Quinta. Propiedad de los entregables</h2>
<p>${esc(q.terms.ownership)} El Prestador conserva el derecho de mencionar el proyecto en su portafolio, salvo que el Cliente indique lo contrario por escrito. Las herramientas, librerías y componentes de terceros conservan sus propias licencias. El Prestador conserva la propiedad de sus herramientas, componentes y conocimientos genéricos desarrollados antes o fuera de este contrato, y otorga al Cliente licencia para usarlos como parte del proyecto.</p>

<h2>Sexta. Cambios de alcance</h2>
<p>${esc(q.terms.scope_changes)}</p>

<h2>Séptima. Obligaciones del Cliente</h2>
<p>El Cliente entregará oportunamente la información, contenidos, accesos, materiales y aprobaciones necesarios para el desarrollo, y revisará los avances en un plazo razonable. ${esc(penal)} El Cliente garantiza que cuenta con los derechos y autorizaciones sobre los contenidos, datos, marcas y materiales que entregue, y responderá frente a terceros por cualquier reclamación derivada de ellos.</p>

<h2>Octava. Garantía y soporte</h2>
<p>El Prestador corregirá sin costo, durante ${q.terms.warranty_days} días naturales después de la entrega, cualquier defecto de funcionamiento respecto a lo contratado. La garantía no cubre cambios de alcance, fallas causadas por terceros, ni modificaciones realizadas por personas ajenas al Prestador. ${esc(q.terms.support)} Las solicitudes de garantía y soporte se envían a ${esc(EMISOR.emailSoporte)}. Fuera de la garantía, el mantenimiento, las mejoras y el soporte se cotizan por separado.</p>

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
<p>Para la interpretación y cumplimiento de este contrato, las partes se someten a las leyes y a los tribunales competentes de ${esc(EMISOR.ciudad)}, renunciando a cualquier otro fuero que pudiera corresponderles.</p>

<p>Leído que fue por ambas partes y enteradas de su contenido y alcance, lo aceptan en ${esc(EMISOR.ciudad)}, el ${esc(fechaTxt)}.</p>
`.trim();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
