import { describe, it, expect } from 'vitest';
import {
  PROMOTIONS, validateDiscount, isExpired, monthlyPaymentAmounts, monthlyPaymentCount, monthlyPaymentsText, validateFeatures, dateAfterDays, validateMilestones, milestoneAmounts, itemsFromPrice, validateItems, notAcceptableReason,
  REVIEW_BUSINESS_DAYS, isPaymentOptionKey, paymentOptions, validatePlan, deliveryTerm, discountPct, projectPrice, renderContract, nextNumber, paymentTermsText, quoteTotals, type QuoteLike,
} from './quotes';
import { DEFAULT_TERMS } from '@/config/issuer';

const q: QuoteLike = {
  number: 'COT-2026-001', status: 'sent', lang: 'es',
  client_name: 'Ana Pérez', client_company: 'Clínica Dental Sonrisa', client_email: 'ana@ejemplo.mx', client_rfc: 'CDS200101ABC', client_address: 'Zapopan, Jalisco',
  title: 'Página web corporativa', intro: 'Sitio de 6 secciones con formulario de citas.',
  items: [{ name: 'Diseño y desarrollo', quantity: 1, price: 15000 }, { name: 'Sesión de fotos', description: 'Media jornada', quantity: 1, price: 3000 }],
  currency: 'MXN', apply_iva: true,
  payment: { milestones: [{ label: 'Anticipo', pct: 50 }, { label: 'Liquidación', pct: 50 }], card_installments: true },
  terms: { ...DEFAULT_TERMS, milestones: undefined as never, daily_penalty: 500 } as never,
  notes: null, valid_until: '2026-09-30',
};

describe('quotes', () => {
  it('computes subtotal, VAT and total', () => {
    expect(quoteTotals(q)).toEqual({ listPrice: 18000, discount: 0, subtotal: 18000, vat: 2880, total: 20880 });
    expect(quoteTotals({ ...q, apply_iva: false }).total).toBe(18000);
  });

  it('the discount lowers the price before VAT and is spread across the milestones', () => {
    const withPct = { ...q, discount: { reason: 'Cliente desde 2023', type: 'pct' as const, value: 10 } };
    expect(quoteTotals(withPct)).toEqual({ listPrice: 18000, discount: 1800, subtotal: 16200, vat: 2592, total: 18792 });
    expect(discountPct(withPct)).toBe(10);
    const withAmount = { ...q, discount: { reason: 'Promoción', type: 'amount' as const, value: 3000 } };
    expect(quoteTotals(withAmount).subtotal).toBe(15000);
    expect(discountPct(withAmount)).toBeCloseTo(16.67, 2);
    // Never more than the price, never negative
    expect(quoteTotals({ ...q, discount: { reason: 'x', type: 'amount', value: 99999 } }).subtotal).toBe(0);
    expect(quoteTotals({ ...q, discount: { reason: 'x', type: 'pct', value: -5 } }).discount).toBe(0);
    // Milestones are computed over the discounted total
    const h = milestoneAmounts(quoteTotals(withPct).total, q.payment.milestones);
    expect(h.reduce((s, x) => s + x.amount, 0)).toBe(18792);
    // Validation: a reason is required
    expect(validateDiscount({ reason: '', type: 'pct', value: 10 })).toMatch(/motivo/);
    expect(validateDiscount({ reason: 'Referido', type: 'pct', value: 100 })).toMatch(/100/);
    expect(validateDiscount({ reason: 'Referido', type: 'pct', value: 5 })).toBeNull();
    expect(validateDiscount(null)).toBeNull();
    expect(PROMOTIONS.every((p) => p.reason && p.value > 0)).toBe(true);
    // The contract explains the discount
    const html = renderContract({ ...withPct, status: 'accepted', accepted_at: '2026-09-16T00:00:00Z', accepted_name: 'Ana Pérez' }, 'CON-2026-001');
    expect(html).toContain('precio de lista de $18,000.00');
    expect(html).toContain('Cliente desde 2023');
    expect(html).toContain('$18,792.00');
  });

  it('a milestone can be paid in monthly bank transfers', () => {
    expect(monthlyPaymentAmounts(10440, 3)).toEqual([3480, 3480, 3480]);
    const uneven = monthlyPaymentAmounts(100, 3);
    expect(uneven).toEqual([33.33, 33.33, 33.34]);
    expect(uneven.reduce((a, b) => a + b, 0)).toBeCloseTo(100, 2);
    expect(monthlyPaymentCount({})).toBe(1);
    expect(monthlyPaymentCount({ monthly_payments: 3 })).toBe(3);
    expect(monthlyPaymentsText(10440, { monthly_payments: 1 })).toBe('');
    expect(monthlyPaymentsText(10440, { monthly_payments: 3 })).toBe('en 3 mensualidades de $3,480.00');
    expect(monthlyPaymentsText(100, { monthly_payments: 3 })).toContain('una última de $33.34');
    const withPlan = { ...q, payment: { card_installments: false, milestones: [{ label: 'Anticipo', pct: 50, monthly_payments: 3 }, { label: 'Liquidación', pct: 50, monthly_payments: 3 }] } };
    const lines = paymentTermsText(withPlan);
    expect(lines[0]).toBe('Anticipo: 50% ($10,440.00), en 3 mensualidades de $3,480.00 por transferencia');
    expect(lines.join(' ')).toContain('sin intereses');
    expect(lines.join(' ')).not.toContain('meses sin intereses con bancos');
    expect(validateMilestones([{ label: 'A', pct: 100, monthly_payments: 30 }])).toMatch(/1 a 24/);
    expect(validateMilestones(withPlan.payment.milestones)).toBeNull();
    const html = renderContract({ ...withPlan, status: 'accepted', accepted_at: '2026-09-17T00:00:00Z', accepted_name: 'Ana Pérez' }, 'CON-2026-002');
    expect(html).toContain('pagadero en 3 mensualidades de $3,480.00 por transferencia bancaria');
    expect(html).toContain('suspender el servicio');
    expect(html).not.toContain('Ningún entregable se pone en producción ni se transfiere hasta recibir el pago del hito');
  });

  it('splits the milestones and the last one absorbs the rounding', () => {
    const h = milestoneAmounts(20880, [{ label: 'A', pct: 40 }, { label: 'B', pct: 30 }, { label: 'C', pct: 30 }]);
    expect(h.map((x) => x.amount)).toEqual([8352, 6264, 6264]);
    expect(h.reduce((s, x) => s + x.amount, 0)).toBe(20880);
    const uneven = milestoneAmounts(100.01, [{ label: 'A', pct: 33 }, { label: 'B', pct: 33 }, { label: 'C', pct: 34 }]);
    expect(uneven.reduce((s, x) => s + x.amount, 0)).toBeCloseTo(100.01, 2);
  });

  it('validates milestones and line items', () => {
    expect(validateMilestones([{ label: 'A', pct: 60 }, { label: 'B', pct: 50 }])).toMatch(/suman 110/);
    expect(validateMilestones([{ label: '', pct: 100 }])).toMatch(/nombre/);
    expect(validateMilestones(q.payment.milestones)).toBeNull();
    expect(validateItems([])).toMatch(/al menos/);
    expect(validateItems([{ name: 'x', quantity: 0, price: 1 }])).toMatch(/válidos/);
    expect(validateItems(q.items)).toBeNull();
  });

  it('single price and features', () => {
    const items = itemsFromPrice('Página web', 18000);
    expect(items).toEqual([{ name: 'Página web', quantity: 1, price: 18000 }]);
    expect(projectPrice({ items })).toBe(18000);
    expect(validateFeatures(['', '  '])).toMatch(/al menos/);
    expect(validateFeatures(['6 secciones'])).toBeNull();
    const html = renderContract({ ...q, items, features: ['6 secciones', 'Formulario de citas', '<script>'] }, 'CON-2026-009');
    expect(html).toContain('las siguientes 3 características');
    expect(html).toContain('<ol><li>6 secciones</li><li>Formulario de citas</li><li>&lt;script&gt;</li></ol>');
    expect(html).not.toContain('Sesión de fotos');
  });

  it('the delivery term runs from the quote to the deadline', () => {
    const withDeadline = { terms: { ...q.terms, deadline: '2026-10-12' }, created_at: '2026-09-14T18:00:00Z' };
    const p = deliveryTerm(withDeadline);
    expect(p).toMatchObject({ deadline: '2026-10-12', days: 28, weeks: 4 });
    expect(p.text).toBe('12 de octubre de 2026 (4 semanas a partir de la cotización)');
    // 30 days round up to 5 weeks; the minimum term is 1 week
    expect(deliveryTerm({ terms: { ...q.terms, deadline: '2026-10-14' }, created_at: '2026-09-14' }).weeks).toBe(5);
    expect(deliveryTerm({ terms: { ...q.terms, deadline: '2026-09-15' }, created_at: '2026-09-14' }).weeks).toBe(1);
    // Without a deadline (old quotes) delivery_weeks is counted from creation
    const without = deliveryTerm({ terms: { ...q.terms, deadline: null, delivery_weeks: 4 }, created_at: '2026-09-14T18:00:00Z' });
    expect(without.deadline).toBe('2026-10-12');
    const html = renderContract({ ...q, ...withDeadline }, 'CON-2026-010');
    expect(html).toContain('a más tardar el <strong>12 de octubre de 2026</strong>, es decir, en un plazo de 4 semanas');
  });

  it('consecutive numbers per year', () => {
    const today = new Date('2026-09-14T12:00:00Z');
    expect(nextNumber('COT', null, today)).toBe('COT-2026-001');
    expect(nextNumber('COT', 'COT-2026-009', today)).toBe('COT-2026-010');
    expect(nextNumber('COT', 'COT-2025-042', today)).toBe('COT-2026-001');
    expect(nextNumber('CON', 'basura', today)).toBe('CON-2026-001');
  });

  it('validity and acceptance', () => {
    expect(dateAfterDays(15, new Date('2026-09-14T12:00:00Z'))).toBe('2026-09-29');
    expect(isExpired(q, new Date('2026-09-30T23:00:00Z'))).toBe(false);
    expect(isExpired(q, new Date('2026-10-01T00:00:00Z'))).toBe(true);
    expect(notAcceptableReason(q, new Date('2026-09-20T00:00:00Z'))).toBeNull();
    expect(notAcceptableReason({ ...q, status: 'draft' })).toMatch(/no se ha enviado/);
    expect(notAcceptableReason({ ...q, status: 'accepted' }, new Date('2027-01-01'))).toMatch(/ya fue aceptada/);
    expect(notAcceptableReason(q, new Date('2026-10-05T00:00:00Z'))).toMatch(/venció el 30 de septiembre de 2026/);
  });

  it('describes payment terms with milestones, transfer discount, installments and plan', () => {
    const t = paymentTermsText(q);
    expect(t[0]).toBe('Anticipo: 50% ($10,440.00)');
    expect(t[1]).toBe('Liquidación: 50% ($10,440.00)');
    expect(t[2]).toBe('Pagando por transferencia bancaria, 5 % de descuento: $19,836.00 en total.');
    expect(t[3]).toMatch(/6 o 12 meses sin intereses/);
    // The cost of the term goes into the total: 7.5 % + VAT for 6 months, 12.5 % + VAT for 12.
    expect(t[3]).toContain('a 6 meses $22,696.56');
    expect(t[3]).toContain('a 12 meses $23,907.60');
    expect(t[4]).toContain('facturacion@imsoft.io');
    expect(paymentTermsText({ ...q, payment: { ...q.payment, card_installments: false, transfer_discount_pct: 0 } })).toHaveLength(3);
    const withPlan = paymentTermsText({ ...q, payment: { ...q.payment, plan: { months: 24, deposit_pct: 30, surcharge_pct: 40 } } });
    expect(withPlan[4]).toBe('Plan mensual a 24 meses: anticipo de $6,264.00 y 24 mensualidades de $957.00 ($29,232.00 en total), con hosting y soporte incluidos; el sistema opera en infraestructura de imSoft y el código se transfiere al cubrir la última mensualidad.');
  });

  it('each payment option carries its total and the client picks one', () => {
    const op = paymentOptions(q);
    expect(op.map((o) => o.key)).toEqual(['transfer', 'card', 'installments_6', 'installments_12']);
    expect(op[0].total).toBe(19836);
    expect(op[1].total).toBe(20880);
    expect(op[3].summary).toBe('12 pagos de $1,992.30; $23,907.60 en total');
    // Below the installments minimum, or without installments, only transfer and card.
    expect(paymentOptions({ ...q, items: [{ name: 'x', quantity: 1, price: 5000 }] }).map((o) => o.key)).toEqual(['transfer', 'card']);
    // A valid plan shows up; an invalid one does not.
    expect(paymentOptions({ ...q, payment: { ...q.payment, plan: { months: 24, deposit_pct: 30, surcharge_pct: 40 } } }).at(-1)?.key).toBe('plan');
    expect(paymentOptions({ ...q, payment: { ...q.payment, plan: { months: 2, deposit_pct: 30, surcharge_pct: 40 } } }).some((o) => o.key === 'plan')).toBe(false);
    expect(validatePlan({ months: 24, deposit_pct: 30, surcharge_pct: 40 })).toBeNull();
    expect(validatePlan({ months: 48, deposit_pct: 30, surcharge_pct: 40 })).toMatch(/6 a 36/);
    expect(isPaymentOptionKey('plan')).toBe(true);
    expect(isPaymentOptionKey('credito')).toBe(false);
    // The contract names the chosen option and, for the plan, its rules.
    const html = renderContract({ ...q, payment: { ...q.payment, plan: { months: 24, deposit_pct: 30, surcharge_pct: 40 } }, accepted_payment_option: 'plan' }, 'CON-2026-009');
    expect(html).toContain('El Cliente eligió como forma de pago: <strong>Plan mensual a 24 meses');
    expect(html).toContain('<strong>Plan de suscripción.</strong>');
    expect(html).toContain('no un crédito ni un financiamiento');
    expect(html).toContain('24 mensualidades consecutivas de $957.00');
    expect(renderContract({ ...q, accepted_payment_option: 'transfer' }, 'CON-2026-010')).toContain('El descuento por transferencia aplica');
    expect(renderContract(q, 'CON-2026-011')).not.toContain('El Cliente eligió');
  });

  it('the contract includes the parties, scope, payments and terms', () => {
    const html = renderContract(q, 'CON-2026-001', new Date('2026-09-14T18:00:00Z'));
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
    // Without a penalty the text changes
    expect(renderContract({ ...q, terms: { ...q.terms, daily_penalty: 0 } }, 'CON-2026-002')).not.toContain('por cada día hábil adicional');
    // Escapes the client's HTML
    expect(renderContract({ ...q, client_name: '<b>x</b>' }, 'CON-2026-003')).toContain('&lt;b&gt;x&lt;/b&gt;');
  });

  it('the contract has the acceptance, third-party, data, liability and assignment clauses', () => {
    const html = renderContract(q, 'CON-2026-004');
    const headings = [...html.matchAll(/<h2>([^<]+)<\/h2>/g)].map((m) => m[1]);
    expect(headings).toEqual([
      'Primera. Objeto', 'Segunda. Precio y forma de pago', 'Tercera. Plazo de entrega', 'Cuarta. Entrega y aceptación',
      'Quinta. Propiedad de los entregables', 'Sexta. Cambios de alcance', 'Séptima. Obligaciones del Cliente', 'Octava. Garantía y soporte',
      'Novena. Servicios de terceros y operación', 'Décima. Datos personales', 'Décima primera. Límite de responsabilidad',
      'Décima segunda. Confidencialidad', 'Décima tercera. Vigencia, terminación y cesión', 'Décima cuarta. Comunicaciones y aceptación',
      'Décima quinta. Jurisdicción',
    ]);
    expect(html).toContain(`${REVIEW_BUSINESS_DAYS} días hábiles para revisarla`);
    expect(html).toContain('se limita al monto efectivamente pagado');
    expect(html).toContain('Ley Federal de Protección de Datos Personales');
    expect(html).toContain('responsabilidad exclusiva del Cliente y de quien los firme');
    expect(html).toContain('Ninguna de las partes podrá ceder');
    // Cross-references point to the new numbering
    expect(html).toContain('conforme a las cláusulas Sexta y Séptima');
    const withMonthly = renderContract({ ...q, payment: { ...q.payment, milestones: q.payment.milestones.map((h) => ({ ...h, monthly_payments: 3 })) } }, 'CON-2026-005');
    expect(withMonthly).toContain('conforme a la cláusula Quinta, al quedar pagado el total');
  });
});
