/**
 * Datos de quien emite cotizaciones y contratos (Brandon, persona fisica en RESICO).
 * Proporcionados el 14-sep-2026.
 */
export const EMISOR = {
  nombre: 'Brandon Uriel García Ramos',
  marca: 'imSoft',
  rfc: 'GARB9703155ZA',
  regimen: 'Régimen Simplificado de Confianza (RESICO)',
  domicilio: 'Cipriano Campos Alatorre #752, interior #104, Col. Parques del Nilo, C.P. 44860',
  ciudad: 'Guadalajara, Jalisco, México',
  email: 'contacto@imsoft.io',
  telefono: '+52 33 2536 5558',
  sitio: 'https://www.imsoft.io',
} as const;

/** Valores por defecto del formulario; todos se pueden cambiar por cotizacion. */
export const CONDICIONES_DEFAULT = {
  vigencia_dias: 15,
  hitos: [
    { label: 'Anticipo', pct: 50 },
    { label: 'Liquidación contra entrega', pct: 50 },
  ],
  msi: true,
  garantia_dias: 30,
  soporte: 'Primer mes de soporte incluido después de la entrega. A partir del segundo mes, mediante iguala mensual cotizada por separado.',
  propiedad: 'El código fuente, los diseños y todos los entregables son propiedad del cliente desde el momento en que quedan pagados en su totalidad.',
  cambios_alcance: 'Los cambios que amplíen el alcance acordado se cotizan por separado antes de realizarse y no modifican las fechas ni el precio de lo ya contratado.',
  penalizacion_dia: 200,
  entrega_semanas: 4,
} as const;
