import type Anthropic from '@anthropic-ai/sdk';
import { quoteTotals, type QuoteDiscount, type QuoteItem } from '@/lib/quotes';

/**
 * Quote assistant: from the project (title, summary, features, tentative price) and
 * imSoft's previous quotes, it asks Claude for a price range, commonly missing features
 * (with their cost), a monthly maintenance retainer, questions for the client and risks.
 * Pure logic here; the API call lives in src/app/api/quotes/assist/route.ts.
 */

export interface AssistInput {
  title: string;
  intro?: string | null;
  features: string[];
  price: number;
  clientCompany?: string | null;
  service?: string | null;
  /** Already exists as a CRM contact (client or worked prospect). */
  returningClient?: boolean;
  currentDiscount?: QuoteDiscount | null;
  /** Id of the quote being edited, so it is not used as its own comparable. */
  quoteId?: string | null;
  /** imSoft's previous quotes; filled in by the server, not the browser. */
  comparables?: Comparable[];
}

export type Priority = 'essential' | 'recommended' | 'optional';

/** A quote already sent, summarized to use as a price reference. */
export interface Comparable {
  number: string;
  title: string;
  status: 'sent' | 'accepted' | 'rejected' | 'expired';
  /** Final price before VAT (discount already applied). */
  price: number;
  features: string[];
  date: string;
}

export interface AssistOutput {
  summary: string;
  price: { min: number; max: number; comment: string };
  discount: { advisable: boolean; pct: number; reason: string; comment: string } | null;
  features: Array<{ text: string; reason: string; extra_price: number; priority: Priority }>;
  retainer: { monthly: number; includes: string[]; comment: string } | null;
  /** Numbers of the previous quotes the range relied on. */
  comparables_used: string[];
  questions: string[];
  risks: string[];
}

const PRIORITIES: Priority[] = ['essential', 'recommended', 'optional'];
const COMPARABLE_STATUSES = ['accepted', 'rejected', 'sent', 'expired'] as const;
const STATUS_LABEL: Record<Comparable['status'], string> = { accepted: 'ACEPTADA', rejected: 'RECHAZADA', sent: 'enviada, sin respuesta', expired: 'vencida' };
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
 * Turns `quotes` rows into comparables: no drafts, not the quote being edited and no
 * zero prices. Accepted and rejected ones go first (they are the ones that say something
 * about price); within each group, the most recent first.
 */
export function comparablesFromQuotes(rows: QuoteRow[], excludeId?: string | null, max = MAX_COMPARABLES): Comparable[] {
  const weight = (st: string) => (st === 'accepted' || st === 'rejected' ? 0 : 1);
  return rows
    .filter((q) => (COMPARABLE_STATUSES as readonly string[]).includes(q.status) && q.id !== excludeId)
    .map((q) => ({
      number: q.number,
      title: q.title,
      status: q.status as Comparable['status'],
      price: quoteTotals({ items: q.items ?? [], apply_iva: false, discount: q.discount ?? null }).subtotal,
      features: (q.features ?? []).filter((f) => typeof f === 'string' && f.trim()).map((f) => f.trim()),
      date: q.created_at.slice(0, 10),
    }))
    .filter((c) => c.price > 0)
    .sort((a, b) => weight(a.status) - weight(b.status) || b.date.localeCompare(a.date))
    .slice(0, max);
}

function comparablesText(cs: Comparable[]): string {
  if (!cs.length) return '(todavía no hay cotizaciones enviadas; usa solo la referencia publicada)';
  return cs.map((c) => {
    const f = c.features.length ? `; incluye: ${c.features.slice(0, 12).join(', ')}${c.features.length > 12 ? ` y ${c.features.length - 12} más` : ''}` : '';
    return `- ${c.number} (${c.date}, ${STATUS_LABEL[c.status]}): "${c.title}", $${c.price.toLocaleString('es-MX')} MXN sin IVA${f}`;
  }).join('\n');
}

/** Price reference the site publishes ("Referencia de precios" section). */
export const PRICE_REFERENCE_MXN = [
  { tier: 'Emprendedor (landing de una página, plantilla)', from: 5000 },
  { tier: 'Páginas web (sitio corporativo, SEO técnico, hosting)', from: 15000 },
  { tier: 'MVP / proyecto (producto funcional, auth, pagos, admin)', from: 60000 },
  { tier: 'Software a medida (plataformas, SaaS, sistemas empresariales)', from: 150000 },
] as const;

export function validateInput(body: unknown): { ok: true; input: AssistInput } | { ok: false; error: string } {
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
      price: Number(b.price) || 0,
      clientCompany: typeof b.clientCompany === 'string' ? b.clientCompany.trim() || null : null,
      service: typeof b.service === 'string' ? b.service.trim() || null : null,
      returningClient: Boolean(b.returningClient),
      currentDiscount: b.currentDiscount && typeof b.currentDiscount === 'object' ? (b.currentDiscount as AssistInput['currentDiscount']) : null,
      quoteId: typeof b.quoteId === 'string' && b.quoteId.trim() ? b.quoteId.trim() : null,
    },
  };
}

export function buildPrompt(i: AssistInput): string {
  const reference = PRICE_REFERENCE_MXN.map((r) => `- ${r.tier}: desde $${r.from.toLocaleString('es-MX')} MXN`).join('\n');
  return `Eres el socio senior de imSoft, una agencia de software de una persona en Guadalajara, México, que cotiza proyectos a precio fijo para PyMEs. Revisa esta cotización antes de que salga al cliente.

## Proyecto
Título: ${i.title}
${i.clientCompany ? `Cliente: ${i.clientCompany}\n` : ''}${i.service ? `Servicio base: ${i.service}\n` : ''}${i.intro ? `Resumen: ${i.intro}\n` : ''}Precio tentativo (sin IVA): ${i.price > 0 ? `$${i.price.toLocaleString('es-MX')} MXN` : 'sin definir'}
Cliente recurrente o ya en el CRM: ${i.returningClient ? 'sí' : 'no'}
Descuento ya capturado: ${i.currentDiscount ? `${i.currentDiscount.type === 'pct' ? `${i.currentDiscount.value} %` : `$${i.currentDiscount.value}`} por "${i.currentDiscount.reason}"` : 'ninguno'}

## Características ya incluidas (${i.features.length})
${i.features.length ? i.features.map((f, n) => `${n + 1}. ${f}`).join('\n') : '(ninguna todavía)'}

## Referencia de precios que imSoft publica (sin IVA, "desde")
${reference}

## Cotizaciones anteriores de imSoft (lo que de verdad se ha cobrado)
${comparablesText(i.comparables ?? [])}

## Lo que necesito
1. Un rango de precio razonable en MXN sin IVA para este alcance en el mercado de Guadalajara, coherente con la referencia de arriba y con el esfuerzo real que implican las características. Ánclalo primero en las cotizaciones anteriores parecidas: las aceptadas dicen qué precio sí se cierra y las rechazadas, dónde se pasó. Explica en dos frases qué lo justifica y si el precio tentativo va bajo, bien o alto, y devuelve los folios de las cotizaciones anteriores en las que te apoyaste (vacío si ninguna se parece).
2. Características que suelen faltar en un proyecto así y que el cliente va a dar por hechas (por ejemplo: SEO técnico, formulario con notificaciones, panel de administración, respaldos, capacitación, analítica). Solo las que apliquen; máximo 8; sin repetir las ya incluidas. Para cada una, cuánto sumaría al precio en MXN sin IVA si se agrega (0 si es trivial) y su prioridad: "essential" (el cliente la da por hecha), "recommended" (sube el valor del proyecto) u "optional" (extra para vender después).
3. Preguntas concretas que conviene hacerle al cliente antes de cerrar el precio (máximo 6).
4. Riesgos o supuestos que conviene dejar por escrito en la cotización (máximo 5).
5. Si conviene ofrecer un descuento y de cuánto (porcentaje entero, máximo 20 %), con un motivo corto que el cliente pueda leer ("Cliente recurrente", "Promoción de lanzamiento", "Referido"). Regla: el descuento solo tiene sentido si ayuda a cerrar (cliente recurrente, referido, temporada, proyecto que abre un nicho); si el precio ya va bajo o el cliente es nuevo sin razón especial, di que no conviene. Recuerda que imSoft paga 3.6 % + $3 por cobro con tarjeta y ISR de RESICO.
6. Una iguala mensual de mantenimiento para ofrecer después de la entrega (el primer mes de soporte ya va incluido): monto en MXN sin IVA por mes, proporcional al tamaño y a lo que se mantiene (hosting, actualizaciones, respaldos, horas de cambios), qué incluye (máximo 5 puntos) y una frase de por qué ese monto. Si el proyecto no necesita mantenimiento, monto 0.

Sé concreto y breve. No inventes datos del cliente. Todo en español de México.`;
}

/** Tool with a strict schema: the answer arrives already structured. */
export const ASSIST_TOOL: Anthropic.Tool = {
  name: 'quote_recommendations',
  description: 'Entrega las recomendaciones de la cotización.',
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      summary: { type: 'string', description: 'Dos o tres frases con el diagnóstico general' },
      price: {
        type: 'object',
        additionalProperties: false,
        properties: {
          min: { type: 'number' },
          max: { type: 'number' },
          comment: { type: 'string' },
        },
        required: ['min', 'max', 'comment'],
      },
      discount: {
        type: 'object',
        additionalProperties: false,
        properties: {
          advisable: { type: 'boolean', description: 'Si conviene ofrecer el descuento' },
          pct: { type: 'number', description: 'Porcentaje entero 0-20; 0 si no conviene' },
          reason: { type: 'string', description: 'Motivo corto visible para el cliente; vacío si no conviene' },
          comment: { type: 'string', description: 'Una o dos frases de por qué' },
        },
        required: ['advisable', 'pct', 'reason', 'comment'],
      },
      features: {
        type: 'array',
        description: 'Características que suelen faltar',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            text: { type: 'string' },
            reason: { type: 'string' },
            extra_price: { type: 'number', description: 'MXN sin IVA que suma al precio; 0 si es trivial' },
            priority: { type: 'string', enum: PRIORITIES },
          },
          required: ['text', 'reason', 'extra_price', 'priority'],
        },
      },
      retainer: {
        type: 'object',
        description: 'Iguala mensual de mantenimiento',
        additionalProperties: false,
        properties: {
          monthly: { type: 'number', description: 'MXN sin IVA por mes; 0 si no aplica' },
          includes: { type: 'array', items: { type: 'string' } },
          comment: { type: 'string' },
        },
        required: ['monthly', 'includes', 'comment'],
      },
      comparables_used: { type: 'array', items: { type: 'string' }, description: 'Folios de cotizaciones anteriores en las que se apoya el rango' },
      questions: { type: 'array', items: { type: 'string' }, description: 'Preguntas para el cliente' },
      risks: { type: 'array', items: { type: 'string' }, description: 'Riesgos o supuestos para dejar por escrito' },
    },
    required: ['summary', 'price', 'discount', 'features', 'retainer', 'comparables_used', 'questions', 'risks'],
  },
};

const hundreds = (v: unknown) => Math.max(0, Math.round((Number(v) || 0) / 100) * 100);

/**
 * Normalizes what the model returns: rounds to hundreds, trims lists, drops empty values
 * and discards quote numbers that were not among the comparables sent.
 */
export function normalizeOutput(raw: unknown, alreadyIncluded: string[] = [], validNumbers: string[] = []): AssistOutput {
  const r = (raw ?? {}) as Record<string, unknown>;
  const p = (r.price ?? {}) as Record<string, unknown>;
  const min = hundreds(p.min);
  const max = Math.max(min, hundreds(p.max));
  const included = new Set(alreadyIncluded.map((f) => f.trim().toLowerCase()));
  const list = (v: unknown, n: number) => (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.trim()).slice(0, n);
  const features = (Array.isArray(r.features) ? r.features : [])
    .map((c) => {
      const o = (c ?? {}) as Record<string, unknown>;
      const priority = PRIORITIES.includes(o.priority as Priority) ? (o.priority as Priority) : 'recommended';
      return { text: String(o.text ?? '').trim(), reason: String(o.reason ?? '').trim(), extra_price: hundreds(o.extra_price), priority };
    })
    .filter((c) => c.text && !included.has(c.text.toLowerCase()))
    .sort((a, b) => PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority))
    .slice(0, 8);
  const rt = r.retainer && typeof r.retainer === 'object' ? (r.retainer as Record<string, unknown>) : null;
  const retainer = rt && hundreds(rt.monthly) > 0 ? { monthly: hundreds(rt.monthly), includes: list(rt.includes, 5), comment: String(rt.comment ?? '').trim() } : null;
  const valid = new Set(validNumbers);
  const comparables_used = [...new Set(list(r.comparables_used, 50))].filter((f) => valid.has(f)).slice(0, 8);
  const d = r.discount && typeof r.discount === 'object' ? (r.discount as Record<string, unknown>) : null;
  const pct = Math.min(20, Math.max(0, Math.round(Number(d?.pct) || 0)));
  const discount = d ? { advisable: Boolean(d.advisable) && pct > 0, pct: Boolean(d.advisable) ? pct : 0, reason: String(d.reason ?? '').trim(), comment: String(d.comment ?? '').trim() } : null;
  return {
    summary: String(r.summary ?? '').trim(),
    price: { min, max, comment: String(p.comment ?? '').trim() },
    discount,
    features,
    retainer,
    comparables_used,
    questions: list(r.questions, 6),
    risks: list(r.risks, 5),
  };
}

/** Paragraph for the quote notes with the suggested retainer. */
export function retainerText(rt: NonNullable<AssistOutput['retainer']>): string {
  const includes = rt.includes.length ? ` Incluye: ${rt.includes.join('; ')}.` : '';
  return `Mantenimiento opcional después del primer mes: iguala de $${rt.monthly.toLocaleString('es-MX')} MXN + IVA al mes.${includes}`;
}
