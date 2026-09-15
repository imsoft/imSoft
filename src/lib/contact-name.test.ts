import { describe, it, expect } from 'vitest';
import { contactName } from './contact-name';

describe('contactName', () => {
  it('omite el apellido cuando no existe, sin dejar "null" ni espacios', () => {
    expect(contactName({ first_name: 'Omar', last_name: null })).toBe('Omar');
    expect(contactName({ first_name: 'Omar', last_name: '' })).toBe('Omar');
    expect(contactName({ first_name: 'Omar', last_name: 'Morales' })).toBe('Omar Morales');
    expect(contactName({ first_name: '  Ana ', last_name: ' Pérez ' })).toBe('Ana Pérez');
    expect(contactName({ first_name: null, last_name: 'Morales' })).toBe('Morales');
    expect(contactName(null)).toBe('');
  });
});
