import { describe, it, expect } from 'vitest';
import { ganchoDesdeNotas, limpiarGancho, promptGancho } from './outreach-ai';

describe('gancho con IA', () => {
  it('el prompt lleva los datos del prospecto y las reglas', () => {
    const p = promptGancho({ nombre: 'Omar', empresa: 'Proicomex', segmento: 'logistica', sitio: 'proicomex.com.mx', notas: null, cargo: 'Gerente' });
    expect(p).toContain('Empresa: Proicomex');
    expect(p).toContain('Omar, Gerente');
    expect(p).toContain('Sector: logistica');
    expect(p).toContain('sin datos inventados');
    expect(p).toContain('No menciones a imSoft, JTP Logistics');
  });

  it('limpia comillas, exclamaciones y recorta a dos frases', () => {
    expect(limpiarGancho({ gancho: '"Hola!"' })).toBe('Hola.');
    expect(limpiarGancho({ gancho: 'Una. Dos. Tres. Cuatro.' })).toBe('Una. Dos.');
    expect(limpiarGancho(null)).toBe('');
  });

  it('solo usa las notas como gancho si son un gancho y no un correo entero', () => {
    expect(ganchoDesdeNotas('Sus clientes llaman a preguntar dónde va la carga.')).toBe('Sus clientes llaman a preguntar dónde va la carga.');
    expect(ganchoDesdeNotas('Asunto: ¿Cuántas veces...?\n\nHola Alejandra:\n\nSoy Brandon...')).toBeNull();
    expect(ganchoDesdeNotas('Hola Mario:\n\nSoy Brandon')).toBeNull();
    expect(ganchoDesdeNotas('Agenda aquí https://wa.me/1')).toBeNull();
    expect(ganchoDesdeNotas('x'.repeat(400))).toBeNull();
    expect(ganchoDesdeNotas(null)).toBeNull();
  });

  it('para empresas grandes el prompt cambia el tipo de problema', () => {
    const p = promptGancho({ nombre: 'Laura', empresa: 'Grupo Dalton', segmento: 'corporativo', sitio: null, notas: null, cargo: null });
    expect(p).toContain('Si el sector es "corporativo"');
    expect(p).toContain('No supongas que les falta tecnología');
  });
});
