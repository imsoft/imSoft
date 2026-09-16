import { describe, it, expect } from 'vitest';
import { ASSIST_TOOL, buildPrompt, normalizarOutput, validarInput } from './quote-assist';

describe('asistente de cotizacion', () => {
  it('valida y limpia la entrada', () => {
    expect(validarInput({})).toEqual({ ok: false, error: 'Pon primero el nombre del proyecto.' });
    const r = validarInput({ title: ' Web ', features: [' a ', '', 3, 'b'], precio: '18000', intro: '', clientCompany: 'ACME' });
    expect(r.ok && r.input).toEqual({ title: 'Web', intro: null, features: ['a', 'b'], precio: 18000, clientCompany: 'ACME', servicio: null, clienteRecurrente: false, descuentoActual: null });
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
    expect(schema.required).toEqual(['resumen', 'precio', 'descuento', 'caracteristicas', 'preguntas', 'riesgos']);
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
    expect(o.caracteristicas).toEqual([{ texto: 'Respaldos', motivo: 'b' }]);
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
});
