import { describe, it, expect } from 'vitest';
import {
  PROMOCIONES, descuentoValido, estaVencida, importesMensualidades, numMensualidades, textoMensualidades, featuresValidas, fechaVigencia, hitosValidos, importesHitos, itemsDesdePrecio, itemsValidos, motivoNoAceptable,
  DIAS_REVISION, esOpcionPago, opcionesDePago, planValido, plazoEntrega, porcentajeDescuento, precioProyecto, renderContrato, siguienteFolio, textoFormaDePago, totales, type QuoteLike,
} from './cotizaciones';
import { CONDICIONES_DEFAULT } from '@/config/emisor';

const q: QuoteLike = {
  number: 'COT-2026-001', status: 'sent', lang: 'es',
  client_name: 'Ana Pérez', client_company: 'Clínica Dental Sonrisa', client_email: 'ana@ejemplo.mx', client_rfc: 'CDS200101ABC', client_address: 'Zapopan, Jalisco',
  title: 'Página web corporativa', intro: 'Sitio de 6 secciones con formulario de citas.',
  items: [{ name: 'Diseño y desarrollo', quantity: 1, price: 15000 }, { name: 'Sesión de fotos', description: 'Media jornada', quantity: 1, price: 3000 }],
  currency: 'MXN', apply_iva: true,
  payment: { milestones: [{ label: 'Anticipo', pct: 50 }, { label: 'Liquidación', pct: 50 }], card_installments: true },
  terms: { ...CONDICIONES_DEFAULT, milestones: undefined as never, daily_penalty: 500 } as never,
  notes: null, valid_until: '2026-09-30',
};

describe('cotizaciones', () => {
  it('calcula subtotal, IVA y total', () => {
    expect(totales(q)).toEqual({ lista: 18000, descuento: 0, subtotal: 18000, iva: 2880, total: 20880 });
    expect(totales({ ...q, apply_iva: false }).total).toBe(18000);
  });

  it('el descuento baja el precio antes del IVA y se reparte en los hitos', () => {
    const conPct = { ...q, discount: { reason: 'Cliente desde 2023', type: 'pct' as const, value: 10 } };
    expect(totales(conPct)).toEqual({ lista: 18000, descuento: 1800, subtotal: 16200, iva: 2592, total: 18792 });
    expect(porcentajeDescuento(conPct)).toBe(10);
    const conMonto = { ...q, discount: { reason: 'Promoción', type: 'amount' as const, value: 3000 } };
    expect(totales(conMonto).subtotal).toBe(15000);
    expect(porcentajeDescuento(conMonto)).toBeCloseTo(16.67, 2);
    // Nunca mas que el precio, nunca negativo
    expect(totales({ ...q, discount: { reason: 'x', type: 'amount', value: 99999 } }).subtotal).toBe(0);
    expect(totales({ ...q, discount: { reason: 'x', type: 'pct', value: -5 } }).descuento).toBe(0);
    // Los hitos se calculan sobre el total con descuento
    const h = importesHitos(totales(conPct).total, q.payment.milestones);
    expect(h.reduce((s, x) => s + x.importe, 0)).toBe(18792);
    // Validacion: motivo obligatorio
    expect(descuentoValido({ reason: '', type: 'pct', value: 10 })).toMatch(/motivo/);
    expect(descuentoValido({ reason: 'Referido', type: 'pct', value: 100 })).toMatch(/100/);
    expect(descuentoValido({ reason: 'Referido', type: 'pct', value: 5 })).toBeNull();
    expect(descuentoValido(null)).toBeNull();
    expect(PROMOCIONES.every((p) => p.reason && p.value > 0)).toBe(true);
    // El contrato explica el descuento
    const html = renderContrato({ ...conPct, status: 'accepted', accepted_at: '2026-09-16T00:00:00Z', accepted_name: 'Ana Pérez' }, 'CON-2026-001');
    expect(html).toContain('precio de lista de $18,000.00');
    expect(html).toContain('Cliente desde 2023');
    expect(html).toContain('$18,792.00');
  });

  it('un hito se puede pagar en mensualidades por transferencia', () => {
    expect(importesMensualidades(10440, 3)).toEqual([3480, 3480, 3480]);
    const impar = importesMensualidades(100, 3);
    expect(impar).toEqual([33.33, 33.33, 33.34]);
    expect(impar.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 2);
    expect(numMensualidades({})).toBe(1);
    expect(numMensualidades({ monthly_payments: 3 })).toBe(3);
    expect(textoMensualidades(10440, { monthly_payments: 1 })).toBe('');
    expect(textoMensualidades(10440, { monthly_payments: 3 })).toBe('en 3 mensualidades de $3,480.00');
    expect(textoMensualidades(100, { monthly_payments: 3 })).toContain('una última de $33.34');
    const conPlan = { ...q, payment: { card_installments: false, milestones: [{ label: 'Anticipo', pct: 50, monthly_payments: 3 }, { label: 'Liquidación', pct: 50, monthly_payments: 3 }] } };
    const lineas = textoFormaDePago(conPlan);
    expect(lineas[0]).toBe('Anticipo: 50% ($10,440.00), en 3 mensualidades de $3,480.00 por transferencia');
    expect(lineas.join(' ')).toContain('sin intereses');
    expect(lineas.join(' ')).not.toContain('meses sin intereses con bancos');
    expect(hitosValidos([{ label: 'A', pct: 100, monthly_payments: 30 }])).toMatch(/1 a 24/);
    expect(hitosValidos(conPlan.payment.milestones)).toBeNull();
    const html = renderContrato({ ...conPlan, status: 'accepted', accepted_at: '2026-09-17T00:00:00Z', accepted_name: 'Ana Pérez' }, 'CON-2026-002');
    expect(html).toContain('pagadero en 3 mensualidades de $3,480.00 por transferencia bancaria');
    expect(html).toContain('suspender el servicio');
    expect(html).not.toContain('Ningún entregable se pone en producción ni se transfiere hasta recibir el pago del hito');
  });

  it('reparte los hitos y el ultimo absorbe el redondeo', () => {
    const h = importesHitos(20880, [{ label: 'A', pct: 40 }, { label: 'B', pct: 30 }, { label: 'C', pct: 30 }]);
    expect(h.map((x) => x.importe)).toEqual([8352, 6264, 6264]);
    expect(h.reduce((s, x) => s + x.importe, 0)).toBe(20880);
    const impar = importesHitos(100.01, [{ label: 'A', pct: 33 }, { label: 'B', pct: 33 }, { label: 'C', pct: 34 }]);
    expect(impar.reduce((s, x) => s + x.importe, 0)).toBeCloseTo(100.01, 2);
  });

  it('valida hitos y conceptos', () => {
    expect(hitosValidos([{ label: 'A', pct: 60 }, { label: 'B', pct: 50 }])).toMatch(/suman 110/);
    expect(hitosValidos([{ label: '', pct: 100 }])).toMatch(/nombre/);
    expect(hitosValidos(q.payment.milestones)).toBeNull();
    expect(itemsValidos([])).toMatch(/al menos/);
    expect(itemsValidos([{ name: 'x', quantity: 0, price: 1 }])).toMatch(/válidos/);
    expect(itemsValidos(q.items)).toBeNull();
  });

  it('precio unico y caracteristicas', () => {
    const items = itemsDesdePrecio('Página web', 18000);
    expect(items).toEqual([{ name: 'Página web', quantity: 1, price: 18000 }]);
    expect(precioProyecto({ items })).toBe(18000);
    expect(featuresValidas(['', '  '])).toMatch(/al menos/);
    expect(featuresValidas(['6 secciones'])).toBeNull();
    const html = renderContrato({ ...q, items, features: ['6 secciones', 'Formulario de citas', '<script>'] }, 'CON-2026-009');
    expect(html).toContain('las siguientes 3 características');
    expect(html).toContain('<ol><li>6 secciones</li><li>Formulario de citas</li><li>&lt;script&gt;</li></ol>');
    expect(html).not.toContain('Sesión de fotos');
  });

  it('el plazo de entrega se calcula desde la cotizacion hasta la fecha limite', () => {
    const conFecha = { terms: { ...q.terms, deadline: '2026-10-12' }, created_at: '2026-09-14T18:00:00Z' };
    const p = plazoEntrega(conFecha);
    expect(p).toMatchObject({ fechaLimite: '2026-10-12', dias: 28, semanas: 4 });
    expect(p.texto).toBe('12 de octubre de 2026 (4 semanas a partir de la cotización)');
    // 30 dias redondean a 5 semanas; un plazo minimo es 1 semana
    expect(plazoEntrega({ terms: { ...q.terms, deadline: '2026-10-14' }, created_at: '2026-09-14' }).semanas).toBe(5);
    expect(plazoEntrega({ terms: { ...q.terms, deadline: '2026-09-15' }, created_at: '2026-09-14' }).semanas).toBe(1);
    // Sin fecha limite (cotizaciones viejas) se usa entrega_semanas desde la creacion
    const sin = plazoEntrega({ terms: { ...q.terms, deadline: null, delivery_weeks: 4 }, created_at: '2026-09-14T18:00:00Z' });
    expect(sin.fechaLimite).toBe('2026-10-12');
    const html = renderContrato({ ...q, ...conFecha }, 'CON-2026-010');
    expect(html).toContain('a más tardar el <strong>12 de octubre de 2026</strong>, es decir, en un plazo de 4 semanas');
  });

  it('folios consecutivos por ano', () => {
    const hoy = new Date('2026-09-14T12:00:00Z');
    expect(siguienteFolio('COT', null, hoy)).toBe('COT-2026-001');
    expect(siguienteFolio('COT', 'COT-2026-009', hoy)).toBe('COT-2026-010');
    expect(siguienteFolio('COT', 'COT-2025-042', hoy)).toBe('COT-2026-001');
    expect(siguienteFolio('CON', 'basura', hoy)).toBe('CON-2026-001');
  });

  it('vigencia y aceptacion', () => {
    expect(fechaVigencia(15, new Date('2026-09-14T12:00:00Z'))).toBe('2026-09-29');
    expect(estaVencida(q, new Date('2026-09-30T23:00:00Z'))).toBe(false);
    expect(estaVencida(q, new Date('2026-10-01T00:00:00Z'))).toBe(true);
    expect(motivoNoAceptable(q, new Date('2026-09-20T00:00:00Z'))).toBeNull();
    expect(motivoNoAceptable({ ...q, status: 'draft' })).toMatch(/no se ha enviado/);
    expect(motivoNoAceptable({ ...q, status: 'accepted' }, new Date('2027-01-01'))).toMatch(/ya fue aceptada/);
    expect(motivoNoAceptable(q, new Date('2026-10-05T00:00:00Z'))).toMatch(/venció el 30 de septiembre de 2026/);
  });

  it('describe la forma de pago con hitos, descuento por transferencia, MSI y plan', () => {
    const t = textoFormaDePago(q);
    expect(t[0]).toBe('Anticipo: 50% ($10,440.00)');
    expect(t[1]).toBe('Liquidación: 50% ($10,440.00)');
    expect(t[2]).toBe('Pagando por transferencia bancaria, 5 % de descuento: $19,836.00 en total.');
    expect(t[3]).toMatch(/6 o 12 meses sin intereses/);
    // El costo del plazo va al total: 7.5 % + IVA a 6 meses, 12.5 % + IVA a 12.
    expect(t[3]).toContain('a 6 meses $22,696.56');
    expect(t[3]).toContain('a 12 meses $23,907.60');
    expect(t[4]).toContain('facturacion@imsoft.io');
    expect(textoFormaDePago({ ...q, payment: { ...q.payment, card_installments: false, transfer_discount_pct: 0 } })).toHaveLength(3);
    const conPlan = textoFormaDePago({ ...q, payment: { ...q.payment, plan: { months: 24, deposit_pct: 30, surcharge_pct: 40 } } });
    expect(conPlan[4]).toBe('Plan mensual a 24 meses: anticipo de $6,264.00 y 24 mensualidades de $957.00 ($29,232.00 en total), con hosting y soporte incluidos; el sistema opera en infraestructura de imSoft y el código se transfiere al cubrir la última mensualidad.');
  });

  it('las opciones de pago llevan cada una su total y el cliente elige una', () => {
    const op = opcionesDePago(q);
    expect(op.map((o) => o.clave)).toEqual(['transfer', 'card', 'installments_6', 'installments_12']);
    expect(op[0].total).toBe(19836);
    expect(op[1].total).toBe(20880);
    expect(op[3].resumen).toBe('12 pagos de $1,992.30; $23,907.60 en total');
    // Bajo el minimo de MSI, o sin MSI, solo transferencia y tarjeta.
    expect(opcionesDePago({ ...q, items: [{ name: 'x', quantity: 1, price: 5000 }] }).map((o) => o.clave)).toEqual(['transfer', 'card']);
    // Con plan valido aparece; con plan invalido no.
    expect(opcionesDePago({ ...q, payment: { ...q.payment, plan: { months: 24, deposit_pct: 30, surcharge_pct: 40 } } }).at(-1)?.clave).toBe('plan');
    expect(opcionesDePago({ ...q, payment: { ...q.payment, plan: { months: 2, deposit_pct: 30, surcharge_pct: 40 } } }).some((o) => o.clave === 'plan')).toBe(false);
    expect(planValido({ months: 24, deposit_pct: 30, surcharge_pct: 40 })).toBeNull();
    expect(planValido({ months: 48, deposit_pct: 30, surcharge_pct: 40 })).toMatch(/6 a 36/);
    expect(esOpcionPago('plan')).toBe(true);
    expect(esOpcionPago('credito')).toBe(false);
    // El contrato nombra la opcion elegida y, en el plan, sus reglas.
    const html = renderContrato({ ...q, payment: { ...q.payment, plan: { months: 24, deposit_pct: 30, surcharge_pct: 40 } }, accepted_payment_option: 'plan' }, 'CON-2026-009');
    expect(html).toContain('El Cliente eligió como forma de pago: <strong>Plan mensual a 24 meses');
    expect(html).toContain('<strong>Plan de suscripción.</strong>');
    expect(html).toContain('no un crédito ni un financiamiento');
    expect(html).toContain('24 mensualidades consecutivas de $957.00');
    expect(renderContrato({ ...q, accepted_payment_option: 'transfer' }, 'CON-2026-010')).toContain('El descuento por transferencia aplica');
    expect(renderContrato(q, 'CON-2026-011')).not.toContain('El Cliente eligió');
  });

  it('el contrato lleva las partes, el alcance, los pagos y las condiciones', () => {
    const html = renderContrato(q, 'CON-2026-001', new Date('2026-09-14T18:00:00Z'));
    expect(html).toContain('Brandon Uriel García Ramos');
    expect(html).toContain('GARB9703155ZA');
    expect(html).toContain('Ana Pérez');
    expect(html).toContain('Clínica Dental Sonrisa');
    expect(html).toContain('<strong>$20,880.00</strong>');
    expect(html).toContain('Anticipo: 50% del total, $10,440.00.');
    expect(html).toContain('$500.00 por cada día hábil adicional');
    expect(html).toContain('30 días naturales');
    expect(html).toContain('Guadalajara, Jalisco, México');
    expect(html).toContain('Col. Parques del Nilo, C.P. 44860');
    expect(html).toContain('propiedad del cliente');
    expect(html).toContain('facturacion@imsoft.io');
    expect(html).toContain('soporte@imsoft.io');
    // Sin penalizacion el texto cambia
    expect(renderContrato({ ...q, terms: { ...q.terms, daily_penalty: 0 } }, 'CON-2026-002')).not.toContain('por cada día hábil adicional');
    // Escapa HTML del cliente
    expect(renderContrato({ ...q, client_name: '<b>x</b>' }, 'CON-2026-003')).toContain('&lt;b&gt;x&lt;/b&gt;');
  });

  it('el contrato trae las cláusulas de aceptación, terceros, datos, responsabilidad y cesión', () => {
    const html = renderContrato(q, 'CON-2026-004');
    const titulos = [...html.matchAll(/<h2>([^<]+)<\/h2>/g)].map((m) => m[1]);
    expect(titulos).toEqual([
      'Primera. Objeto', 'Segunda. Precio y forma de pago', 'Tercera. Plazo de entrega', 'Cuarta. Entrega y aceptación',
      'Quinta. Propiedad de los entregables', 'Sexta. Cambios de alcance', 'Séptima. Obligaciones del Cliente', 'Octava. Garantía y soporte',
      'Novena. Servicios de terceros y operación', 'Décima. Datos personales', 'Décima primera. Límite de responsabilidad',
      'Décima segunda. Confidencialidad', 'Décima tercera. Vigencia, terminación y cesión', 'Décima cuarta. Comunicaciones y aceptación',
      'Décima quinta. Jurisdicción',
    ]);
    expect(html).toContain(`${DIAS_REVISION} días hábiles para revisarla`);
    expect(html).toContain('se limita al monto efectivamente pagado');
    expect(html).toContain('Ley Federal de Protección de Datos Personales');
    expect(html).toContain('responsabilidad exclusiva del Cliente y de quien los firme');
    expect(html).toContain('Ninguna de las partes podrá ceder');
    // Las referencias cruzadas apuntan a la numeración nueva
    expect(html).toContain('conforme a las cláusulas Sexta y Séptima');
    const conMensualidades = renderContrato({ ...q, payment: { ...q.payment, milestones: q.payment.milestones.map((h) => ({ ...h, monthly_payments: 3 })) } }, 'CON-2026-005');
    expect(conMensualidades).toContain('conforme a la cláusula Quinta, al quedar pagado el total');
  });
});
