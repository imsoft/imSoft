import { describe, expect, it } from 'vitest'
import searches from '../../content/prospect-searches.json'
import { GIROS, giroDe } from './places'
import { MOTIVOS_DESCARTE_REDES, TAG_REDES_DESCARTADO, TAG_ZONA_PREMIUM } from './mensaje-red'
import { TAG_CORREO_INVALIDO } from './correo-invalido'

// Values stored in the database (tags, segments, campaign, discard reasons) are English
// kebab-case; Spanish is only for what the user sees (migration 20261101).
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SPANISH = /(salud|escuela|construccion|restaurante|inmobiliaria|ferreteria|contabilidad|abogado|automotriz|corporativo|abastos|mayorista|granja|logistica|aduanal|joyeria|taller|clinica|otros|campana|correo|redes|zona|tienda)/

describe('stored values', () => {
  it('industry keys and segments are English kebab-case', () => {
    for (const g of GIROS) {
      for (const v of [g.clave, g.segmento]) {
        expect(v).toMatch(KEBAB)
        expect(v).not.toMatch(SPANISH)
      }
    }
  })

  it('every scheduled search points to a known industry', () => {
    for (const b of searches.busquedas) expect(giroDe(b.giro), b.giro).not.toBeNull()
  })

  it('tags and discard reasons are English', () => {
    for (const v of [TAG_REDES_DESCARTADO, TAG_ZONA_PREMIUM, TAG_CORREO_INVALIDO, ...Object.keys(MOTIVOS_DESCARTE_REDES)]) {
      expect(v).toMatch(KEBAB)
      expect(v).not.toMatch(SPANISH)
    }
  })
})
