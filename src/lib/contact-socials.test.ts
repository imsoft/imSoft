import { describe, expect, it } from 'vitest'
import { pasaFiltroRedes, redesDe } from './contact-socials'

describe('redes de un contacto', () => {
  it('junta social_links con el instagram_url suelto sin repetir Instagram', () => {
    expect(redesDe({ social_links: [{ platform: 'facebook', url: 'x' }], instagram_url: 'imsoft' })).toEqual([
      { platform: 'facebook', url: 'x' },
      { platform: 'instagram', url: 'imsoft' },
    ])
    expect(redesDe({ social_links: [{ platform: 'instagram', url: 'a' }], instagram_url: 'b' })).toHaveLength(1)
  })

  it('ignora enlaces vacios y contactos sin nada', () => {
    expect(redesDe({ social_links: [{ platform: 'tiktok', url: '  ' }], instagram_url: '' })).toEqual([])
    expect(redesDe({})).toEqual([])
    expect(redesDe({ social_links: null as never })).toEqual([])
  })
})

describe('filtro de redes en la tabla del CRM', () => {
  const conIg = { instagram_url: 'imsoft' }
  const conFb = { social_links: [{ platform: 'facebook' as const, url: 'imsoft' }] }
  const sinNada = {}

  it('"all" y vacio dejan pasar a todos', () => {
    for (const f of ['all', '', undefined] as const) for (const c of [conIg, conFb, sinNada]) expect(pasaFiltroRedes(c, f)).toBe(true)
  })

  it('"any" y "none" separan a quien tiene alguna red de quien no', () => {
    expect([conIg, conFb, sinNada].map((c) => pasaFiltroRedes(c, 'any'))).toEqual([true, true, false])
    expect([conIg, conFb, sinNada].map((c) => pasaFiltroRedes(c, 'none'))).toEqual([false, false, true])
  })

  it('una plataforma concreta solo deja pasar a quien la tiene', () => {
    expect([conIg, conFb, sinNada].map((c) => pasaFiltroRedes(c, 'instagram'))).toEqual([true, false, false])
    expect([conIg, conFb, sinNada].map((c) => pasaFiltroRedes(c, 'facebook'))).toEqual([false, true, false])
  })
})
