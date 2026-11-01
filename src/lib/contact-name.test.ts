import { describe, it, expect } from 'vitest';
import { contactName } from './contact-name';

describe('contactName', () => {
  it('omits the last name when missing, without leaving "null" or spaces', () => {
    expect(contactName({ first_name: 'Omar', last_name: null })).toBe('Omar');
    expect(contactName({ first_name: 'Omar', last_name: '' })).toBe('Omar');
    expect(contactName({ first_name: 'Omar', last_name: 'Morales' })).toBe('Omar Morales');
    expect(contactName({ first_name: '  Ana ', last_name: ' Pérez ' })).toBe('Ana Pérez');
    expect(contactName({ first_name: null, last_name: 'Morales' })).toBe('Morales');
    expect(contactName(null)).toBe('');
  });
});
