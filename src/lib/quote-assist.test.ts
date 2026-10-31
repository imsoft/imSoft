import { describe, it, expect } from 'vitest';
import { ASSIST_TOOL, buildPrompt, comparablesFromQuotes, normalizeOutput, retainerText, validateInput } from './quote-assist';

describe('quote assistant', () => {
  it('validates and cleans the input', () => {
    expect(validateInput({})).toEqual({ ok: false, error: 'Pon primero el nombre del proyecto.' });
    const r = validateInput({ title: ' Web ', features: [' a ', '', 3, 'b'], price: '18000', intro: '', clientCompany: 'ACME' });
    expect(r.ok && r.input).toEqual({ title: 'Web', intro: null, features: ['a', 'b'], price: 18000, clientCompany: 'ACME', service: null, returningClient: false, currentDiscount: null, quoteId: null });
  });

  it('the prompt carries the project, the numbered features and the price reference', () => {
    const p = buildPrompt({ title: 'Página web', intro: 'Seis secciones', features: ['SEO', 'Formulario'], price: 18000, clientCompany: 'Clínica', service: 'Páginas Web' });
    expect(p).toContain('Título: Página web');
    expect(p).toContain('1. SEO\n2. Formulario');
    expect(p).toContain('$18,000 MXN');
    expect(p).toContain('desde $15,000 MXN');
    expect(buildPrompt({ title: 'x', features: [], price: 0 })).toContain('sin definir');
  });

  it('the tool requires every field and allows no extras', () => {
    expect(ASSIST_TOOL.strict).toBe(true);
    const schema = ASSIST_TOOL.input_schema as { additionalProperties?: boolean; required?: string[] };
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(['summary', 'price', 'discount', 'features', 'retainer', 'comparables_used', 'questions', 'risks']);
  });

  it('normalizes the output: hundreds, trimmed lists and nothing already included', () => {
    const o = normalizeOutput({
      summary: ' ok ',
      price: { min: 17450, max: 12000, comment: 'x' },
      features: [{ text: 'SEO', reason: 'a' }, { text: 'Respaldos', reason: 'b' }, { text: '', reason: '' }],
      questions: ['¿Tienen dominio?', '', 7],
      risks: Array(9).fill('r'),
    }, ['seo']);
    expect(o.summary).toBe('ok');
    expect(o.price).toEqual({ min: 17500, max: 17500, comment: 'x' });
    expect(o.features).toEqual([{ text: 'Respaldos', reason: 'b', extra_price: 0, priority: 'recommended' }]);
    expect(o.questions).toEqual(['¿Tienen dominio?']);
    expect(o.risks).toHaveLength(5);
    expect(normalizeOutput(null).price).toEqual({ min: 0, max: 0, comment: '' });
  });

  it('the suggested discount is capped at 20 % and turned off when not advisable', () => {
    const yes = normalizeOutput({ summary: 'x', price: { min: 1, max: 2, comment: 'c' }, discount: { advisable: true, pct: 35, reason: 'Cliente recurrente', comment: 'ok' }, features: [], questions: [], risks: [] });
    expect(yes.discount).toEqual({ advisable: true, pct: 20, reason: 'Cliente recurrente', comment: 'ok' });
    const no = normalizeOutput({ summary: 'x', price: { min: 1, max: 2, comment: 'c' }, discount: { advisable: false, pct: 10, reason: '', comment: 'va bajo' }, features: [], questions: [], risks: [] });
    expect(no.discount).toEqual({ advisable: false, pct: 0, reason: '', comment: 'va bajo' });
    expect(buildPrompt({ title: 'Web', features: [], price: 0, returningClient: true, currentDiscount: { reason: 'Referido', type: 'pct', value: 5 } })).toContain('5 % por "Referido"');
  });

  it('builds comparables: no drafts or current quote, discounted price, closed ones first', () => {
    const row = (id: string, status: string, price: number, created_at: string, extra = {}) => ({ id, number: `COT-${id}`, status, title: `Proyecto ${id}`, items: [{ name: 'x', quantity: 1, price }], features: ['SEO', ' ', 'Blog'], created_at, ...extra });
    const cs = comparablesFromQuotes([
      row('1', 'sent', 40000, '2026-10-01T00:00:00Z'),
      row('2', 'accepted', 50000, '2026-08-01T00:00:00Z', { discount: { reason: 'Referido', type: 'pct', value: 10 } }),
      row('3', 'draft', 30000, '2026-10-10T00:00:00Z'),
      row('4', 'rejected', 90000, '2026-09-01T00:00:00Z'),
      row('5', 'accepted', 0, '2026-09-02T00:00:00Z'),
      row('6', 'accepted', 70000, '2026-10-20T00:00:00Z'),
    ], '6');
    expect(cs.map((c) => c.number)).toEqual(['COT-4', 'COT-2', 'COT-1']);
    expect(cs[1]).toEqual({ number: 'COT-2', title: 'Proyecto 2', status: 'accepted', price: 45000, features: ['SEO', 'Blog'], date: '2026-08-01' });
    expect(comparablesFromQuotes([row('1', 'sent', 1, '2026-01-01'), row('2', 'sent', 1, '2026-01-02')], null, 1)).toHaveLength(1);
  });

  it('the prompt carries the comparables with their outcome, or says there are none', () => {
    const p = buildPrompt({ title: 'App', features: [], price: 0, comparables: [{ number: 'COT-7', title: 'Portal', status: 'accepted', price: 65000, features: ['Login'], date: '2026-09-01' }] });
    expect(p).toContain('- COT-7 (2026-09-01, ACEPTADA): "Portal", $65,000 MXN sin IVA; incluye: Login');
    expect(p).toContain('iguala mensual');
    expect(buildPrompt({ title: 'App', features: [], price: 0 })).toContain('todavía no hay cotizaciones enviadas');
  });

  it('normalizes extras with cost and priority, the retainer and the numbers used', () => {
    const o = normalizeOutput({
      summary: 'x', price: { min: 30000, max: 40000, comment: 'c' }, discount: null, questions: [], risks: [],
      features: [
        { text: 'Blog', reason: 'm', extra_price: 4950, priority: 'optional' },
        { text: 'Respaldos', reason: 'm', extra_price: -10, priority: 'essential' },
        { text: 'Chat', reason: 'm', extra_price: 8000, priority: 'urgent' },
      ],
      retainer: { monthly: 2549, includes: ['Hosting', '', 'Respaldos'], comment: 'ok' },
      comparables_used: ['COT-1', 'COT-1', 'COT-99'],
    }, [], ['COT-1', 'COT-2']);
    expect(o.features).toEqual([
      { text: 'Respaldos', reason: 'm', extra_price: 0, priority: 'essential' },
      { text: 'Chat', reason: 'm', extra_price: 8000, priority: 'recommended' },
      { text: 'Blog', reason: 'm', extra_price: 5000, priority: 'optional' },
    ]);
    expect(o.retainer).toEqual({ monthly: 2500, includes: ['Hosting', 'Respaldos'], comment: 'ok' });
    expect(o.comparables_used).toEqual(['COT-1']);
    expect(normalizeOutput({ retainer: { monthly: 0, includes: [], comment: '' } }).retainer).toBeNull();
  });

  it('writes the retainer for the client notes', () => {
    expect(retainerText({ monthly: 2500, includes: ['Hosting', 'Respaldos'], comment: '' })).toBe('Mantenimiento opcional después del primer mes: iguala de $2,500 MXN + IVA al mes. Incluye: Hosting; Respaldos.');
    expect(retainerText({ monthly: 1500, includes: [], comment: '' })).toBe('Mantenimiento opcional después del primer mes: iguala de $1,500 MXN + IVA al mes.');
  });
});
