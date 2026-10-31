import { describe, expect, it } from 'vitest'
import { channelFromSubject, channelsOf, socialQueue, socialIndustry, whatWeDo, SOCIAL_DISCARDED_TAG, countByChannel, capStatus, CHANNEL_LABEL, whatsAppNumber, offerOf, renderSocialMessage, CHANNEL_MAX_LENGTH, CHANNEL_DAILY_CAP, socialUrl } from './social-message'

const v = { name: 'Héctor', company: 'Gil y Gil', hook: 'Cada filial lleva sus pedimentos en su propio Excel.', segment: 'logistics-gdl' }

describe('social message', () => {
  it('the first message is the opener (observation + question) and a line about who is writing, no pitch or call', () => {
    const opener = 'Hola, vi que tienen 4.8 en Google con 200 reseñas. Pregunta rápida: ¿las confirmaciones de cita las hacen a mano o ya tienen algo que las mande solas?'
    const t = renderSocialMessage('whatsapp', { name: '', company: 'Dental Díaz', hook: opener, segment: 'dental' })
    expect(t).toBe(`${opener}\n\nSoy Brandon, de imSoft; hacemos software para consultorios dentales en Guadalajara.`)
    expect(t).not.toMatch(/15 minutos|precio|https?:\/\/|Excel/i)
    expect(t.split(' ').length).toBeLessThan(60)
  })

  it('an old hook without greeting gets wrapped with "Hola" and, if there is a name, the name', () => {
    const t = renderSocialMessage('instagram', { ...v, segment: 'logistics' })
    expect(t.startsWith('Hola Héctor, ')).toBe(true)
    expect(t).toContain('agencias aduanales y logística')
    const noName = renderSocialMessage('facebook', { ...v, name: '', segment: null })
    expect(noName.startsWith('Hola, ')).toBe(true)
    expect(noName).toContain('software a la medida para negocios')
  })

  it('the introduction line changes by industry and offer', () => {
    expect(whatWeDo('hardware-stores')).toBe('software para ferreterías y distribuidoras')
    expect(whatWeDo('restaurants', 'app')).toBe('apps para restaurantes y cafeterías')
    expect(whatWeDo('fitness-gdl', 'app')).toBe('apps para gimnasios')
    expect(whatWeDo('wholesale-market', 'app')).toBe('apps de pedidos para mayoristas')
    expect(whatWeDo('jewelry', 'store')).toBe('tiendas en línea para joyerías')
    expect(whatWeDo('agro')).toBe('software para el campo y la agroindustria')
    expect(whatWeDo(null)).toBe('software a la medida para negocios')
  })

  it('LinkedIn is longer and mentions fixed price; Instagram does not', () => {
    expect(renderSocialMessage('linkedin', v)).toContain('precio fijo')
    expect(renderSocialMessage('instagram', v)).not.toContain('precio fijo')
    expect(renderSocialMessage('linkedin', v).length).toBeGreaterThan(renderSocialMessage('instagram', v).length)
  })

  it("respects each network's max length without cutting mid-word", () => {
    const t = renderSocialMessage('tiktok', { ...v, hook: 'palabra '.repeat(200) })
    expect(t.length).toBeLessThanOrEqual(CHANNEL_MAX_LENGTH.tiktok)
    expect(t.endsWith('…')).toBe(true)
  })
})

describe('WhatsApp number', () => {
  it('accepts 10 digits, 52+10 and 521+10; rejects the rest', () => {
    expect(whatsAppNumber('33 2536 5558')).toBe('523325365558')
    expect(whatsAppNumber('+52 33 2536 5558')).toBe('523325365558')
    expect(whatsAppNumber('5213325365558')).toBe('523325365558')
    expect(whatsAppNumber('12345')).toBeNull()
    expect(whatsAppNumber(null)).toBeNull()
  })
})

describe("a contact's available channels", () => {
  it('come from its networks and phone, in a fixed order, with the URL to open each one', () => {
    const c = { instagram_url: '@ferreteria', phone: '3312345678', social_links: [{ platform: 'linkedin' as const, url: 'https://linkedin.com/company/x' }, { platform: 'youtube' as const, url: 'x' }] }
    expect(channelsOf(c, 'hola')).toEqual([
      { channel: 'instagram', url: 'https://instagram.com/ferreteria' },
      { channel: 'whatsapp', url: 'https://wa.me/523312345678?text=hola' },
      { channel: 'linkedin', url: 'https://linkedin.com/company/x' },
    ])
  })

  it('the WhatsApp published by the business beats the phone, which is usually a landline', () => {
    const c = { phone: '33 3880 6000', social_links: [{ platform: 'whatsapp' as const, url: '+523316029326' }] }
    expect(channelsOf(c)).toEqual([{ channel: 'whatsapp', url: 'https://wa.me/523316029326' }])
  })

  it('without networks or phone there are no channels', () => {
    expect(channelsOf({})).toEqual([])
    expect(channelsOf({ phone: '123' })).toEqual([])
  })

  it('socialUrl builds the profile from the username', () => {
    expect(socialUrl({ platform: 'tiktok', url: '@imsoft' })).toBe('https://tiktok.com/@imsoft')
    expect(socialUrl({ platform: 'whatsapp', url: '+52 33 1234 5678' })).toBe('https://wa.me/523312345678')
  })
})

describe('daily cap per network', () => {
  it('the subject each send is recorded with reads back as a channel', () => {
    for (const c of ['instagram', 'whatsapp', 'twitter'] as const) expect(channelFromSubject(`Mensaje por ${CHANNEL_LABEL[c]}`)).toBe(c)
    expect(channelFromSubject('Llamada de seguimiento')).toBeNull()
    expect(channelFromSubject(null)).toBeNull()
  })

  it('counts per channel and ignores what is not a social message', () => {
    const c = countByChannel(['Mensaje por Instagram', 'Mensaje por WhatsApp', 'Mensaje por Instagram', 'Nota', null])
    expect(c.instagram).toBe(2)
    expect(c.whatsapp).toBe(1)
    expect(c.linkedin).toBe(0)
  })

  it('warns when 3 or fewer are left and stops at the cap', () => {
    const t = CHANNEL_DAILY_CAP.whatsapp
    expect(capStatus(0, 'whatsapp')).toBe('ok')
    expect(capStatus(t - 4, 'whatsapp')).toBe('ok')
    expect(capStatus(t - 3, 'whatsapp')).toBe('near')
    expect(capStatus(t, 'whatsapp')).toBe('reached')
    expect(capStatus(t + 5, 'whatsapp')).toBe('reached')
  })
})

describe('social queue', () => {
  const base = { first_name: 'Ana', last_name: 'Ruiz', company: 'Acme', email: 'a@acme.mx', phone: null, instagram_url: null, social_links: null }
  it('only contacts with WhatsApp or Instagram get in; LinkedIn alone does not count', () => {
    const queue = socialQueue([
      { ...base, id: 'none', social_links: [{ platform: 'linkedin', url: 'ana' }] },
      { ...base, id: 'ig', instagram_url: '@acme' },
      { ...base, id: 'wa', phone: '33 2536 5558' },
    ])
    expect(queue.map((f) => f.id)).toEqual(['wa', 'ig'])
    expect(queue[0].channels).toEqual(['whatsapp'])
    expect(queue[1].channels).toEqual(['instagram'])
  })

  it('first those without email, then WhatsApp ones, and builds name and company', () => {
    const queue = socialQueue([
      { ...base, id: 'ig-email', instagram_url: 'acme' },
      { ...base, id: 'wa-email', phone: '3325365558' },
      { ...base, id: 'ig-no-email', email: '', instagram_url: 'acme', first_name: ' Ana ', last_name: null, company: ' Acme ' },
    ])
    expect(queue.map((f) => f.id)).toEqual(['ig-no-email', 'wa-email', 'ig-email'])
    expect(queue[0]).toMatchObject({ name: 'Ana', company: 'Acme', noEmail: true })
    expect(queue[1].noEmail).toBe(false)
  })

  it('contacts discarded from social do not enter the queue even if they have WhatsApp', () => {
    const queue = socialQueue([
      { ...base, id: 'bad', email: '', phone: '3325365558', tags: [SOCIAL_DISCARDED_TAG] },
      { ...base, id: 'good', email: '', phone: '3325365559' },
    ])
    expect(queue.map((f) => f.id)).toEqual(['good'])
  })

  it('within each group, premium zone first', () => {
    const queue = socialQueue([
      { ...base, id: 'wa', email: '', phone: '3325365558' },
      { ...base, id: 'wa-premium', email: '', phone: '3325365559', tags: ['restaurants', 'premium-zone'] },
      { ...base, id: 'email-premium', phone: '3325365550', tags: ['premium-zone'] },
    ])
    // The zone sorts within the group, it does not beat "no email".
    expect(queue.map((f) => f.id)).toEqual(['wa-premium', 'wa', 'email-premium'])
    expect(queue[0].premiumZone).toBe(true)
  })

  it('restaurants, gyms and stores are offered their own app', () => {
    expect(offerOf(['google-places', 'restaurants'])).toBe('app')
    expect(offerOf(['fitness-gdl'])).toBe('app')
    expect(offerOf(['ecommerce'])).toBe('app')
    expect(offerOf(['hardware-stores'])).toBeNull()
    expect(offerOf(null)).toBeNull()
    // Wholesale market: an ordering app for their store customers; jewelry: online store.
    expect(offerOf(['google-places', 'wholesale-market'])).toBe('app')
    expect(offerOf(['jewelry'])).toBe('store')
    // A large chain with its own IT department doesn't get the app message.
    expect(offerOf(['restaurants', 'corporate'])).toBeNull()

    const t = renderSocialMessage('instagram', { name: '', company: 'Tukafe', hook: 'Hola, vi que tienen 4.7 en Google. ¿Sus clientes frecuentes piden por WhatsApp o por app?', segment: 'restaurants', offer: 'app' })
    expect(t).toContain('apps para restaurantes')
    expect(t).not.toContain('Excel')
    // LinkedIn keeps the long per-industry introduction.
    const g = renderSocialMessage('linkedin', { name: '', company: 'Navi Gym', hook: 'g', segment: 'fitness-gdl', offer: 'app' })
    expect(g).toContain('reservas de clases, membresías')
    // The industry for the introduction comes from the tags, with or without a city suffix.
    expect(socialIndustry(['google-places', 'agro'])).toBe('agro')
    expect(socialIndustry(['fitness-gdl'])).toBe('fitness')
    expect(socialIndustry(['google-places', 'dental'])).toBe('dental')
    expect(socialIndustry(['premium-zone'])).toBeNull()
    expect(offerOf(['agro'])).toBeNull()
  })

  it('with phone and Instagram it gives both channels, WhatsApp first', () => {
    const [f] = socialQueue([{ ...base, id: 'x', phone: '3325365558', instagram_url: 'acme' }])
    expect(f.channels).toEqual(['whatsapp', 'instagram'])
  })
})
