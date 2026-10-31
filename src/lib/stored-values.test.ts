import { describe, expect, it } from 'vitest'
import searches from '../../content/prospect-searches.json'
import { INDUSTRIES, industryByKey } from './places'
import { SOCIAL_DISCARD_REASONS, SOCIAL_DISCARDED_TAG, PREMIUM_ZONE_TAG } from './social-message'
import { INVALID_EMAIL_TAG } from './invalid-email'

// Values stored in the database (tags, segments, campaign, discard reasons) are English
// kebab-case; Spanish is only for what the user sees (migration 20261101).
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SPANISH = /(salud|escuela|construccion|restaurante|inmobiliaria|ferreteria|contabilidad|abogado|automotriz|corporativo|abastos|mayorista|granja|logistica|aduanal|joyeria|taller|clinica|otros|campana|correo|redes|zona|tienda)/

describe('stored values', () => {
  it('industry keys and segments are English kebab-case', () => {
    for (const g of INDUSTRIES) {
      for (const v of [g.key, g.segment]) {
        expect(v).toMatch(KEBAB)
        expect(v).not.toMatch(SPANISH)
      }
    }
  })

  it('every scheduled search points to a known industry', () => {
    for (const s of searches.searches) expect(industryByKey(s.industry), s.industry).not.toBeNull()
  })

  it('tags and discard reasons are English', () => {
    for (const v of [SOCIAL_DISCARDED_TAG, PREMIUM_ZONE_TAG, INVALID_EMAIL_TAG, ...Object.keys(SOCIAL_DISCARD_REASONS)]) {
      expect(v).toMatch(KEBAB)
      expect(v).not.toMatch(SPANISH)
    }
  })
})
