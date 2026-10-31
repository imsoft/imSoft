/**
 * Details of whoever issues quotes and contracts (Brandon, individual taxpayer under RESICO).
 * Provided on 2026-09-14.
 */
export const ISSUER = {
  name: 'Brandon Uriel García Ramos',
  brand: 'imSoft',
  rfc: 'GARB9703155ZA',
  taxRegime: 'Régimen Simplificado de Confianza (RESICO)',
  address: 'Cipriano Campos Alatorre #752, interior #104, Col. Parques del Nilo, C.P. 44860',
  city: 'Guadalajara, Jalisco, México',
  email: 'contacto@imsoft.io',
  /** Workspace aliases created on 2026-09-15; they land in the same inbox. */
  billingEmail: 'facturacion@imsoft.io',
  supportEmail: 'soporte@imsoft.io',
  phone: '+52 33 2536 5558',
  website: 'https://www.imsoft.io',
} as const;

/** Form defaults; every one of them can be changed per quote. */
export const DEFAULT_TERMS = {
  valid_days: 15,
  milestones: [
    { label: 'Anticipo', pct: 50 },
    { label: 'Liquidación contra entrega', pct: 50 },
  ],
  card_installments: true,
  warranty_days: 30,
  support: 'Primer mes de soporte incluido después de la entrega. A partir del segundo mes, mediante iguala mensual cotizada por separado.',
  ownership: 'El código fuente, los diseños y todos los entregables son propiedad del cliente desde el momento en que quedan pagados en su totalidad.',
  scope_changes: 'Los cambios que amplíen el alcance acordado se cotizan por separado antes de realizarse y no modifican las fechas ni el precio de lo ya contratado.',
  daily_penalty: 200,
  delivery_weeks: 4,
} as const;
