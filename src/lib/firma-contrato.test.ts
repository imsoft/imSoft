import { describe, it, expect } from 'vitest';
import { FIRMA_MAX_BYTES, huellaCorta, motivoFirmaInvalida } from './firma-contrato';
import { huellaContrato } from './huella-contrato';

const png = 'data:image/png;base64,iVBORw0KGgo' + 'A'.repeat(400) + '==';

describe('huellaContrato', () => {
  it('es SHA-256 determinista y cambia con cualquier edición', () => {
    const h = huellaContrato('<p>Hola</p>');
    expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(huellaContrato('<p>Hola</p>')).toBe(h);
    expect(huellaContrato('<p>Hola.</p>')).not.toBe(h);
  });

  it('la huella corta agrupa de cuatro en cuatro', () => {
    expect(huellaCorta('0123456789abcdef0000')).toBe('0123 4567 89ab cdef');
  });
});

describe('motivoFirmaInvalida', () => {
  it('acepta un PNG en data URL de tamaño razonable', () => {
    expect(motivoFirmaInvalida(png)).toBeNull();
  });

  it('rechaza vacío, otros formatos, base64 roto, trazos vacíos y archivos enormes', () => {
    expect(motivoFirmaInvalida(undefined)).toMatch(/Dibuja tu firma/);
    expect(motivoFirmaInvalida('')).toMatch(/Dibuja tu firma/);
    expect(motivoFirmaInvalida('data:image/jpeg;base64,' + 'A'.repeat(400))).toMatch(/formato/);
    expect(motivoFirmaInvalida('data:image/png;base64,iVBORw0KGgo' + 'A'.repeat(400) + '<script>')).toMatch(/formato/);
    expect(motivoFirmaInvalida('data:image/png;base64,' + 'A'.repeat(400))).toMatch(/formato/);
    expect(motivoFirmaInvalida('data:image/png;base64,iVBORw0KGgoAAA')).toMatch(/vacía/);
    expect(motivoFirmaInvalida('data:image/png;base64,iVBORw0KGgo' + 'A'.repeat(FIRMA_MAX_BYTES))).toMatch(/demasiado grande/);
  });
});
