import { describe, it, expect } from 'vitest';
import { INSTALLMENTS_MIN_MXN, amountFromPrice, formatPesos, installmentsLabel } from './installments';

describe('interest-free installments', () => {
  it('computes the monthly payment rounding up', () => {
    expect(installmentsLabel(15000, 6)).toBe('o 6 pagos de $2,500 sin intereses');
    expect(installmentsLabel(60000, 12)).toBe('o 12 pagos de $5,000 sin intereses');
    expect(installmentsLabel(20000, 3)).toBe('o 3 pagos de $6,667 sin intereses');
  });

  it('does not advertise installments below the minimum or with invalid amounts', () => {
    expect(installmentsLabel(INSTALLMENTS_MIN_MXN - 1)).toBeNull();
    expect(installmentsLabel(NaN)).toBeNull();
  });

  it('has an English version', () => {
    expect(installmentsLabel(15000, 6, 'en')).toBe('or 6 interest-free payments of $2,500 MXN');
  });

  it('reads the amount from "Desde" prices', () => {
    expect(amountFromPrice('Desde $15,000 MXN')).toBe(15000);
    expect(amountFromPrice('From $800 USD')).toBe(800);
    expect(amountFromPrice('a convenir')).toBeNull();
  });

  it('formats in pesos without decimals', () => {
    expect(formatPesos(2500)).toBe('$2,500');
  });
});
