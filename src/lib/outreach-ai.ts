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
const PREFIJO_FICHA = /^Google Maps:/m;

/** La linea "Google Maps: ..." que guarda el buscador en las notas, si la hay. */
export function fichaDeNotas(notas: string | null | undefined): string | null {
  const m = (notas ?? '').split('\n').find((l) => PREFIJO_FICHA.test(l.trim()));
  return m ? m.trim() : null;
}

/** Las notas sin la ficha de Google: lo que escribio Brandon a mano. */
export function notasSinFicha(notas: string | null | undefined): string {
  return (notas ?? '').split('\n').filter((l) => !PREFIJO_FICHA.test(l.trim())).join('\n').trim();
}

export interface AperturaInput {
  empresa: string;
  segmento?: string | null;
  /** Ficha de Google Maps (calificacion, reseñas, tipo, direccion) y lo que se sepa del negocio. */
  datos?: string | null;
  notas?: string | null;
  oferta?: 'app' | 'tienda' | null;
}

/**
 * Primer mensaje de redes (WhatsApp e Instagram) desde el 30-oct-2026: ya no vende, abre
 * conversacion. Una observacion real del negocio y una pregunta corta sobre como lo
 * operan hoy; la presentacion de imSoft va aparte, en una linea. Dos semanas con el
 * mensaje largo dieron 3-4 % de respuesta y casi todas de recepcion.
 */
export function promptApertura(i: AperturaInput): string {
  const problema =
    i.oferta === 'tienda'
      ? 'como venden hoy fuera del mostrador: piezas por foto en WhatsApp o Instagram, apartados en libreta, clientes de otra ciudad'
      : i.oferta === 'app' && (i.segmento ?? '').startsWith('abastos')
      ? 'como les llegan los pedidos de sus clientes de tienda y ruta (WhatsApp a deshoras, captura a mano) y como arman la ruta'
      : i.oferta === 'app'
      ? 'como identifican hoy a sus clientes frecuentes y como les hacen llegar promociones, o por donde les entran los pedidos'
      : (i.segmento ?? '').startsWith('agro')
      ? 'como llevan pesajes, lotes y trazabilidad: libreta, Excel o algo mas'
      : (i.segmento ?? '').startsWith('logistica')
      ? 'como le contestan al cliente donde va su embarque'
      : (i.segmento ?? '').startsWith('corporativo')
      ? 'que proyecto de sistemas traen formado que no sale por falta de manos'
      : 'el proceso que probablemente llevan a mano o en Excel (agenda y confirmaciones, cotizaciones, seguimiento de pedidos, avance de obra, prospectos)';
  return `Escribes el primer mensaje de WhatsApp o Instagram que imSoft (software a la medida, Guadalajara) le manda en frío a un negocio local. El mensaje NO vende: abre conversación. Después de tu texto se agrega, en otra línea, "Soy Brandon, de imSoft; hacemos …", así que no te presentes ni menciones imSoft.

Negocio: ${i.empresa || '(desconocido)'}
Sector: ${i.segmento || 'no indicado'}
Datos reales: ${i.datos || 'ninguno'}
Notas: ${i.notas || 'ninguna'}

Escribe exactamente dos partes, en un solo párrafo de máximo 50 palabras:
1) Una observación concreta del negocio tomada SOLO de los datos reales ("vi que tienen 4.8 en Google con 200 reseñas", "vi que tienen dos sucursales", "vi que atienden ortodoncia"). Empieza con "Hola, vi que". Si no hay datos, empieza con "Hola, pregunta rápida:" y salta a la pregunta.
2) Una pregunta corta, fácil de contestar en cinco palabras, sobre ${problema}. Que ofrezca dos opciones ("¿lo hacen a mano o ya tienen algo?") para que sea fácil responder.

Reglas: la observación y la pregunta son obligatorias y la pregunta cierra el texto con "?". Si la calificación tiene menos de 10 reseñas, no la menciones: usa el tipo de negocio o la zona. Trato de usted en plural ("tienen", "hacen"), nunca "tú". Español de México, natural, sin signos de exclamación, sin halagos ("felicidades", "me encanta"), sin adjetivos de venta, sin precios, sin enlaces, sin proponer llamada ni reunión. No inventes datos: si los datos reales no dicen sucursales, no digas sucursales. Devuelve solo el texto.`;
}

/** Pregunta de respaldo por giro, por si la IA devuelve la observacion sin pregunta. */
export function preguntaPorDefecto(segmento?: string | null, oferta?: 'app' | 'tienda' | null): string {
  const g = (segmento ?? '').toLowerCase();
  if (oferta === 'tienda') return '¿Las ventas a clientes de fuera las cierran por WhatsApp o ya tienen tienda en línea?';
  if (g.startsWith('abastos')) return '¿Los pedidos de sus clientes los capturan a mano o ya tienen algo?';
  if (oferta === 'app') return '¿A sus clientes frecuentes los tienen identificados de alguna forma o se atienden igual que a los nuevos?';
  if (g.startsWith('dental') || g.startsWith('salud')) return '¿Las confirmaciones de cita las hacen a mano o ya tienen algo que las mande solas?';
  if (g.startsWith('ferreteria')) return '¿Las cotizaciones grandes las arman a mano o ya tienen un sistema que les dé precio y existencia?';
  if (g.startsWith('automotriz')) return '¿Cuando el cliente pregunta cómo va su carro, se lo contestan al momento o alguien tiene que ir a ver?';
  if (g.startsWith('inmobiliaria')) return '¿El seguimiento a los prospectos lo lleva cada asesor por su cuenta o ya tienen un sistema?';
  if (g.startsWith('construccion')) return '¿El avance de obra les llega en fotos por WhatsApp o ya tienen algo donde se registre?';
  if (g.startsWith('logistica')) return '¿Cuando el cliente pregunta dónde va su embarque, se lo contestan al momento o alguien tiene que buscarlo?';
  if (g.startsWith('agro')) return '¿Los pesajes y lotes los llevan en libreta o ya tienen algo?';
  return '¿Lo que llevan a mano o en Excel hoy, ya tienen algo que lo ordene o siguen así?';
}

/** Limpia la apertura sin recortarla: solo comillas, exclamaciones y espacios. */
export function limpiarApertura(raw: unknown): string {
  return String((raw as { gancho?: unknown })?.gancho ?? raw ?? '').trim().replace(/^["“”']+|["“”']+$/g, '').replace(/!/g, '.').replace(/\s+/g, ' ');
}

export function ganchoDesdeNotas(notas: string | null | undefined): string | null {
  const n = notasSinFicha(notas);
  if (!n || n.length > 320) return null;
  if (/^asunto:/im.test(n) || /^hola\b/im.test(n) || /\n\s*\n/.test(n) || /https?:\/\//.test(n)) return null;
  return n;
}
