import { describe, it, expect } from 'vitest';
import { calcular, calcularHito, precioParaNeto, tasaResico, type Config } from './simulador-cobros';

const base: Config = { precio: 18000, metodo: '6', hitos: '2', cobraIva: true, clientePersonaMoral: false, ingresoMensual: 40000, ivaSobreComision: false };

describe('simulador de cobros', () => {
  it('reproduce el desglose de Stripe para $3,000 a 6 meses', () => {
    // Stripe Dashboard (14-sep-2026): recibirías MXN 2,664.00 sobre 3,000 a 6 MSI.
    const h = calcularHito(3000, { ...base, cobraIva: false }, '6');
    expect(h.fee).toBeCloseTo(336, 2);
    expect(h.cae).toBeCloseTo(2664, 2);
    expect(h.mensualidad).toBeCloseTo(500, 2);
  });

  it('proyecto de $18,000 en dos hitos a 6 MSI', () => {
    const r = calcular(base);
    expect(r.cobro).toBeCloseTo(20880, 2);
    expect(r.partes[0].fee).toBeCloseTo(10440 * 0.111 + 3, 2);
    expect(r.fee).toBeCloseTo(2 * (10440 * 0.111 + 3), 2);
    expect(r.tasa).toBe(0.011);
    expect(r.isr).toBeCloseTo(198, 2);
    expect(r.neto).toBeCloseTo(18000 - r.fee - 198, 2);
    expect(r.ivaEnterar).toBeCloseTo(2880, 2);
  });

  it('la transferencia no tiene comision y la persona moral retiene', () => {
    const r = calcular({ ...base, metodo: 'transfer', clientePersonaMoral: true });
    expect(r.fee).toBe(0);
    expect(r.retISR).toBeCloseTo(225, 2);
    expect(r.retIVA).toBeCloseTo(1920, 2);
    expect(r.cae).toBeCloseTo(20880 - 225 - 1920, 2);
    expect(r.isrPagar).toBe(0); // 198 de ISR menos 225 retenidos
    expect(r.ivaEnterar).toBeCloseTo(960, 2);
  });

  it('con tarjeta la persona moral no retiene', () => {
    const r = calcular({ ...base, clientePersonaMoral: true });
    expect(r.retISR).toBe(0);
    expect(r.retIVA).toBe(0);
  });

  it('tramos RESICO', () => {
    expect(tasaResico(25000)).toBe(0.01);
    expect(tasaResico(25001)).toBe(0.011);
    expect(tasaResico(83333)).toBe(0.015);
    expect(tasaResico(200000)).toBe(0.02);
    expect(tasaResico(999999)).toBe(0.025);
  });

  it('el inverso devuelve un precio que de verdad deja el neto pedido', () => {
    const precio = precioParaNeto(18000, base);
    expect(precio).toBe(20700);
    const r = calcular({ ...base, precio });
    expect(r.cobro - r.fee - r.iva).toBeGreaterThanOrEqual(18000);
    expect(precioParaNeto(18000, { ...base, metodo: 'transfer' })).toBe(18000);
  });

  it('el IVA sobre la comision de Stripe la sube un 16 %', () => {
    const sin = calcularHito(10000, base, 'card').fee;
    const con = calcularHito(10000, { ...base, ivaSobreComision: true }, 'card').fee;
    expect(con).toBeCloseTo(sin * 1.16, 2);
  });
});
