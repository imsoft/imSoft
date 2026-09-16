import type Anthropic from '@anthropic-ai/sdk';

/**
 * Asistente de cotizacion: a partir del proyecto (titulo, resumen, caracteristicas,
 * precio tentativo) pide a Claude un rango de precio, caracteristicas que suelen
 * faltar, preguntas para el cliente y riesgos. Logica pura aqui; la llamada a la API
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
  descuentoActual?: { motivo: string; tipo: 'pct' | 'monto'; valor: number } | null;
}

export interface AssistOutput {
  resumen: string;
  precio: { min: number; max: number; comentario: string };
  descuento: { conviene: boolean; pct: number; motivo: string; comentario: string } | null;
  caracteristicas: Array<{ texto: string; motivo: string }>;
  preguntas: string[];
  riesgos: string[];
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
Descuento ya capturado: ${i.descuentoActual ? `${i.descuentoActual.tipo === 'pct' ? `${i.descuentoActual.valor} %` : `$${i.descuentoActual.valor}`} por "${i.descuentoActual.motivo}"` : 'ninguno'}

## Características ya incluidas (${i.features.length})
${i.features.length ? i.features.map((f, n) => `${n + 1}. ${f}`).join('\n') : '(ninguna todavía)'}

## Referencia de precios que imSoft publica (sin IVA, "desde")
${ref}

## Lo que necesito
1. Un rango de precio razonable en MXN sin IVA para este alcance en el mercado de Guadalajara, coherente con la referencia de arriba y con el esfuerzo real que implican las características. Explica en dos frases qué lo justifica y si el precio tentativo va bajo, bien o alto.
2. Características que suelen faltar en un proyecto así y que el cliente va a dar por hechas (por ejemplo: SEO técnico, formulario con notificaciones, panel de administración, respaldos, capacitación, analítica). Solo las que apliquen; máximo 8; sin repetir las ya incluidas.
3. Preguntas concretas que conviene hacerle al cliente antes de cerrar el precio (máximo 6).
4. Riesgos o supuestos que conviene dejar por escrito en la cotización (máximo 5).
5. Si conviene ofrecer un descuento y de cuánto (porcentaje entero, máximo 20 %), con un motivo corto que el cliente pueda leer ("Cliente recurrente", "Promoción de lanzamiento", "Referido"). Regla: el descuento solo tiene sentido si ayuda a cerrar (cliente recurrente, referido, temporada, proyecto que abre un nicho); si el precio ya va bajo o el cliente es nuevo sin razón especial, di que no conviene. Recuerda que imSoft paga 3.6 % + $3 por cobro con tarjeta y ISR de RESICO.

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
          properties: { texto: { type: 'string' }, motivo: { type: 'string' } },
          required: ['texto', 'motivo'],
        },
      },
      preguntas: { type: 'array', items: { type: 'string' } },
      riesgos: { type: 'array', items: { type: 'string' } },
    },
    required: ['resumen', 'precio', 'descuento', 'caracteristicas', 'preguntas', 'riesgos'],
  },
};

/** Normaliza lo que devuelve el modelo: redondea a centenas, recorta listas, quita vacios. */
export function normalizarOutput(raw: unknown, yaIncluidas: string[] = []): AssistOutput {
  const r = (raw ?? {}) as Record<string, unknown>;
  const p = (r.precio ?? {}) as Record<string, unknown>;
  const min = Math.max(0, Math.round((Number(p.min) || 0) / 100) * 100);
  const max = Math.max(min, Math.round((Number(p.max) || 0) / 100) * 100);
  const incluidas = new Set(yaIncluidas.map((f) => f.trim().toLowerCase()));
  const lista = (v: unknown, n: number) => (Array.isArray(v) ? v : []).filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.trim()).slice(0, n);
  const caracteristicas = (Array.isArray(r.caracteristicas) ? r.caracteristicas : [])
    .map((c) => ({ texto: String((c as Record<string, unknown>)?.texto ?? '').trim(), motivo: String((c as Record<string, unknown>)?.motivo ?? '').trim() }))
    .filter((c) => c.texto && !incluidas.has(c.texto.toLowerCase()))
    .slice(0, 8);
  const d = r.descuento && typeof r.descuento === 'object' ? (r.descuento as Record<string, unknown>) : null;
  const pct = Math.min(20, Math.max(0, Math.round(Number(d?.pct) || 0)));
  const descuento = d ? { conviene: Boolean(d.conviene) && pct > 0, pct: Boolean(d.conviene) ? pct : 0, motivo: String(d.motivo ?? '').trim(), comentario: String(d.comentario ?? '').trim() } : null;
  return {
    resumen: String(r.resumen ?? '').trim(),
    precio: { min, max, comentario: String(p.comentario ?? '').trim() },
    descuento,
    caracteristicas,
    preguntas: lista(r.preguntas, 6),
    riesgos: lista(r.riesgos, 5),
  };
}
