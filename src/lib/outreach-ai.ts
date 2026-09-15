/**
 * Gancho por contacto con Claude: una o dos frases especificas sobre el negocio del
 * prospecto que hagan que el correo no parezca masivo. Logica pura; la llamada vive en
 * la ruta /api/outreach/drafts.
 */
import type Anthropic from '@anthropic-ai/sdk';

export interface GanchoInput {
  nombre: string;
  empresa: string;
  segmento?: string | null;
  sitio?: string | null;
  notas?: string | null;
  cargo?: string | null;
}

export function promptGancho(i: GanchoInput): string {
  return `Escribes una sola frase, máximo dos, para el correo de prospección en frío que imSoft (agencia de software a la medida en Guadalajara, México) le manda a un negocio. Va justo después de "Soy Brandon, de imSoft. Desarrollamos software a la medida..." y antes de la propuesta de una llamada de 15 minutos.

Prospecto:
- Empresa: ${i.empresa || '(desconocida)'}
- Contacto: ${i.nombre || '(desconocido)'}${i.cargo ? `, ${i.cargo}` : ''}
- Sector: ${i.segmento || 'no indicado'}
- Sitio web: ${i.sitio || 'no indicado'}
- Notas del CRM: ${i.notas || 'ninguna'}

Reglas:
- Habla de un problema operativo concreto y creíble para un negocio de ese sector y tamaño (seguimiento de pedidos, cotizaciones a mano, información repartida en WhatsApp y Excel, clientes que llaman a preguntar el estado de algo...). Elige uno, no una lista.
- Tuteo, español de México, tono de alguien que conoce el sector; sin halagos vacíos ("me encanta su empresa"), sin signos de exclamación, sin datos inventados sobre la empresa.
- Si las notas del CRM ya traen un gancho escrito por Brandon, respétalo y solo púlelo.
- Devuelve únicamente el gancho, sin comillas ni explicaciones.`;
}

export const GANCHO_TOOL: Anthropic.Tool = {
  name: 'gancho',
  description: 'Entrega el gancho para el correo.',
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    properties: { gancho: { type: 'string', description: 'Una o dos frases' } },
    required: ['gancho'],
  },
};

/** Limpia comillas y exclamaciones, y recorta a dos frases. */
export function limpiarGancho(raw: unknown): string {
  let g = String((raw as { gancho?: unknown })?.gancho ?? raw ?? '').trim().replace(/^["“”']+|["“”']+$/g, '').replace(/!/g, '.');
  const frases = g.match(/[^.?]+[.?]+/g);
  if (frases && frases.length > 2) g = frases.slice(0, 2).join('').trim();
  return g;
}
