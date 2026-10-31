import { describe, it, expect } from 'vitest';
import { computeMilestone, configFromStorage, priceForNet, resicoRate, simulate, type Config } from './fee-simulator';

const base: Config = { price: 18000, method: '6', milestones: '2', chargeVat: true, corporateClient: false, monthlyIncome: 40000, vatOnFee: false };

describe('fee simulator', () => {
  it('matches the Stripe breakdown for $3,000 at 6 months', () => {
    // Stripe Dashboard (2026-09-14): you would receive MXN 2,664.00 on 3,000 at 6 months.
    const h = computeMilestone(3000, { ...base, chargeVat: false }, '6');
    expect(h.fee).toBeCloseTo(336, 2);
    expect(h.received).toBeCloseTo(2664, 2);
    expect(h.monthlyPayment).toBeCloseTo(500, 2);
  });

  it('$18,000 project in two milestones at 6 months', () => {
    const r = simulate(base);
    expect(r.charge).toBeCloseTo(20880, 2);
    expect(r.parts[0].fee).toBeCloseTo(10440 * 0.111 + 3, 2);
    expect(r.fee).toBeCloseTo(2 * (10440 * 0.111 + 3), 2);
    expect(r.rate).toBe(0.011);
    expect(r.isr).toBeCloseTo(198, 2);
    expect(r.net).toBeCloseTo(18000 - r.fee - 198, 2);
    expect(r.vatDue).toBeCloseTo(2880, 2);
  });

  it('a transfer has no fee and a corporate client withholds', () => {
    const r = simulate({ ...base, method: 'transfer', corporateClient: true });
    expect(r.fee).toBe(0);
    expect(r.withheldIsr).toBeCloseTo(225, 2);
    expect(r.withheldVat).toBeCloseTo(1920, 2);
    expect(r.received).toBeCloseTo(20880 - 225 - 1920, 2);
    expect(r.isrDue).toBe(0); // 198 of ISR minus 225 withheld
    expect(r.vatDue).toBeCloseTo(960, 2);
  });

  it('with a card a corporate client withholds nothing', () => {
    const r = simulate({ ...base, corporateClient: true });
    expect(r.withheldIsr).toBe(0);
    expect(r.withheldVat).toBe(0);
  });

  it('RESICO brackets', () => {
    expect(resicoRate(25000)).toBe(0.01);
    expect(resicoRate(25001)).toBe(0.011);
    expect(resicoRate(83333)).toBe(0.015);
    expect(resicoRate(200000)).toBe(0.02);
    expect(resicoRate(999999)).toBe(0.025);
  });

  it('the inverse returns a price that really leaves the requested net', () => {
    const price = priceForNet(18000, base);
    expect(price).toBe(20700);
    const r = simulate({ ...base, price });
    expect(r.charge - r.fee - r.vat).toBeGreaterThanOrEqual(18000);
    expect(priceForNet(18000, { ...base, method: 'transfer' })).toBe(18000);
  });

  it('VAT on the Stripe fee raises it by 16 %', () => {
    const without = computeMilestone(10000, base, 'card').fee;
    const withVat = computeMilestone(10000, { ...base, vatOnFee: true }, 'card').fee;
    expect(withVat).toBeCloseTo(without * 1.16, 2);
  });

  it('restores saved settings with current or legacy Spanish keys', () => {
    expect(configFromStorage({ price: 50000, method: 'card' }, base)).toEqual({ ...base, price: 50000, method: 'card' });
    const legacy = { precio: 30000, metodo: '12', hitos: '3', cobraIva: false, clientePersonaMoral: true, ingresoMensual: 90000, ivaSobreComision: true };
    expect(configFromStorage(legacy, base)).toEqual({ price: 30000, method: '12', milestones: '3', chargeVat: false, corporateClient: true, monthlyIncome: 90000, vatOnFee: true });
    expect(configFromStorage({ junk: 1, price: 'x' }, base)).toEqual(base);
    expect(configFromStorage(null, base)).toEqual(base);
  });
});
