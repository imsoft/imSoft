import { describe, expect, it } from 'vitest'
import { companyForApp, validateCompanyName } from './company'
import { legacyCompany } from './legacy'

describe('company from the app', () => {
  it('validates the name', () => {
    expect(validateCompanyName(' ')).toMatch(/nombre/)
    expect(validateCompanyName('x'.repeat(121))).toMatch(/muy largo/)
    expect(validateCompanyName('Valuadores de los Altos')).toBeNull()
  })
  it('summarizes the row, with the Spanish shape for published apps', () => {
    const c = companyForApp({ id: 'e1', name: 'Acme', logo_url: ' ' })
    expect(c).toEqual({ id: 'e1', name: 'Acme', logo: null })
    expect(legacyCompany(c)).toEqual({ id: 'e1', nombre: 'Acme', logo: null })
    expect(legacyCompany(null)).toBeNull()
  })
})
