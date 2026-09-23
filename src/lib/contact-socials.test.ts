import { describe, expect, it } from 'vitest'
import { formasDeContacto, pasaFiltroRedes, redesDe } from './contact-socials'

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

describe('formas de contacto', () => {
  it('cuenta correo, red social y telefono de 10 digitos o mas', () => {
    expect(formasDeContacto({ email: 'a@b.mx' })).toEqual(['correo'])
    expect(formasDeContacto({ instagram_url: 'x' })).toEqual(['red'])
    expect(formasDeContacto({ phone: '33 1234 5678' })).toEqual(['telefono'])
    expect(formasDeContacto({ email: 'a@b.mx', social_links: [{ platform: 'facebook', url: 'x' }], phone: '3312345678' })).toEqual(['correo', 'red', 'telefono'])
  })

  it('un contacto sin nada, o con telefono incompleto o correo en blanco, no tiene ninguna', () => {
    expect(formasDeContacto({})).toEqual([])
    expect(formasDeContacto({ email: '  ', phone: '12345', social_links: [{ platform: 'tiktok', url: '' }] })).toEqual([])
  })
})
