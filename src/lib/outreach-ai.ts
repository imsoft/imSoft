/**
 * Per-contact hook with Claude: one or two specific sentences about the prospect's
 * business so the email doesn't look mass-sent. Pure logic; the call lives in the
 * /api/outreach/drafts route.
 */
import type Anthropic from '@anthropic-ai/sdk';

export interface HookInput {
  name: string;
  company: string;
  segment?: string | null;
  website?: string | null;
  notes?: string | null;
  jobTitle?: string | null;
  /** 'app': consumer business offered its own app, not fixing its Excel; 'store': online store. */
  offer?: 'app' | 'store' | null;
}

export function hookPrompt(i: HookInput): string {
  return `Escribes una sola frase, máximo dos, para el correo de prospección en frío que imSoft (agencia de software a la medida en Guadalajara, México) le manda a un negocio. Va justo después de "Soy Brandon, de imSoft. Desarrollamos software a la medida..." y antes de la propuesta de una llamada de 15 minutos.

Prospecto:
- Empresa: ${i.company || '(desconocida)'}
- Contacto: ${i.name || '(desconocido)'}${i.jobTitle ? `, ${i.jobTitle}` : ''}
- Sector: ${i.segment || 'no indicado'}
- Sitio web: ${i.website || 'no indicado'}
- Notas del CRM: ${i.notes || 'ninguna'}

Reglas:
- Habla de un problema operativo concreto y creíble para un negocio de ese sector y tamaño (seguimiento de pedidos, cotizaciones a mano, información repartida en WhatsApp y Excel, clientes que llaman a preguntar el estado de algo...). Elige uno, no una lista.
- Tuteo, español de México, tono de alguien que conoce el sector; sin halagos vacíos ("me encanta su empresa"), sin signos de exclamación, sin datos inventados sobre la empresa.
- Habla solo del problema del prospecto. No menciones a imSoft, JTP Logistics, casos de éxito, precios ni lo que ofrecemos: eso ya va en otros párrafos del correo.
- Si el sector es "agro" (granja, empacadora, distribuidora agrícola), el problema está en el campo y la bodega: pesajes y lotes en libretas que luego se capturan, trazabilidad que se arma a mano cuando la pide una certificación o un cliente de exportación, el inventario de insumos o de parvadas que nadie tiene al día. Elige uno.
- Si el sector es "corporate", es una empresa grande con área de sistemas propia: el problema no es el Excel sino proyectos que se quedan en la fila de sistemas (integraciones entre sucursales o con proveedores, portales internos, reportes que se arman a mano entre áreas). No supongas que les falta tecnología.
${i.offer === 'app' && (i.segment ?? '').startsWith('wholesale-market') ? `- Es un mayorista (Mercado de Abastos o bodega de distribución) y le ofrecemos una app para que sus clientes de tienda y de ruta pidan solos; la presentación ya lo dice. Tu frase habla del pedido del cliente, no de su operación interna: pedidos que llegan por WhatsApp a deshoras y hay que pasar a mano, precios por cliente que cada vendedor trae en la cabeza, el cliente que llama a preguntar si ya salió su pedido. Elige uno. No hables de Excel.
` : i.offer === 'app' ? `- A este negocio le ofrecemos su propia app para sus clientes (pedir, juntar puntos, recibir promociones), y la presentación ya lo dice. Tu frase habla del problema del lado del cliente final, no de la operación interna: pedidos que entran por WhatsApp o por apps de terceros que cobran comisión, clientes frecuentes que nadie identifica ni premia, promociones que solo viven en Instagram y no llegan a quien ya compra. Elige uno que cuadre con el giro. No hables de Excel ni de procesos internos.
` : i.offer === 'store' ? `- Es una joyería y le ofrecemos su tienda en línea con su marca; la presentación ya lo dice. Tu frase habla de cómo vende hoy: piezas que se muestran por fotos en WhatsApp e Instagram una por una, apartados que se llevan en una libreta, clientes de fuera de la ciudad que no pueden comprar, el precio del oro que cambia y hay que recotizar a mano. Elige uno. No hables de Excel ni de procesos internos.
` : ''}- Si las notas del CRM traen un gancho corto escrito por Brandon, respétalo y solo púlelo. Si traen un correo completo, úsalo solo como contexto del sector.
- Devuelve únicamente el gancho, sin comillas ni explicaciones.`;
}

export const HOOK_TOOL: Anthropic.Tool = {
  name: 'hook',
  description: 'Entrega el gancho para el correo.',
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: { hook: { type: 'string', description: 'Una o dos frases' } },
    required: ['hook'],
  },
};

/** Strips quotes and exclamation marks, and trims to two sentences. */
export function cleanHook(raw: unknown): string {
  let h = String((raw as { hook?: unknown })?.hook ?? raw ?? '').trim().replace(/^["“”']+|["“”']+$/g, '').replace(/!/g, '.');
  const sentences = h.match(/[^.?]+[.?]+/g);
  if (sentences && sentences.length > 2) h = sentences.slice(0, 2).join('').trim();
  return h;
}

/** Prefix of the Google Maps line that the prospect search stores in the notes. */
const LISTING_PREFIX = /^Google Maps:/m;

/** The "Google Maps: ..." line that the prospect search stores in the notes, if any. */
export function listingFromNotes(notes: string | null | undefined): string | null {
  const m = (notes ?? '').split('\n').find((l) => LISTING_PREFIX.test(l.trim()));
  return m ? m.trim() : null;
}

/** The notes without the Google listing: what Brandon wrote by hand. */
export function notesWithoutListing(notes: string | null | undefined): string {
  return (notes ?? '').split('\n').filter((l) => !LISTING_PREFIX.test(l.trim())).join('\n').trim();
}

export interface OpenerInput {
  company: string;
  segment?: string | null;
  /** Google Maps listing (rating, reviews, type, address) and whatever is known about the business. */
  data?: string | null;
  notes?: string | null;
  offer?: 'app' | 'store' | null;
}

/**
 * First social message (WhatsApp and Instagram) since 2026-10-30: it no longer sells, it
 * opens a conversation. A real observation about the business and a short question about
 * how they run it today; imSoft's introduction goes separately, in one line. Two weeks
 * with the long message gave a 3-4 % reply rate, almost all from front desks.
 */
export function openerPrompt(i: OpenerInput): string {
  const problem =
    i.offer === 'store'
      ? 'como venden hoy fuera del mostrador: piezas por foto en WhatsApp o Instagram, apartados en libreta, clientes de otra ciudad'
      : i.offer === 'app' && (i.segment ?? '').startsWith('wholesale-market')
      ? 'como les llegan los pedidos de sus clientes de tienda y ruta (WhatsApp a deshoras, captura a mano) y como arman la ruta'
      : i.offer === 'app'
      ? 'como identifican hoy a sus clientes frecuentes y como les hacen llegar promociones, o por donde les entran los pedidos'
      : (i.segment ?? '').startsWith('agro')
      ? 'como llevan pesajes, lotes y trazabilidad: libreta, Excel o algo mas'
      : (i.segment ?? '').startsWith('logistics')
      ? 'como le contestan al cliente donde va su embarque'
      : (i.segment ?? '').startsWith('corporate')
      ? 'que proyecto de sistemas traen formado que no sale por falta de manos'
      : 'el proceso que probablemente llevan a mano o en Excel (agenda y confirmaciones, cotizaciones, seguimiento de pedidos, avance de obra, prospectos)';
  return `Escribes el primer mensaje de WhatsApp o Instagram que imSoft (software a la medida, Guadalajara) le manda en frío a un negocio local. El mensaje NO vende: abre conversación. Después de tu texto se agrega, en otra línea, "Soy Brandon, de imSoft; hacemos …", así que no te presentes ni menciones imSoft.

Negocio: ${i.company || '(desconocido)'}
Sector: ${i.segment || 'no indicado'}
Datos reales: ${i.data || 'ninguno'}
Notas: ${i.notes || 'ninguna'}

Escribe exactamente dos partes, en un solo párrafo de máximo 50 palabras:
1) Una observación concreta del negocio tomada SOLO de los datos reales ("vi que tienen 4.8 en Google con 200 reseñas", "vi que tienen dos sucursales", "vi que atienden ortodoncia"). Empieza con "Hola, vi que". Si no hay datos, empieza con "Hola, pregunta rápida:" y salta a la pregunta.
2) Una pregunta corta, fácil de contestar en cinco palabras, sobre ${problem}. Que ofrezca dos opciones ("¿lo hacen a mano o ya tienen algo?") para que sea fácil responder.

Reglas: la observación y la pregunta son obligatorias y la pregunta cierra el texto con "?". Si la calificación tiene menos de 10 reseñas, no la menciones: usa el tipo de negocio o la zona. Trato de usted en plural ("tienen", "hacen"), nunca "tú". Español de México, natural, sin signos de exclamación, sin halagos ("felicidades", "me encanta"), sin adjetivos de venta, sin precios, sin enlaces, sin proponer llamada ni reunión. No inventes datos: si los datos reales no dicen sucursales, no digas sucursales. Devuelve solo el texto.`;
}

/** Fallback question per industry, in case the AI returns the observation without a question. */
export function defaultQuestion(segment?: string | null, offer?: 'app' | 'store' | null): string {
  const g = (segment ?? '').toLowerCase();
  if (offer === 'store') return '¿Las ventas a clientes de fuera las cierran por WhatsApp o ya tienen tienda en línea?';
  if (g.startsWith('wholesale-market')) return '¿Los pedidos de sus clientes los capturan a mano o ya tienen algo?';
  if (offer === 'app') return '¿A sus clientes frecuentes los tienen identificados de alguna forma o se atienden igual que a los nuevos?';
  if (g.startsWith('dental') || g.startsWith('health')) return '¿Las confirmaciones de cita las hacen a mano o ya tienen algo que las mande solas?';
  if (g.startsWith('hardware-stores')) return '¿Las cotizaciones grandes las arman a mano o ya tienen un sistema que les dé precio y existencia?';
  if (g.startsWith('automotive')) return '¿Cuando el cliente pregunta cómo va su carro, se lo contestan al momento o alguien tiene que ir a ver?';
  if (g.startsWith('real-estate')) return '¿El seguimiento a los prospectos lo lleva cada asesor por su cuenta o ya tienen un sistema?';
  if (g.startsWith('construction')) return '¿El avance de obra les llega en fotos por WhatsApp o ya tienen algo donde se registre?';
  if (g.startsWith('logistics')) return '¿Cuando el cliente pregunta dónde va su embarque, se lo contestan al momento o alguien tiene que buscarlo?';
  if (g.startsWith('agro')) return '¿Los pesajes y lotes los llevan en libreta o ya tienen algo?';
  return '¿Lo que llevan a mano o en Excel hoy, ya tienen algo que lo ordene o siguen así?';
}

/** Cleans the opener without trimming it: only quotes, exclamation marks and whitespace. */
export function cleanOpener(raw: unknown): string {
  return String((raw as { hook?: unknown })?.hook ?? raw ?? '').trim().replace(/^["“”']+|["“”']+$/g, '').replace(/!/g, '.').replace(/\s+/g, ' ');
}

/**
 * CRM notes work as a hook only if they look like one (one or two sentences) and not a
 * full email pasted by the importer. Otherwise they're passed to the AI as context.
 */
export function hookFromNotes(notes: string | null | undefined): string | null {
  const n = notesWithoutListing(notes);
  if (!n || n.length > 320) return null;
  if (/^asunto:/im.test(n) || /^hola\b/im.test(n) || /\n\s*\n/.test(n) || /https?:\/\//.test(n)) return null;
  return n;
}
