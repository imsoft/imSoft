import { describe, it, expect } from 'vitest';
import { fichaDeNotas, ganchoDesdeNotas, limpiarApertura, limpiarGancho, notasSinFicha, preguntaPorDefecto, promptApertura, promptGancho } from './outreach-ai';

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
    // La ficha de Google que guarda el buscador no es un gancho.
    const notas = 'Google Maps: 4.8 estrellas (198 reseñas) · Clínica dental · Av. Cruz del Sur 3973, Guadalajara';
    expect(ganchoDesdeNotas(notas)).toBeNull();
    expect(fichaDeNotas(notas)).toBe(notas);
    expect(ganchoDesdeNotas(`Sus pacientes cancelan por WhatsApp.\n${notas}`)).toBe('Sus pacientes cancelan por WhatsApp.');
    expect(notasSinFicha(`${notas}\nHablé con el dueño`)).toBe('Hablé con el dueño');
  });

  it('con oferta de app propia el gancho habla del cliente final, no del Excel', () => {
    const p = promptGancho({ nombre: '', empresa: 'Tukafe', segmento: null, sitio: null, notas: null, cargo: null, oferta: 'app' });
    expect(p).toContain('su propia app para sus clientes');
    expect(p).toContain('No hables de Excel');
    // Sin oferta, esa regla no aparece.
    expect(promptGancho({ nombre: '', empresa: 'X', segmento: null, sitio: null, notas: null, cargo: null })).not.toContain('su propia app');
    // Mayorista: el pedido del cliente de tienda; joyería: cómo vende hoy, para su tienda en línea.
    const m = promptGancho({ nombre: '', empresa: 'Fruvecas', segmento: 'abastos', sitio: null, notas: null, cargo: null, oferta: 'app' });
    expect(m).toContain('mayorista');
    expect(m).not.toContain('juntar puntos');
    const j = promptGancho({ nombre: '', empresa: 'Malka', segmento: 'joyeria', sitio: null, notas: null, cargo: null, oferta: 'tienda' });
    expect(j).toContain('joyería');
    expect(j).toContain('tienda en línea');
  });

  it('para agro el gancho va del campo y la bodega', () => {
    const p = promptGancho({ nombre: '', empresa: 'Agrofresh', segmento: 'agro', sitio: null, notas: null, cargo: null });
    expect(p).toContain('Si el sector es "agro"');
    expect(p).toContain('trazabilidad');
  });

  it('la apertura de redes pide observación real, pregunta corta, usted y nada de venta', () => {
    const p = promptApertura({ empresa: 'Clínica Dental Díaz', segmento: 'dental', datos: 'Google Maps: 4.8 estrellas (198 reseñas) · Clínica dental', notas: null });
    expect(p).toContain('4.8 estrellas (198 reseñas)');
    expect(p).toContain('Empieza con "Hola, vi que"');
    expect(p).toContain('Trato de usted');
    expect(p).toContain('sin proponer llamada');
    expect(p).toContain('agenda y confirmaciones');
    expect(promptApertura({ empresa: 'Fruvecas', segmento: 'abastos', oferta: 'app' })).toContain('clientes de tienda y ruta');
    expect(promptApertura({ empresa: 'Malka', segmento: 'joyeria', oferta: 'tienda' })).toContain('piezas por foto');
    // La apertura no se recorta a dos frases (la pregunta suele ser la tercera) y hay pregunta de respaldo por giro.
    expect(limpiarApertura({ gancho: '"Hola, vi que están en Av. Hidalgo. Una duda: ¿las citas las confirman a mano o ya tienen algo?"' })).toBe('Hola, vi que están en Av. Hidalgo. Una duda: ¿las citas las confirman a mano o ya tienen algo?');
    expect(preguntaPorDefecto('ferreteria')).toMatch(/cotizaciones/);
    expect(preguntaPorDefecto('restaurantes', 'app')).toMatch(/clientes frecuentes/);
  });

  it('para empresas grandes el prompt cambia el tipo de problema', () => {
    const p = promptGancho({ nombre: 'Laura', empresa: 'Grupo Dalton', segmento: 'corporativo', sitio: null, notas: null, cargo: null });
    expect(p).toContain('Si el sector es "corporativo"');
    expect(p).toContain('No supongas que les falta tecnología');
  });
});
