import { describe, it, expect } from 'vitest';
import { limpiarGancho, promptGancho } from './outreach-ai';

describe('gancho con IA', () => {
  it('el prompt lleva los datos del prospecto y las reglas', () => {
    const p = promptGancho({ nombre: 'Omar', empresa: 'Proicomex', segmento: 'logistica', sitio: 'proicomex.com.mx', notas: null, cargo: 'Gerente' });
    expect(p).toContain('Empresa: Proicomex');
    expect(p).toContain('Omar, Gerente');
    expect(p).toContain('Sector: logistica');
    expect(p).toContain('sin datos inventados');
  });

  it('limpia comillas, exclamaciones y recorta a dos frases', () => {
    expect(limpiarGancho({ gancho: '"Hola!"' })).toBe('Hola.');
    expect(limpiarGancho({ gancho: 'Una. Dos. Tres. Cuatro.' })).toBe('Una. Dos.');
    expect(limpiarGancho(null)).toBe('');
  });
});
