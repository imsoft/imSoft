/**
 * Logica pura de cotizaciones y contratos: totales, folios, vigencia, hitos y la
 * plantilla del contrato. Sin E/S; las paginas y rutas del panel la usan.
 */
import { IVA } from './simulador-cobros';
import { msiEtiqueta, MSI_MINIMO_MXN } from './msi';
import { EMISOR } from '@/config/emisor';

export interface QuoteItem {
  concepto: string;
  descripcion?: string;
  cantidad: number;
  precio: number;
}
export interface Hito {
  label: string;
  pct: number;
}
export interface QuotePayment {
  hitos: Hito[];
  msi: boolean;
}
export interface QuoteTerms {
  garantia_dias: number;
  soporte: string;
  propiedad: string;
  cambios_alcance: string;
  /** MXN por dia habil de retraso del cliente en entregar insumos. 0 = sin penalizacion. */
  penalizacion_dia: number;
  /** Fecha limite del proyecto (ISO). El plazo en semanas se calcula desde la cotizacion. */
  fecha_limite?: string | null;
  /** Solo de respaldo para cotizaciones viejas sin fecha_limite. */
  entrega_semanas: number;
}
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

export interface QuoteLike {
  folio: string;
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
  payment: QuotePayment;
  terms: QuoteTerms;
  notes?: string | null;
  valid_until: string;
  accepted_at?: string | null;
  accepted_name?: string | null;
}

/** El precio del proyecto sin IVA (la unica linea de `items`). */
export function precioProyecto(q: Pick<QuoteLike, 'items'>): number {
  return subtotal(q.items);
}

/** Como se guarda un precio unico en `items`, para que totales() siga funcionando. */
export function itemsDesdePrecio(titulo: string, precio: number): QuoteItem[] {
  return [{ concepto: titulo, cantidad: 1, precio: Number(precio) || 0 }];
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
  let fechaLimite = q.terms.fecha_limite?.slice(0, 10) || null;
  if (!fechaLimite) {
    const d = new Date(`${desde}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + (q.terms.entrega_semanas || 0) * 7);
    fechaLimite = d.toISOString().slice(0, 10);
  }
  const dias = Math.max(0, Math.round((Date.parse(`${fechaLimite}T00:00:00Z`) - Date.parse(`${desde}T00:00:00Z`)) / 86400000));
  const semanas = Math.max(1, Math.ceil(dias / 7));
  const texto = `${fechaLarga(fechaLimite)} (${semanas} ${semanas === 1 ? 'semana' : 'semanas'} a partir de la cotización)`;
  return { fechaLimite, dias, semanas, texto };
}

export function subtotal(items: QuoteItem[]): number {
  return round2(items.reduce((s, i) => s + (Number(i.cantidad) || 0) * (Number(i.precio) || 0), 0));
}

export function totales(q: Pick<QuoteLike, 'items' | 'apply_iva'>) {
  const sub = subtotal(q.items);
  const iva = q.apply_iva ? round2(sub * IVA) : 0;
  return { subtotal: sub, iva, total: round2(sub + iva) };
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
  return null;
}

export function itemsValidos(items: QuoteItem[]): string | null {
  if (items.length === 0) return 'Agrega al menos un concepto.';
  if (items.some((i) => !i.concepto.trim())) return 'Cada concepto necesita nombre.';
  if (items.some((i) => !(Number(i.cantidad) > 0) || !(Number(i.precio) >= 0))) return 'Cantidad y precio deben ser válidos.';
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
export function textoFormaDePago(q: Pick<QuoteLike, 'items' | 'apply_iva' | 'payment' | 'currency'>): string[] {
  const { total } = totales(q);
  const lineas = importesHitos(total, q.payment.hitos).map((h) => `${h.label}: ${h.pct}% (${mxn(h.importe, q.currency)})`);
  if (q.payment.msi && q.currency === 'MXN' && total >= MSI_MINIMO_MXN) {
    const seis = msiEtiqueta(total, 6);
    lineas.push(`Cada hito puede pagarse con tarjeta de crédito a 3, 6 o 12 meses sin intereses con bancos participantes${seis ? `; a 6 meses, el total equivale a ${seis.replace(/^o /, '')}` : ''}.`);
  }
  lineas.push(`Por transferencia bancaria o con tarjeta mediante enlace de pago seguro (Stripe). Se emite CFDI por cada pago; dudas de facturación a ${EMISOR.emailFacturacion}.`);
  return lineas;
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
export function renderContrato(q: QuoteLike & { created_at?: string | null }, folioContrato: string, fecha = new Date()): string {
  const t = totales(q);
  const plazo = plazoEntrega(q, fecha);
  const hitos = importesHitos(t.total, q.payment.hitos);
  const cliente = [q.client_name, q.client_company ? `en representación de ${q.client_company}` : '', q.client_rfc ? `RFC ${q.client_rfc}` : '', q.client_address].filter(Boolean).map(esc).join(', ');
  const features = (q.features ?? []).map((f) => f.trim()).filter(Boolean);
  const alcance = features.length > 0
    ? features.map((f) => `<li>${esc(f)}</li>`).join('')
    : q.items.map((i) => `<li><strong>${esc(i.concepto)}</strong>${i.descripcion ? `: ${esc(i.descripcion)}` : ''}${i.cantidad !== 1 ? ` (${i.cantidad})` : ''}</li>`).join('');
  const listaAlcance = features.length > 0 ? 'ol' : 'ul';
  const pagos = hitos.map((h) => `<li>${esc(h.label)}: ${h.pct}% del total, ${mxn(h.importe, q.currency)}.</li>`).join('');
  const penal = q.terms.penalizacion_dia > 0
    ? `Si el Cliente no entrega los insumos, contenidos, accesos o aprobaciones que le corresponden en las fechas acordadas, el calendario se recorre por el mismo número de días y, a partir del quinto día hábil de retraso, el Cliente pagará al Prestador ${mxn(q.terms.penalizacion_dia, q.currency)} por cada día hábil adicional de retraso.`
    : 'Si el Cliente no entrega los insumos, contenidos, accesos o aprobaciones que le corresponden en las fechas acordadas, el calendario de entrega se recorre por el mismo número de días de retraso.';
  const fechaTxt = fecha.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Mexico_City' });

  return `
<h1>Contrato de prestación de servicios de desarrollo de software</h1>
<p class="folio">Con base en la cotización ${esc(q.folio)} · ${esc(fechaTxt)}</p>

<p>Contrato que celebran, por una parte, <strong>${esc(EMISOR.nombre)}</strong>, persona física con RFC ${esc(EMISOR.rfc)}, inscrita en el ${esc(EMISOR.regimen)}, con domicilio en ${esc(EMISOR.domicilio)}, ${esc(EMISOR.ciudad)}, quien opera bajo la marca ${esc(EMISOR.marca)}, en adelante <strong>el Prestador</strong>; y por la otra, <strong>${cliente}</strong>, en adelante <strong>el Cliente</strong>. Ambas partes se reconocen capacidad para obligarse y acuerdan las siguientes cláusulas.</p>

<h2>Primera. Objeto</h2>
<p>El Prestador desarrollará y entregará al Cliente el proyecto <strong>${esc(q.title)}</strong>, conforme a la cotización ${esc(q.folio)} aceptada por el Cliente, que forma parte de este contrato y comprende${features.length > 0 ? ` las siguientes ${features.length} características` : ''}:</p>
<${listaAlcance}>${alcance}</${listaAlcance}>
${q.intro ? `<p>${esc(q.intro)}</p>` : ''}

<h2>Segunda. Precio y forma de pago</h2>
<p>El precio total es de <strong>${mxn(t.total, q.currency)}</strong> (${mxn(t.subtotal, q.currency)}${q.apply_iva ? ` más ${mxn(t.iva, q.currency)} de IVA` : ', sin IVA'}), pagadero así:</p>
<ul>${pagos}</ul>
<p>Los pagos se realizan por transferencia bancaria o mediante enlace de pago con tarjeta${q.payment.msi ? ', incluidos meses sin intereses cuando el banco emisor lo permita' : ''}. El Prestador emite CFDI por cada pago recibido; los asuntos de facturación se atienden en ${esc(EMISOR.emailFacturacion)}. Ningún entregable se pone en producción ni se transfiere hasta recibir el pago del hito correspondiente.</p>

<h2>Tercera. Plazo de entrega</h2>
<p>El Prestador entregará el proyecto a más tardar el <strong>${esc(fechaLarga(plazo.fechaLimite))}</strong>, es decir, en un plazo de ${plazo.semanas} ${plazo.semanas === 1 ? 'semana' : 'semanas'} contado desde la cotización, siempre que el Cliente entregue el anticipo y los insumos iniciales oportunamente. El plazo se ajustará de común acuerdo si el alcance cambia o si el Cliente retrasa la entrega de insumos, conforme a las cláusulas Quinta y Sexta.</p>

<h2>Cuarta. Propiedad de los entregables</h2>
<p>${esc(q.terms.propiedad)} El Prestador conserva el derecho de mencionar el proyecto en su portafolio, salvo que el Cliente indique lo contrario por escrito. Las herramientas, librerías y componentes de terceros conservan sus propias licencias.</p>

<h2>Quinta. Cambios de alcance</h2>
<p>${esc(q.terms.cambios_alcance)}</p>

<h2>Sexta. Obligaciones del Cliente</h2>
<p>El Cliente entregará oportunamente la información, contenidos, accesos, materiales y aprobaciones necesarios para el desarrollo, y revisará los avances en un plazo razonable. ${esc(penal)}</p>

<h2>Séptima. Garantía y soporte</h2>
<p>El Prestador corregirá sin costo, durante ${q.terms.garantia_dias} días naturales después de la entrega, cualquier defecto de funcionamiento respecto a lo contratado. La garantía no cubre cambios de alcance, fallas causadas por terceros, ni modificaciones realizadas por personas ajenas al Prestador. ${esc(q.terms.soporte)} Las solicitudes de garantía y soporte se envían a ${esc(EMISOR.emailSoporte)}.</p>

<h2>Octava. Confidencialidad</h2>
<p>Ambas partes tratarán como confidencial la información técnica, comercial y de negocio que conozcan con motivo de este contrato, y no la divulgarán a terceros sin autorización escrita, durante la vigencia del contrato y dos años después.</p>

<h2>Novena. Terminación</h2>
<p>Cualquiera de las partes puede dar por terminado el contrato mediante aviso escrito. En ese caso, el Cliente pagará el trabajo realizado hasta la fecha, y el Prestador entregará los avances correspondientes a lo pagado. Los anticipos no son reembolsables una vez iniciado el trabajo.</p>

<h2>Décima. Jurisdicción</h2>
<p>Para la interpretación y cumplimiento de este contrato, las partes se someten a las leyes y a los tribunales competentes de ${esc(EMISOR.ciudad)}, renunciando a cualquier otro fuero que pudiera corresponderles.</p>

<p>Leído que fue por ambas partes y enteradas de su contenido y alcance, lo aceptan en ${esc(EMISOR.ciudad)}, el ${esc(fechaTxt)}.</p>
`.trim();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
