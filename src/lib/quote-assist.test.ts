import { describe, it, expect } from 'vitest';
import { ASSIST_TOOL, buildPrompt, comparablesDesdeQuotes, normalizarOutput, textoIguala, validarInput } from './quote-assist';

describe('asistente de cotizacion', () => {
  it('valida y limpia la entrada', () => {
    expect(validarInput({})).toEqual({ ok: false, error: 'Pon primero el nombre del proyecto.' });
    const r = validarInput({ title: ' Web ', features: [' a ', '', 3, 'b'], precio: '18000', intro: '', clientCompany: 'ACME' });
    expect(r.ok && r.input).toEqual({ title: 'Web', intro: null, features: ['a', 'b'], precio: 18000, clientCompany: 'ACME', servicio: null, clienteRecurrente: false, descuentoActual: null, quoteId: null });
  });

  it('el prompt lleva el proyecto, las caracteristicas numeradas y la referencia de precios', () => {
    const p = buildPrompt({ title: 'Página web', intro: 'Seis secciones', features: ['SEO', 'Formulario'], precio: 18000, clientCompany: 'Clínica', servicio: 'Páginas Web' });
    expect(p).toContain('Título: Página web');
    expect(p).toContain('1. SEO\n2. Formulario');
    expect(p).toContain('$18,000 MXN');
    expect(p).toContain('desde $15,000 MXN');
    expect(buildPrompt({ title: 'x', features: [], precio: 0 })).toContain('sin definir');
  });

  it('la herramienta exige todos los campos y no admite extras', () => {
    expect(ASSIST_TOOL.strict).toBe(true);
    const schema = ASSIST_TOOL.input_schema as { additionalProperties?: boolean; required?: string[] };
    expect(schema.additionalProperties).toBe(false);
    expect(schema.required).toEqual(['resumen', 'precio', 'descuento', 'caracteristicas', 'iguala', 'comparables_usados', 'preguntas', 'riesgos']);
  });

  it('normaliza la salida: centenas, listas recortadas y sin repetir lo incluido', () => {
    const o = normalizarOutput({
      resumen: ' ok ',
      precio: { min: 17450, max: 12000, comentario: 'x' },
      caracteristicas: [{ texto: 'SEO', motivo: 'a' }, { texto: 'Respaldos', motivo: 'b' }, { texto: '', motivo: '' }],
      preguntas: ['¿Tienen dominio?', '', 7],
      riesgos: Array(9).fill('r'),
    }, ['seo']);
    expect(o.resumen).toBe('ok');
    expect(o.precio).toEqual({ min: 17500, max: 17500, comentario: 'x' });
    expect(o.caracteristicas).toEqual([{ texto: 'Respaldos', motivo: 'b', precio_extra: 0, prioridad: 'recomendada' }]);
    expect(o.preguntas).toEqual(['¿Tienen dominio?']);
    expect(o.riesgos).toHaveLength(5);
    expect(normalizarOutput(null).precio).toEqual({ min: 0, max: 0, comentario: '' });
  });

  it('el descuento sugerido se limita a 20 % y se apaga si no conviene', () => {
    const si = normalizarOutput({ resumen: 'x', precio: { min: 1, max: 2, comentario: 'c' }, descuento: { conviene: true, pct: 35, motivo: 'Cliente recurrente', comentario: 'ok' }, caracteristicas: [], preguntas: [], riesgos: [] });
    expect(si.descuento).toEqual({ conviene: true, pct: 20, motivo: 'Cliente recurrente', comentario: 'ok' });
    const no = normalizarOutput({ resumen: 'x', precio: { min: 1, max: 2, comentario: 'c' }, descuento: { conviene: false, pct: 10, motivo: '', comentario: 'va bajo' }, caracteristicas: [], preguntas: [], riesgos: [] });
    expect(no.descuento).toEqual({ conviene: false, pct: 0, motivo: '', comentario: 'va bajo' });
    expect(buildPrompt({ title: 'Web', features: [], precio: 0, clienteRecurrente: true, descuentoActual: { motivo: 'Referido', tipo: 'pct', valor: 5 } })).toContain('5 % por "Referido"');
  });

  it('arma comparables: sin borradores ni la cotizacion actual, precio con descuento, cerradas primero', () => {
    const row = (id: string, status: string, precio: number, created_at: string, extra = {}) => ({ id, folio: `COT-${id}`, status, title: `Proyecto ${id}`, items: [{ concepto: 'x', cantidad: 1, precio }], features: ['SEO', ' ', 'Blog'], created_at, ...extra });
    const cs = comparablesDesdeQuotes([
      row('1', 'sent', 40000, '2026-10-01T00:00:00Z'),
      row('2', 'accepted', 50000, '2026-08-01T00:00:00Z', { discount: { motivo: 'Referido', tipo: 'pct', valor: 10 } }),
      row('3', 'draft', 30000, '2026-10-10T00:00:00Z'),
      row('4', 'rejected', 90000, '2026-09-01T00:00:00Z'),
      row('5', 'accepted', 0, '2026-09-02T00:00:00Z'),
      row('6', 'accepted', 70000, '2026-10-20T00:00:00Z'),
    ], '6');
    expect(cs.map((c) => c.folio)).toEqual(['COT-4', 'COT-2', 'COT-1']);
    expect(cs[1]).toEqual({ folio: 'COT-2', title: 'Proyecto 2', status: 'accepted', precio: 45000, features: ['SEO', 'Blog'], fecha: '2026-08-01' });
    expect(comparablesDesdeQuotes([row('1', 'sent', 1, '2026-01-01'), row('2', 'sent', 1, '2026-01-02')], null, 1)).toHaveLength(1);
  });

  it('el prompt lleva los comparables con su resultado, o avisa que no hay', () => {
    const p = buildPrompt({ title: 'App', features: [], precio: 0, comparables: [{ folio: 'COT-7', title: 'Portal', status: 'accepted', precio: 65000, features: ['Login'], fecha: '2026-09-01' }] });
    expect(p).toContain('- COT-7 (2026-09-01, ACEPTADA): "Portal", $65,000 MXN sin IVA; incluye: Login');
    expect(p).toContain('iguala mensual');
    expect(buildPrompt({ title: 'App', features: [], precio: 0 })).toContain('todavía no hay cotizaciones enviadas');
  });

  it('normaliza extras con costo y prioridad, la iguala y los folios usados', () => {
    const o = normalizarOutput({
      resumen: 'x', precio: { min: 30000, max: 40000, comentario: 'c' }, descuento: null, preguntas: [], riesgos: [],
      caracteristicas: [
        { texto: 'Blog', motivo: 'm', precio_extra: 4950, prioridad: 'opcional' },
        { texto: 'Respaldos', motivo: 'm', precio_extra: -10, prioridad: 'esencial' },
        { texto: 'Chat', motivo: 'm', precio_extra: 8000, prioridad: 'urgente' },
      ],
      iguala: { mensual: 2549, incluye: ['Hosting', '', 'Respaldos'], comentario: 'ok' },
      comparables_usados: ['COT-1', 'COT-1', 'COT-99'],
    }, [], ['COT-1', 'COT-2']);
    expect(o.caracteristicas).toEqual([
      { texto: 'Respaldos', motivo: 'm', precio_extra: 0, prioridad: 'esencial' },
      { texto: 'Chat', motivo: 'm', precio_extra: 8000, prioridad: 'recomendada' },
      { texto: 'Blog', motivo: 'm', precio_extra: 5000, prioridad: 'opcional' },
    ]);
    expect(o.iguala).toEqual({ mensual: 2500, incluye: ['Hosting', 'Respaldos'], comentario: 'ok' });
    expect(o.comparables_usados).toEqual(['COT-1']);
    expect(normalizarOutput({ iguala: { mensual: 0, incluye: [], comentario: '' } }).iguala).toBeNull();
  });

  it('redacta la iguala para las notas del cliente', () => {
    expect(textoIguala({ mensual: 2500, incluye: ['Hosting', 'Respaldos'], comentario: '' })).toBe('Mantenimiento opcional después del primer mes: iguala de $2,500 MXN + IVA al mes. Incluye: Hosting; Respaldos.');
    expect(textoIguala({ mensual: 1500, incluye: [], comentario: '' })).toBe('Mantenimiento opcional después del primer mes: iguala de $1,500 MXN + IVA al mes.');
  });
});
