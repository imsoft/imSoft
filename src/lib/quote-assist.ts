import type Anthropic from '@anthropic-ai/sdk';
import { totales, type QuoteDiscount, type QuoteItem } from '@/lib/cotizaciones';

/**
 * Asistente de cotizacion: a partir del proyecto (titulo, resumen, caracteristicas,
 * precio tentativo) y de las cotizaciones anteriores de imSoft pide a Claude un rango
 * de precio, caracteristicas que suelen faltar (con su costo), una iguala mensual de
 * mantenimiento, preguntas para el cliente y riesgos. Logica pura aqui; la llamada a la API
 * vive en src/app/api/quotes/assist/route.ts.
 */

export interface AssistInput {
  title: string;
  intro?: string | null;
  features: string[];
  precio: number;
  clientCompany?: string | null;
  servicio?: string | null;
  /** Ya existe como contacto en el CRM (cliente o prospecto trabajado). */
  clienteRecurrente?: boolean;
  descuentoActual?: QuoteDiscount | null;
  /** Id de la cotizacion que se edita, para no usarla como comparable de si misma. */
  quoteId?: string | null;
  /** Cotizaciones anteriores de imSoft; las llena el servidor, no el navegador. */
  comparables?: Comparable[];
}

export type Prioridad = 'esencial' | 'recomendada' | 'opcional';

/** Una cotizacion ya enviada, resumida para usarla como referencia de precio. */
export interface Comparable {
  folio: string;
  title: string;
  status: 'sent' | 'accepted' | 'rejected' | 'expired';
  /** Precio final sin IVA (ya con descuento). */
  precio: number;
  features: string[];
  fecha: string;
}

export interface AssistOutput {
  resumen: string;
  precio: { min: number; max: number; comentario: string };
  descuento: { conviene: boolean; pct: number; motivo: string; comentario: string } | null;
  caracteristicas: Array<{ texto: string; motivo: string; precio_extra: number; prioridad: Prioridad }>;
  iguala: { mensual: number; incluye: string[]; comentario: string } | null;
  /** Folios de las cotizaciones anteriores en las que se apoyo el rango. */
  comparables_usados: string[];
  preguntas: string[];
  riesgos: string[];
}

const PRIORIDADES: Prioridad[] = ['esencial', 'recomendada', 'opcional'];
const STATUS_COMPARABLE = ['accepted', 'rejected', 'sent', 'expired'] as const;
const ETIQUETA_STATUS: Record<Comparable['status'], string> = { accepted: 'ACEPTADA', rejected: 'RECHAZADA', sent: 'enviada, sin respuesta', expired: 'vencida' };
export const MAX_COMPARABLES = 15;

interface QuoteRow {
  id: string;
  number: string;
  status: string;
  title: string;
  items: QuoteItem[] | null;
  features?: string[] | null;
  discount?: QuoteDiscount | null;
  created_at: string;
}

/**
 * Convierte filas de `quotes` en comparables: sin borradores, sin la cotizacion que se
 * edita y sin precio cero. Las aceptadas y rechazadas van primero (son las que dicen
 * algo del precio); dentro de cada grupo, las mas recientes.
 */
export function comparablesDesdeQuotes(rows: QuoteRow[], excluirId?: string | null, max = MAX_COMPARABLES): Comparable[] {
  const peso = (st: string) => (st === 'accepted' || st === 'rejected' ? 0 : 1);
  return rows
    .filter((q) => (STATUS_COMPARABLE as readonly string[]).includes(q.status) && q.id !== excluirId)
    .map((q) => ({
      folio: q.number,
      title: q.title,
      status: q.status as Comparable['status'],
      precio: totales({ items: q.items ?? [], apply_iva: false, discount: q.discount ?? null }).subtotal,
      features: (q.features ?? []).filter((f) => typeof f === 'string' && f.trim()).map((f) => f.trim()),
      fecha: q.created_at.slice(0, 10),
    }))
    .filter((c) => c.precio > 0)
    .sort((a, b) => peso(a.status) - peso(b.status) || b.fecha.localeCompare(a.fecha))
    .slice(0, max);
}

function textoComparables(cs: Comparable[]): string {
  if (!cs.length) return '(todavía no hay cotizaciones enviadas; usa solo la referencia publicada)';
  return cs.map((c) => {
    const f = c.features.length ? `; incluye: ${c.features.slice(0, 12).join(', ')}${c.features.length > 12 ? ` y ${c.features.length - 12} más` : ''}` : '';
    return `- ${c.folio} (${c.fecha}, ${ETIQUETA_STATUS[c.status]}): "${c.title}", $${c.precio.toLocaleString('es-MX')} MXN sin IVA${f}`;
  }).join('\n');
}

/** Referencia de precios que publica el sitio (seccion "Referencia de precios"). */
export const REFERENCIA_PRECIOS_MXN = [
  { nivel: 'Emprendedor (landing de una página, plantilla)', desde: 5000 },
  { nivel: 'Páginas web (sitio corporativo, SEO técnico, hosting)', desde: 15000 },
  { nivel: 'MVP / proyecto (producto funcional, auth, pagos, admin)', desde: 60000 },
  { nivel: 'Software a medida (plataformas, SaaS, sistemas empresariales)', desde: 150000 },
] as const;

export function validarInput(body: unknown): { ok: true; input: AssistInput } | { ok: false; error: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (!title) return { ok: false, error: 'Pon primero el nombre del proyecto.' };
  const features = Array.isArray(b.features) ? b.features.filter((f): f is string => typeof f === 'string').map((f) => f.trim()).filter(Boolean) : [];
  return {
    ok: true,
    input: {
      title,
      intro: typeof b.intro === 'string' ? b.intro.trim() || null : null,
      features: features.slice(0, 60),
      precio: Number(b.precio) || 0,
      clientCompany: typeof b.clientCompany === 'string' ? b.clientCompany.trim() || null : null,
      servicio: typeof b.servicio === 'string' ? b.servicio.trim() || null : null,
      clienteRecurrente: Boolean(b.clienteRecurrente),
      descuentoActual: b.descuentoActual && typeof b.descuentoActual === 'object' ? (b.descuentoActual as AssistInput['descuentoActual']) : null,
      quoteId: typeof b.quoteId === 'string' && b.quoteId.trim() ? b.quoteId.trim() : null,
    },
  };
}

export function buildPrompt(i: AssistInput): string {
  const ref = REFERENCIA_PRECIOS_MXN.map((r) => `- ${r.nivel}: desde $${r.desde.toLocaleString('es-MX')} MXN`).join('\n');
  return `Eres el socio senior de imSoft, una agencia de software de una persona en Guadalajara, México, que cotiza proyectos a precio fijo para PyMEs. Revisa esta cotización antes de que salga al cliente.

## Proyecto
Título: ${i.title}
${i.clientCompany ? `Cliente: ${i.clientCompany}\n` : ''}${i.servicio ? `Servicio base: ${i.servicio}\n` : ''}${i.intro ? `Resumen: ${i.intro}\n` : ''}Precio tentativo (sin IVA): ${i.precio > 0 ? `$${i.precio.toLocaleString('es-MX')} MXN` : 'sin definir'}
Cliente recurrente o ya en el CRM: ${i.clienteRecurrente ? 'sí' : 'no'}
Descuento ya capturado: ${i.descuentoActual ? `${i.descuentoActual.type === 'pct' ? `${i.descuentoActual.value} %` : `$${i.descuentoActual.value}`} por "${i.descuentoActual.reason}"` : 'ninguno'}

## Características ya incluidas (${i.features.length})
${i.features.length ? i.features.map((f, n) => `${n + 1}. ${f}`).join('\n') : '(ninguna todavía)'}

## Referencia de precios que imSoft publica (sin IVA, "desde")
${ref}

## Cotizaciones anteriores de imSoft (lo que de verdad se ha cobrado)
${textoComparables(i.comparables ?? [])}

## Lo que necesito
1. Un rango de precio razonable en MXN sin IVA para este alcance en el mercado de Guadalajara, coherente con la referencia de arriba y con el esfuerzo real que implican las características. Ánclalo primero en las cotizaciones anteriores parecidas: las aceptadas dicen qué precio sí se cierra y las rechazadas, dónde se pasó. Explica en dos frases qué lo justifica y si el precio tentativo va bajo, bien o alto, y devuelve los folios de las cotizaciones anteriores en las que te apoyaste (vacío si ninguna se parece).
2. Características que suelen faltar en un proyecto así y que el cliente va a dar por hechas (por ejemplo: SEO técnico, formulario con notificaciones, panel de administración, respaldos, capacitación, analítica). Solo las que apliquen; máximo 8; sin repetir las ya incluidas. Para cada una, cuánto sumaría al precio en MXN sin IVA si se agrega (0 si es trivial) y su prioridad: "esencial" (el cliente la da por hecha), "recomendada" (sube el valor del proyecto) u "opcional" (extra para vender después).
3. Preguntas concretas que conviene hacerle al cliente antes de cerrar el precio (máximo 6).
4. Riesgos o supuestos que conviene dejar por escrito en la cotización (máximo 5).
5. Si conviene ofrecer un descuento y de cuánto (porcentaje entero, máximo 20 %), con un motivo corto que el cliente pueda leer ("Cliente recurrente", "Promoción de lanzamiento", "Referido"). Regla: el descuento solo tiene sentido si ayuda a cerrar (cliente recurrente, referido, temporada, proyecto que abre un nicho); si el precio ya va bajo o el cliente es nuevo sin razón especial, di que no conviene. Recuerda que imSoft paga 3.6 % + $3 por cobro con tarjeta y ISR de RESICO.
6. Una iguala mensual de mantenimiento para ofrecer después de la entrega (el primer mes de soporte ya va incluido): monto en MXN sin IVA por mes, proporcional al tamaño y a lo que se mantiene (hosting, actualizaciones, respaldos, horas de cambios), qué incluye (máximo 5 puntos) y una frase de por qué ese monto. Si el proyecto no necesita mantenimiento, monto 0.

Sé concreto y breve. No inventes datos del cliente. Todo en español de México.`;
}

/** Herramienta con esquema estricto: la respuesta llega ya estructurada. */
export const ASSIST_TOOL: Anthropic.Tool = {
  name: 'recomendaciones_cotizacion',
  description: 'Entrega las recomendaciones de la cotización.',
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      resumen: { type: 'string', description: 'Dos o tres frases con el diagnóstico general' },
      precio: {
        type: 'object',
        additionalProperties: false,
        properties: {
          min: { type: 'number' },
          max: { type: 'number' },
          comentario: { type: 'string' },
        },
        required: ['min', 'max', 'comentario'],
      },
      descuento: {
        type: 'object',
        additionalProperties: false,
        properties: {
          conviene: { type: 'boolean' },
          pct: { type: 'number', description: 'Porcentaje entero 0-20; 0 si no conviene' },
          motivo: { type: 'string', description: 'Motivo corto visible para el cliente; vacío si no conviene' },
          comentario: { type: 'string', description: 'Una o dos frases de por qué' },
        },
        required: ['conviene', 'pct', 'motivo', 'comentario'],
      },
      caracteristicas: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            texto: { type: 'string' },
            motivo: { type: 'string' },
            precio_extra: { type: 'number', description: 'MXN sin IVA que suma al precio; 0 si es trivial' },
            prioridad: { type: 'string', enum: PRIORIDADES },
          },
          required: ['texto', 'motivo', 'precio_extra', 'prioridad'],
        },
      },
      iguala: {
        type: 'object',
        additionalProperties: false,
        properties: {
          mensual: { type: 'number', description: 'MXN sin IVA por mes; 0 si no aplica' },
          incluye: { type: 'array', items: { type: 'string' } },
          comentario: { type: 'string' },
        },
        required: ['mensual', 'incluye', 'comentario'],
      },
      comparables_usados: { type: 'array', items: { type: 'string' }, description: 'Folios de cotizaciones anteriores en las que se apoya el rango' },
      preguntas: { type: 'array', items: { type: 'string' } },
      riesgos: { type: 'array', items: { type: 'string' } },
    },
    required: ['resumen', 'precio', 'descuento', 'caracteristicas', 'iguala', 'comparables_usados', 'preguntas', 'riesgos'],
  },
};

const centenas = (v: unknown) => Math.max(0, Math.round((Number(v) || 0) / 100) * 100);

/**
 * Normaliza lo que devuelve el modelo: redondea a centenas, recorta listas, quita vacios
 * y descarta folios que no estaban entre los comparables enviados.
 */
export function normalizarOutput(raw: unknown, yaIncluidas: string[] = [], foliosValidos: string[] = []): AssistOutput {
  const r = (raw ?? {}) as Record<string, unknown>;
  const p = (r.precio ?? {}) as Record<string, unknown>;
  const min = centenas(p.min);
  const max = Math.max(min, centenas(p.max));
  const incluidas = new Set(yaIncluidas.map((f) => f.trim().toLowerCase()));
  const lista = (v: unknown, n: number) => (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.trim()).slice(0, n);
  const caracteristicas = (Array.isArray(r.caracteristicas) ? r.caracteristicas : [])
    .map((c) => {
      const o = (c ?? {}) as Record<string, unknown>;
      const prioridad = PRIORIDADES.includes(o.prioridad as Prioridad) ? (o.prioridad as Prioridad) : 'recomendada';
      return { texto: String(o.texto ?? '').trim(), motivo: String(o.motivo ?? '').trim(), precio_extra: centenas(o.precio_extra), prioridad };
    })
    .filter((c) => c.texto && !incluidas.has(c.texto.toLowerCase()))
    .sort((a, b) => PRIORIDADES.indexOf(a.prioridad) - PRIORIDADES.indexOf(b.prioridad))
    .slice(0, 8);
  const ig = r.iguala && typeof r.iguala === 'object' ? (r.iguala as Record<string, unknown>) : null;
  const iguala = ig && centenas(ig.mensual) > 0 ? { mensual: centenas(ig.mensual), incluye: lista(ig.incluye, 5), comentario: String(ig.comentario ?? '').trim() } : null;
  const validos = new Set(foliosValidos);
  const comparables_usados = [...new Set(lista(r.comparables_usados, 50))].filter((f) => validos.has(f)).slice(0, 8);
  const d = r.descuento && typeof r.descuento === 'object' ? (r.descuento as Record<string, unknown>) : null;
  const pct = Math.min(20, Math.max(0, Math.round(Number(d?.pct) || 0)));
  const descuento = d ? { conviene: Boolean(d.conviene) && pct > 0, pct: Boolean(d.conviene) ? pct : 0, motivo: String(d.motivo ?? '').trim(), comentario: String(d.comentario ?? '').trim() } : null;
  return {
    resumen: String(r.resumen ?? '').trim(),
    precio: { min, max, comentario: String(p.comentario ?? '').trim() },
    descuento,
    caracteristicas,
    iguala,
    comparables_usados,
    preguntas: lista(r.preguntas, 6),
    riesgos: lista(r.riesgos, 5),
  };
}

/** Parrafo para las notas de la cotizacion con la iguala sugerida. */
export function textoIguala(ig: NonNullable<AssistOutput['iguala']>): string {
  const incluye = ig.incluye.length ? ` Incluye: ${ig.incluye.join('; ')}.` : '';
  return `Mantenimiento opcional después del primer mes: iguala de $${ig.mensual.toLocaleString('es-MX')} MXN + IVA al mes.${incluye}`;
}
