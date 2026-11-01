import { describe, expect, it } from 'vitest'
import { contactMethods, matchesSocialFilter, socialsOf } from './contact-socials'

describe('socials of a contact', () => {
  it('merges social_links with the loose instagram_url without repeating Instagram', () => {
    expect(socialsOf({ social_links: [{ platform: 'facebook', url: 'x' }], instagram_url: 'imsoft' })).toEqual([
      { platform: 'facebook', url: 'x' },
      { platform: 'instagram', url: 'imsoft' },
    ])
    expect(socialsOf({ social_links: [{ platform: 'instagram', url: 'a' }], instagram_url: 'b' })).toHaveLength(1)
  })

  it('ignores empty links and contacts with nothing', () => {
    expect(socialsOf({ social_links: [{ platform: 'tiktok', url: '  ' }], instagram_url: '' })).toEqual([])
    expect(socialsOf({})).toEqual([])
    expect(socialsOf({ social_links: null as never })).toEqual([])
  })
})

describe('socials filter in the CRM table', () => {
  const withIg = { instagram_url: 'imsoft' }
  const withFb = { social_links: [{ platform: 'facebook' as const, url: 'imsoft' }] }
  const withNothing = {}

  it('"all" and empty let everyone through', () => {
    for (const f of ['all', '', undefined] as const) for (const c of [withIg, withFb, withNothing]) expect(matchesSocialFilter(c, f)).toBe(true)
  })

  it('"any" and "none" separate those with some social from those without', () => {
    expect([withIg, withFb, withNothing].map((c) => matchesSocialFilter(c, 'any'))).toEqual([true, true, false])
    expect([withIg, withFb, withNothing].map((c) => matchesSocialFilter(c, 'none'))).toEqual([false, false, true])
  })

  it('a specific platform only lets through those who have it', () => {
    expect([withIg, withFb, withNothing].map((c) => matchesSocialFilter(c, 'instagram'))).toEqual([true, false, false])
    expect([withIg, withFb, withNothing].map((c) => matchesSocialFilter(c, 'facebook'))).toEqual([false, true, false])
  })
})

describe('contact methods', () => {
  it('counts email, social network and a phone of 10 digits or more', () => {
    expect(contactMethods({ email: 'a@b.mx' })).toEqual(['email'])
    expect(contactMethods({ instagram_url: 'x' })).toEqual(['social'])
    expect(contactMethods({ phone: '33 1234 5678' })).toEqual(['phone'])
    expect(contactMethods({ email: 'a@b.mx', social_links: [{ platform: 'facebook', url: 'x' }], phone: '3312345678' })).toEqual(['email', 'social', 'phone'])
  })

  it('a contact with nothing, or with an incomplete phone or blank email, has none', () => {
    expect(contactMethods({})).toEqual([])
    expect(contactMethods({ email: '  ', phone: '12345', social_links: [{ platform: 'tiktok', url: '' }] })).toEqual([])
  })
})
