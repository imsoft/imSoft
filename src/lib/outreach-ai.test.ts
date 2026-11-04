import { describe, it, expect } from 'vitest';
import { listingFromNotes, hookFromNotes, cleanOpener, cleanHook, notesWithoutListing, defaultQuestion, openerPrompt, hookPrompt } from './outreach-ai';

describe('AI hook', () => {
  it("the prompt carries the prospect's data and the rules", () => {
    const p = hookPrompt({ name: 'Omar', company: 'Proicomex', segment: 'logistics', website: 'proicomex.com.mx', notes: null, jobTitle: 'Gerente' });
    expect(p).toContain('Empresa: Proicomex');
    expect(p).toContain('Omar, Gerente');
    expect(p).toContain('Sector: logistics');
    expect(p).toContain('sin datos inventados');
    expect(p).toContain('No menciones a imSoft, JTP Logistics');
  });

  it('strips quotes and exclamation marks and trims to two sentences', () => {
    expect(cleanHook({ hook: '"Hola!"' })).toBe('Hola.');
    expect(cleanHook({ hook: 'Una. Dos. Tres. Cuatro.' })).toBe('Una. Dos.');
    expect(cleanHook(null)).toBe('');
  });

  it('only uses the notes as a hook if they are a hook and not a whole email', () => {
    expect(hookFromNotes('Sus clientes llaman a preguntar dónde va la carga.')).toBe('Sus clientes llaman a preguntar dónde va la carga.');
    expect(hookFromNotes('Asunto: ¿Cuántas veces...?\n\nHola Alejandra:\n\nSoy Brandon...')).toBeNull();
    expect(hookFromNotes('Hola Mario:\n\nSoy Brandon')).toBeNull();
    expect(hookFromNotes('Agenda aquí https://wa.me/1')).toBeNull();
    expect(hookFromNotes('x'.repeat(400))).toBeNull();
    expect(hookFromNotes(null)).toBeNull();
    // The Google listing the prospect search stores is not a hook.
    const notes = 'Google Maps: 4.8 estrellas (198 reseñas) · Clínica dental · Av. Cruz del Sur 3973, Guadalajara';
    expect(hookFromNotes(notes)).toBeNull();
    expect(listingFromNotes(notes)).toBe(notes);
    expect(hookFromNotes(`Sus pacientes cancelan por WhatsApp.\n${notes}`)).toBe('Sus pacientes cancelan por WhatsApp.');
    expect(notesWithoutListing(`${notes}\nHablé con el dueño`)).toBe('Hablé con el dueño');
  });

  it('with an own-app offer the hook talks about the end customer, not Excel', () => {
    const p = hookPrompt({ name: '', company: 'Tukafe', segment: null, website: null, notes: null, jobTitle: null, offer: 'app' });
    expect(p).toContain('su propia app para sus clientes');
    expect(p).toContain('No hables de Excel');
    // Without an offer, that rule doesn't appear.
    expect(hookPrompt({ name: '', company: 'X', segment: null, website: null, notes: null, jobTitle: null })).not.toContain('su propia app');
    // Wholesaler: the store customer's order; jewelry: how it sells today, for its online store.
    const m = hookPrompt({ name: '', company: 'Fruvecas', segment: 'wholesale-market', website: null, notes: null, jobTitle: null, offer: 'app' });
    expect(m).toContain('mayorista');
    expect(m).not.toContain('juntar puntos');
    const j = hookPrompt({ name: '', company: 'Malka', segment: 'jewelry', website: null, notes: null, jobTitle: null, offer: 'store' });
    expect(j).toContain('joyería');
    expect(j).toContain('tienda en línea');
  });

  it('for agro the hook is about the field and the warehouse', () => {
    const p = hookPrompt({ name: '', company: 'Agrofresh', segment: 'agro', website: null, notes: null, jobTitle: null });
    expect(p).toContain('Si el sector es "agro"');
    expect(p).toContain('trazabilidad');
  });

  it('the social opener asks for a real observation, a short question, formal you and no selling', () => {
    const p = openerPrompt({ company: 'Clínica Dental Díaz', segment: 'dental', data: 'Google Maps: 4.8 estrellas (198 reseñas) · Clínica dental', notes: null });
    expect(p).toContain('4.8 estrellas (198 reseñas)');
    expect(p).toContain('Empieza con "Hola, vi que"');
    expect(p).toContain('Trato de usted');
    expect(p).toContain('sin proponer llamada');
    expect(p).toContain('agenda y confirmaciones');
    expect(openerPrompt({ company: 'Fruvecas', segment: 'wholesale-market', offer: 'app' })).toContain('clientes de tienda y ruta');
    expect(openerPrompt({ company: 'Malka', segment: 'jewelry', offer: 'store' })).toContain('piezas por foto');
    // The opener isn't trimmed to two sentences (the question is often the third) and there's a fallback question per industry.
    expect(cleanOpener('Hola, vi que tienen 4.3 en Google. Una duda: los pedidos les entran por WhatsApp o por apps de reparto?')).toBe('Hola, vi que tienen 4.3 en Google. Una duda: ¿los pedidos les entran por WhatsApp o por apps de reparto?')
    expect(cleanOpener('Hola, vi que tienen 40 reseñas en Los Eucaliptos; los pedidos les entran por WhatsApp o por apps?')).toBe('Hola, vi que tienen 40 reseñas en Los Eucaliptos. ¿Los pedidos les entran por WhatsApp o por apps?')
    expect(cleanOpener('Hola, vi que están en Tlajomulco. Una duda: las cotizaciones de obra, ¿las hacen en Excel?')).toBe('Hola, vi que están en Tlajomulco. Una duda: las cotizaciones de obra, ¿las hacen en Excel?')
    expect(cleanOpener({ hook: '"Hola, vi que están en Av. Hidalgo. Una duda: ¿las citas las confirman a mano o ya tienen algo?"' })).toBe('Hola, vi que están en Av. Hidalgo. Una duda: ¿las citas las confirman a mano o ya tienen algo?');
    expect(defaultQuestion('hardware-stores')).toMatch(/cotizaciones/);
    expect(defaultQuestion('restaurants', 'app')).toMatch(/clientes frecuentes/);
  });

  it('for large companies the prompt changes the kind of problem', () => {
    const p = hookPrompt({ name: 'Laura', company: 'Grupo Dalton', segment: 'corporate', website: null, notes: null, jobTitle: null });
    expect(p).toContain('Si el sector es "corporate"');
    expect(p).toContain('No supongas que les falta tecnología');
  });
});
