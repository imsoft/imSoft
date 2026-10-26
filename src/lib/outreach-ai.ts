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
  /** 'app': negocio de consumo al que se le ofrece su propia app, no arreglar su Excel; 'tienda': tienda en linea. */
  oferta?: 'app' | 'tienda' | null;
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
- Habla solo del problema del prospecto. No menciones a imSoft, JTP Logistics, casos de éxito, precios ni lo que ofrecemos: eso ya va en otros párrafos del correo.
- Si el sector es "agro" (granja, empacadora, distribuidora agrícola), el problema está en el campo y la bodega: pesajes y lotes en libretas que luego se capturan, trazabilidad que se arma a mano cuando la pide una certificación o un cliente de exportación, el inventario de insumos o de parvadas que nadie tiene al día. Elige uno.
- Si el sector es "corporativo", es una empresa grande con área de sistemas propia: el problema no es el Excel sino proyectos que se quedan en la fila de sistemas (integraciones entre sucursales o con proveedores, portales internos, reportes que se arman a mano entre áreas). No supongas que les falta tecnología.
${i.oferta === 'app' && (i.segmento ?? '').startsWith('abastos') ? `- Es un mayorista (Mercado de Abastos o bodega de distribución) y le ofrecemos una app para que sus clientes de tienda y de ruta pidan solos; la presentación ya lo dice. Tu frase habla del pedido del cliente, no de su operación interna: pedidos que llegan por WhatsApp a deshoras y hay que pasar a mano, precios por cliente que cada vendedor trae en la cabeza, el cliente que llama a preguntar si ya salió su pedido. Elige uno. No hables de Excel.
` : i.oferta === 'app' ? `- A este negocio le ofrecemos su propia app para sus clientes (pedir, juntar puntos, recibir promociones), y la presentación ya lo dice. Tu frase habla del problema del lado del cliente final, no de la operación interna: pedidos que entran por WhatsApp o por apps de terceros que cobran comisión, clientes frecuentes que nadie identifica ni premia, promociones que solo viven en Instagram y no llegan a quien ya compra. Elige uno que cuadre con el giro. No hables de Excel ni de procesos internos.
` : i.oferta === 'tienda' ? `- Es una joyería y le ofrecemos su tienda en línea con su marca; la presentación ya lo dice. Tu frase habla de cómo vende hoy: piezas que se muestran por fotos en WhatsApp e Instagram una por una, apartados que se llevan en una libreta, clientes de fuera de la ciudad que no pueden comprar, el precio del oro que cambia y hay que recotizar a mano. Elige uno. No hables de Excel ni de procesos internos.
` : ''}- Si las notas del CRM traen un gancho corto escrito por Brandon, respétalo y solo púlelo. Si traen un correo completo, úsalo solo como contexto del sector.
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

/**
 * Las notas del CRM sirven de gancho solo si parecen un gancho (una o dos frases) y no
 * un correo completo pegado por el importador. En ese caso se le pasan a la IA como contexto.
 */
export function ganchoDesdeNotas(notas: string | null | undefined): string | null {
  const n = (notas ?? '').trim();
  if (!n || n.length > 320) return null;
  if (/^asunto:/im.test(n) || /^hola\b/im.test(n) || /\n\s*\n/.test(n) || /https?:\/\//.test(n)) return null;
  return n;
}
