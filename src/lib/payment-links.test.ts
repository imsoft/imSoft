import { describe, it, expect } from 'vitest';
import { etiquetaSugerida, hitoSugerido, notasEnlace, saldoPendiente, urlDeNotas, validarMontoEnlace } from './payment-links';

const c = (amount: number) => ({ amount, status: 'completed' as const });
const p = (amount: number) => ({ amount, status: 'pending' as const });
const x = (amount: number) => ({ amount, status: 'cancelled' as const });

describe('cobro por hitos', () => {
  it('el saldo descuenta lo cobrado y lo ya enlazado, no lo cancelado', () => {
    expect(saldoPendiente(18000, [])).toBe(18000);
    expect(saldoPendiente(18000, [c(9000)])).toBe(9000);
    expect(saldoPendiente(18000, [c(9000), p(4500), x(9000)])).toBe(4500);
    expect(saldoPendiente(18000, [c(20000)])).toBe(0);
  });

  it('sugiere la mitad como anticipo y despues el resto', () => {
    expect(hitoSugerido(18000, [])).toBe(9000);
    expect(hitoSugerido(18000, [c(9000)])).toBe(9000);
    expect(hitoSugerido(18000, [c(9000), p(4500)])).toBe(4500);
    expect(etiquetaSugerida([], 'es')).toBe('Anticipo (50%)');
    expect(etiquetaSugerida([c(1)], 'es')).toBe('Liquidación');
    expect(etiquetaSugerida([], 'en')).toBe('Deposit (50%)');
  });

  it('rechaza montos invalidos o mayores al saldo', () => {
    expect(validarMontoEnlace(0, 18000, [])).toMatch(/mayor a cero/);
    expect(validarMontoEnlace(9001, 18000, [c(9000)])).toMatch(/supera/);
    expect(validarMontoEnlace(9000, 18000, [c(9000)])).toBeNull();
  });

  it('guarda y recupera la URL del enlace en las notas del pago', () => {
    const notas = notasEnlace(' Anticipo (50%) ', 'https://buy.stripe.com/abc123');
    expect(notas).toBe('Anticipo (50%) · Enlace Stripe: https://buy.stripe.com/abc123');
    expect(urlDeNotas(notas)).toBe('https://buy.stripe.com/abc123');
    expect(urlDeNotas('Transferencia BBVA')).toBeNull();
    expect(urlDeNotas(null)).toBeNull();
  });
});
