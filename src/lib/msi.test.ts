import { describe, it, expect } from 'vitest';
import { MSI_MINIMO_MXN, formatoPesos, montoDesde, msiEtiqueta } from './msi';

describe('meses sin intereses', () => {
  it('calcula la mensualidad redondeando hacia arriba', () => {
    expect(msiEtiqueta(15000, 6)).toBe('o 6 pagos de $2,500 sin intereses');
    expect(msiEtiqueta(60000, 12)).toBe('o 12 pagos de $5,000 sin intereses');
    expect(msiEtiqueta(20000, 3)).toBe('o 3 pagos de $6,667 sin intereses');
  });

  it('no anuncia MSI por debajo del minimo ni con montos invalidos', () => {
    expect(msiEtiqueta(MSI_MINIMO_MXN - 1)).toBeNull();
    expect(msiEtiqueta(NaN)).toBeNull();
  });

  it('tiene version en ingles', () => {
    expect(msiEtiqueta(15000, 6, 'en')).toBe('or 6 interest-free payments of $2,500 MXN');
  });

  it('lee el monto de los precios "Desde"', () => {
    expect(montoDesde('Desde $15,000 MXN')).toBe(15000);
    expect(montoDesde('From $800 USD')).toBe(800);
    expect(montoDesde('a convenir')).toBeNull();
  });

  it('formatea en pesos sin decimales', () => {
    expect(formatoPesos(2500)).toBe('$2,500');
  });
});
