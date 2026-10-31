import { describe, expect, it } from 'vitest'
import { phoneAsWhatsApp, candidateFrom, googleListing, isOffProfile, linkedInContactFromResults, facebookFromResults, distinctiveTokens, instagramFromResults, domainOf, contactLinks, extractEmail, extractInstagram, extractWhatsApp, rowFromCandidate, formatPhone, industryByKey, cleanName, markExisting, normalizedName, isReachable, dedupe, runNumber, searchSlice, matchingBrand, isPremiumZone } from './places'
import { mapRowsToContacts } from './import-contacts'

describe('Instagram by web search', () => {
  it('takes the profile whose username or title has a distinctive word of the name', () => {
    expect(distinctiveTokens('Clínica Dental Díaz Sucursal Carrillo Puerto')).toEqual(['diaz', 'carrillo', 'puerto'])
    const r = [
      { link: 'https://www.instagram.com/p/C1abc/', title: 'Clínica Dental Díaz en Instagram' },
      { link: 'https://www.instagram.com/clinicadentaldiaz/', title: 'Clínica Dental Díaz (@clinicadentaldiaz) • Instagram' },
    ]
    expect(instagramFromResults('Clínica Dental Díaz', r)).toBe('https://instagram.com/clinicadentaldiaz')
    // The username doesn't match but the title does.
    expect(instagramFromResults('Levy Fit', [{ link: 'https://instagram.com/levy.fit.gdl/', title: 'LEVY FIT' }])).toBe('https://instagram.com/levy.fit.gdl')
    expect(instagramFromResults('Rievsa Ferretería', [{ link: 'https://instagram.com/ferreteriagdl/', title: 'Ferretería GDL' }])).toBeNull()
  })

  it('rejects profiles from another city or country even if the name matches', () => {
    expect(instagramFromResults('Bianca Aldama Boutique', [{ link: 'https://instagram.com/biancaaldamaboutiquemochis/', title: 'Bianca Aldama Boutique Mochis', description: 'Boutique en Los Mochis, Sinaloa' }])).toBeNull()
    expect(instagramFromResults('Clínica Dental Smile Clinic', [{ link: 'https://instagram.com/clinicasmile.cl/', title: 'Clínica Smile' }])).toBeNull()
    expect(instagramFromResults('SONRÍE', [{ link: 'https://instagram.com/sonrieeneldesayuno/', title: 'Sonríe en el desayuno' }])).toBeNull()
    // With a local hint in the description it passes even if the username has more in it.
    expect(instagramFromResults('Clínica Dental Díaz', [{ link: 'https://instagram.com/clinicadentaldiazlopezcadiz/', title: 'Clínica Dental Díaz', description: 'Odontología integral en Tlaquepaque, Jalisco' }], 'Tlaquepaque')).toBe('https://instagram.com/clinicadentaldiazlopezcadiz')
    expect(instagramFromResults('Hocre Inmobiliaria', [{ link: 'https://instagram.com/hocreinmobiliaria/', title: 'HOCRE Inmobiliaria' }])).toBe('https://instagram.com/hocreinmobiliaria')
  })

  it('does not accept names without distinctive words or paths that are not a profile', () => {
    expect(instagramFromResults('Taller Mecánico Zapopan', [{ link: 'https://instagram.com/tallermecanicozapopan/', title: 'Taller Mecánico Zapopan' }])).toBeNull()
    expect(instagramFromResults('Maroffa', [{ link: 'https://instagram.com/explore/tags/maroffa/', title: 'maroffa' }])).toBeNull()
    expect(instagramFromResults('Maroffa', [])).toBeNull()
  })
})

describe('Facebook and LinkedIn by web search', () => {
  it('gets the Facebook page and the phone from the snippet when it matches the business', () => {
    const r = [
      { link: 'https://www.facebook.com/61557672856757/reels/', title: 'Maroffa Restaurante' },
      { link: 'https://www.facebook.com/p/Maroffa-Restaurante-61557672856757/', title: 'Maroffa Restaurante | Tlaquepaque | Facebook', description: 'Somos tu primer opción en Tlaquepaque. Independencia 288, Tlaquepaque, Mexico · +52 33 1234 5678 · hola@maroffa.mx' },
    ]
    expect(facebookFromResults('Maroffa Restaurante', r, 'Tlaquepaque')).toEqual({ url: 'https://facebook.com/Maroffa-Restaurante-61557672856757', phone: '33 1234 5678', email: 'hola@maroffa.mx' })
    expect(facebookFromResults('Grupo GUZVA', [{ link: 'https://www.facebook.com/grupoguzva/', title: 'Grupo GUZVA | Guadalajara', description: 'Grupo GUZVA, Guadalajara, Jalisco. 436 likes' }])).toEqual({ url: 'https://facebook.com/grupoguzva', phone: null, email: null })
    expect(facebookFromResults('Rievsa Ferretería', [{ link: 'https://www.facebook.com/people/Ferreteria-Cali/123/', title: 'Ferretería Cali' }])).toBeNull()
  })

  it('picks the LinkedIn executive who decides, not the operator', () => {
    const r = [
      { link: 'https://mx.linkedin.com/in/maribel-ramirez-557238161', title: 'Maribel Ramirez - Jefe de logística - JTP LOGISTICS', description: '' },
      { link: 'https://www.linkedin.com/in/theodus-penn-962700206/', title: 'theodus penn - Truck Driver at JTP LOGISTICS', description: 'Atlanta' },
      { link: 'https://mx.linkedin.com/in/jose-tirado-b3766691?trk=x', title: 'Jose Tirado - Gerente comercial superior - JTP logistics | LinkedIn', description: 'Zapopan, JAL' },
      { link: 'https://www.linkedin.com/in/ana-lopez-1/', title: 'Ana López - Directora General - JTP Logistics | LinkedIn', description: 'Guadalajara' },
    ]
    expect(linkedInContactFromResults('JTP Logistics', r)).toEqual({ firstName: 'Ana', lastName: 'López', jobTitle: 'Directora General', url: 'https://www.linkedin.com/in/ana-lopez-1/' })
    // Without an executive with a decision-making title, it doesn't make one up.
    expect(linkedInContactFromResults('JTP Logistics', r.slice(1, 2))).toBeNull()
    expect(linkedInContactFromResults('JTP Logistics', [{ link: 'https://linkedin.com/company/jtp', title: 'JTP Logistics | LinkedIn' }])).toBeNull()
    // Professional titles are not the name.
    expect(linkedInContactFromResults('GCPI Grupo Constructor', [{ link: 'https://www.linkedin.com/in/gccorporativo/', title: 'Lic. José Alberto Guerrero Luna - Director legal - GCPI | LinkedIn' }])?.firstName).toBe('José')
  })
})

describe('prospect search (Places)', () => {
  it('normalizes domain, phone and name', () => {
    expect(domainOf('http://www.dhiconsultores.com/')).toBe('dhiconsultores.com')
    expect(domainOf('https://www.facebook.com/negocio')).toBeNull()
    expect(domainOf('negocio.business.site')).toBeNull()
    expect(domainOf(null)).toBeNull()
    expect(formatPhone('33 1652 5572')).toBe('33 1652 5572')
    expect(formatPhone('+52 33 1652 5572')).toBe('33 1652 5572')
    expect(formatPhone('(33) 1652-5572')).toBe('33 1652 5572')
    expect(normalizedName('GGV CONTADORES FISCALISTAS, S.C.')).toBe('ggv contadores fiscalistas')
    expect(normalizedName('Distribuidora La Abundancia S.A. de C.V.')).toBe('distribuidora la abundancia')
  })

  it('turns a Places result into a candidate', () => {
    const c = candidateFrom({ id: 'abc', displayName: { text: ' ES Contable ' }, formattedAddress: 'Eje Central 5140, Zapopan', websiteUri: 'https://www.escontable.com/', nationalPhoneNumber: '33 1973 2676', rating: 5, userRatingCount: 32, primaryTypeDisplayName: { text: 'Asesor' } })
    expect(c).toMatchObject({ placeId: 'abc', name: 'ES Contable', domain: 'escontable.com', phone: '33 1973 2676', rating: 5, reviews: 32, type: 'Asesor', inCrm: false })
  })

  it('marks those already in the CRM by domain, phone or name', () => {
    const cands = [
      candidateFrom({ id: '1', displayName: { text: 'Roistom Despacho' }, websiteUri: 'https://roistom.com/' }),
      candidateFrom({ id: '2', displayName: { text: 'Otro' }, nationalPhoneNumber: '33 2001 2700' }),
      candidateFrom({ id: '3', displayName: { text: 'GMC Consultores S.C.' } }),
      candidateFrom({ id: '4', displayName: { text: 'Nuevo Despacho' }, websiteUri: 'https://nuevo.mx' }),
    ]
    const existing = [
      { company: 'Roistom', website_url: 'https://roistom.com', phone: null, email: 'contacto@roistom.com' },
      { company: 'X', website_url: null, phone: '33 2001 2700', email: null },
      { company: 'GMC Consultores', website_url: null, phone: null, email: null },
    ]
    expect(markExisting(cands, existing).map((c) => c.inCrm)).toEqual([true, true, true, false])
  })

  it('removes repeats across pages and branches with the same name', () => {
    const a = candidateFrom({ id: '1', displayName: { text: 'A' } })
    expect(dedupe([a, { ...a }, candidateFrom({ id: '2', displayName: { text: 'B' } })])).toHaveLength(2)
    const e1 = candidateFrom({ id: '3', displayName: { text: 'Nucleo Odontologíco Escobar' } })
    const e2 = candidateFrom({ id: '4', displayName: { text: 'Núcleo odontológico escobar' } })
    expect(dedupe([e1, e2])).toHaveLength(1)
  })

  it('cleans names with taglines, branches and emojis, and drops filler emails', () => {
    expect(cleanName('MF Dental Center | Dentista Zapopan')).toBe('MF Dental Center')
    expect(cleanName('Clínica Dental la Zapopana (Sucursal Constitución)')).toBe('Clínica Dental la Zapopana')
    expect(cleanName('FRIZCO - Bienes Raíces 🏡 | Guadalajara y Zapopan')).toBe('FRIZCO - Bienes Raíces')
    expect(cleanName('SYD Constructores, la constructora en Guadalajara')).toBe('SYD Constructores')
    expect(extractEmail('escribe a usuario@dominio.com', 'ikal.mx')).toBeNull()
    expect(extractEmail('correo@ejemplo.com o ventas@ikal.mx', 'ikal.mx')).toBe('ventas@ikal.mx')
    // Template filler and glued text: they bounced on 2026-10-28.
    expect(extractEmail('Email: sample@mail.com', null)).toBeNull()
    expect(extractEmail('visita placejoys.com@gmail.com', null)).toBeNull()
    expect(extractEmail('tel 3312345678@hotmail.com', null)).toBeNull()
    // Notaries and free legal aid leave the queue even if Places returns them.
    expect(isOffProfile('Notaría Pública no 21')).toBe(true)
    expect(isOffProfile('Bufete Jurídico Gratuito ITESO')).toBe(true)
    expect(isOffProfile('BD Abogados')).toBe(false)
    // The Google listing goes into the notes so the first message talks about something real.
    expect(googleListing({ rating: 4.8, reviews: 198, type: 'Clínica dental', address: 'Av. Cruz del Sur 3973, 44950 Guadalajara, Jal., México' })).toBe('Google Maps: 4.8 estrellas (198 reseñas) · Clínica dental · Av. Cruz del Sur 3973, Guadalajara, Jal.')
    expect(googleListing({ rating: null, reviews: 0, type: null, address: '' })).toBeNull()
  })

  it("picks a website's best email", () => {
    const html = `<a href="mailto:noreply@wixpress.com">x</a> Escríbenos a ventas@escontable.com o a juan@gmail.com. <img src="logo@2x.png">`
    expect(extractEmail(html, 'escontable.com')).toBe('ventas@escontable.com')
    expect(extractEmail('solo texto', 'x.com')).toBeNull()
    expect(extractEmail('info [at] negocio [dot] mx', 'negocio.mx')).toBe('info@negocio.mx')
    // Without an email on the domain, it prefers contacto@ over a personal gmail
    expect(extractEmail('contacto@otro.mx y persona@gmail.com', 'negocio.mx')).toBe('contacto@otro.mx')
  })

  it('gets the Instagram and the contact links', () => {
    expect(extractInstagram('<a href="https://www.instagram.com/roistom_despachocontable/">ig</a>')).toBe('https://instagram.com/roistom_despachocontable')
    expect(extractInstagram('https://instagram.com/p/abc123')).toBeNull()
    // The template's generic icon is not the profile: the next link is taken.
    expect(extractInstagram('<a href="https://instagram.com/instagram">ig</a> <a href="https://www.instagram.com/kinal_spa/">k</a>')).toBe('https://instagram.com/kinal_spa')
    expect(extractInstagram('<a href="https://www.instagram.com/instagram/">ig</a>')).toBeNull()
    const links = contactLinks('<a href="/contacto">c</a><a href="https://otro.com/contacto">x</a><a href="/blog">b</a><a href="nosotros.html">n</a>', 'https://negocio.mx/')
    expect(links).toEqual(['https://negocio.mx/contacto', 'https://negocio.mx/nosotros.html'])
  })

  it("the candidate's row goes through the same mapping as the CSV", () => {
    const c = { ...candidateFrom({ id: '1', displayName: { text: 'ES Contable' }, websiteUri: 'https://escontable.com', nationalPhoneNumber: '33 1973 2676' }), email: 'ventas@escontable.com', instagram: null }
    const { contacts } = mapRowsToContacts([rowFromCandidate(c, 'accounting')], { source: 'Google Places', tags: ['auto'] })
    expect(contacts[0]).toMatchObject({ company: 'ES Contable', email: 'ventas@escontable.com', phone: '33 1973 2676', website_url: 'https://escontable.com', tags: ['auto', 'accounting'], status: 'no_contact', contact_type: 'prospect' })
    expect(industryByKey('accounting')?.segment).toBe('accounting')
    expect(industryByKey('nada')).toBeNull()
  })

  it('tags prospects in neighborhoods with a bigger budget', () => {
    expect(isPremiumZone('Blvd. Puerta de Hierro 4965, Puerta de Hierro, 45116 Zapopan, Jal.')).toBe(true)
    expect(isPremiumZone('Av. Pablo Neruda 2850, Providencia, 44630 Guadalajara, Jal.')).toBe(true)
    expect(isPremiumZone('Av. Tonalá 123, Centro, 45400 Tonalá, Jal.')).toBe(false)
    expect(isPremiumZone(null)).toBe(false)
    const cafe = { ...candidateFrom({ id: 'p1', displayName: { text: 'Tukafe' }, formattedAddress: 'Plaza Andares, Puerta de Hierro, Zapopan', nationalPhoneNumber: '33 1234 5678' }) }
    const { contacts } = mapRowsToContacts([rowFromCandidate(cafe, 'restaurants')], { source: 'Google Places', tags: ['auto'] })
    expect(contacts[0].tags).toEqual(['auto', 'restaurants', 'premium-zone'])
  })

  it('gets the WhatsApp the business publishes on its website', () => {
    expect(extractWhatsApp('<a href="https://wa.me/523312345678?text=Hola">WhatsApp</a>')).toBe('523312345678')
    expect(extractWhatsApp('<a href="https://api.whatsapp.com/send?phone=5213312345678&amp;text=Hola">')).toBe('523312345678')
    expect(extractWhatsApp('href="https://api.whatsapp.com/send/?text=hola&phone=%2B52 33 1234 5678"')).toBe('523312345678')
    expect(extractWhatsApp('<a href="https://wa.me/3312345678">')).toBe('523312345678')
    expect(extractWhatsApp('<a href="https://wa.me/12025550123">')).toBe('12025550123')
    // Without a number (generic link or group) there's nobody to write to.
    expect(extractWhatsApp('<a href="https://wa.me/?text=hola">')).toBeNull()
    expect(extractWhatsApp('<a href="https://chat.whatsapp.com/AbCdEf">')).toBeNull()
    expect(extractWhatsApp('Tel. 33 1234 5678')).toBeNull()
    expect(isReachable({ whatsapp: '523312345678' })).toBe(true)
  })

  it('whoever has an email, Instagram, published WhatsApp or a phone that may be WhatsApp gets into the CRM', () => {
    expect(isReachable({ email: 'a@b.mx', instagram: null })).toBe(true)
    expect(isReachable({ email: null, instagram: 'ferreteria' })).toBe(true)
    expect(isReachable({ email: ' ', instagram: '' })).toBe(false)
    expect(isReachable({})).toBe(false)
    // Google's phone counts (2026-10-26); an 800 doesn't.
    expect(isReachable({ phone: '33 1234 5678' })).toBe(true)
    expect(isReachable({ phone: '800 123 4567' })).toBe(false)
  })

  it("Google's phone becomes a Mexican WhatsApp number, except 800, 900 and filler numbers", () => {
    expect(phoneAsWhatsApp('33 1234 5678')).toBe('523312345678')
    expect(phoneAsWhatsApp('+52 1 33 1234 5678')).toBe('523312345678')
    expect(phoneAsWhatsApp('+52 33 1234 5678')).toBe('523312345678')
    expect(phoneAsWhatsApp('800 700 5346')).toBeNull()
    expect(phoneAsWhatsApp('01 800 123 4567')).toBeNull()
    expect(phoneAsWhatsApp('1234567890')).toBeNull()
    expect(phoneAsWhatsApp('3333333333')).toBeNull()
    expect(phoneAsWhatsApp('12345')).toBeNull()
    expect(phoneAsWhatsApp(null)).toBeNull()
  })

  it('each run takes the next slice and together they cover the whole list', () => {
    const list = Array.from({ length: 7 }, (_, i) => i)
    expect(searchSlice(list, 0, 3)).toEqual([0, 1, 2])
    expect(searchSlice(list, 1, 3)).toEqual([3, 4, 5])
    expect(searchSlice(list, 2, 3)).toEqual([6, 0, 1])
    expect(new Set([0, 1, 2].flatMap((c) => searchSlice(list, c, 3))).size).toBe(7)
    expect(searchSlice(list, 5, 20)).toHaveLength(7)
    expect(searchSlice([], 5, 3)).toEqual([])
  })

  it('the run number counts Mondays, Wednesdays and Fridays, so the 69 searches are covered in 5 runs', () => {
    expect(runNumber(new Date('2026-09-21T13:00:00Z'))).toBe(1) // Monday
    expect(runNumber(new Date('2026-09-22T13:00:00Z'))).toBe(1) // Tuesday: doesn't run
    expect(runNumber(new Date('2026-09-23T13:00:00Z'))).toBe(2) // Wednesday
    expect(runNumber(new Date('2026-09-25T13:00:00Z'))).toBe(3) // Friday
    expect(runNumber(new Date('2026-09-28T13:00:00Z'))).toBe(4) // next Monday
    const list = Array.from({ length: 69 }, (_, i) => i)
    const dates = ['2026-09-28', '2026-09-30', '2026-10-02', '2026-10-05', '2026-10-07']
    const seen = new Set(dates.flatMap((f) => searchSlice(list, runNumber(new Date(`${f}T13:00:00Z`)), 15)))
    expect(seen.size).toBe(69)
  })

  it('when searching a large company by name, it keeps only that brand and only once', () => {
    const c = [{ name: 'Farmacia San Juan' }, { name: 'Farmacias Guadalajara Chapultepec' }, { name: 'Farmacias Guadalajara Américas' }]
    expect(matchingBrand(c, 'farmacias guadalajara')).toEqual([{ name: 'Farmacias Guadalajara Chapultepec' }])
    expect(matchingBrand([{ name: 'Leche Sello Rojo S.A. de C.V.' }], 'sello rojo')).toHaveLength(1)
    expect(matchingBrand(c, 'dalton')).toEqual([])
    expect(industryByKey('corporate')?.segment).toBe('corporate')
  })

  it('does not take privacy, billing or job mailboxes as the contact email', () => {
    expect(extractEmail('<p>privacidad@sellorojo.com.mx</p>', 'sellorojo.com.mx')).toBeNull()
    expect(extractEmail('facturacion@x.mx rh@x.mx ventas@x.mx', 'x.mx')).toBe('ventas@x.mx')
    expect(extractEmail('vacantes@x.mx datos-personales@x.mx', 'x.mx')).toBeNull()
    // Web template filler emails (one like that was written to on 2026-09-29).
    expect(extractEmail('support@demoagency.com info@yourdomain.com', 'supermaynuez.mx')).toBeNull()
    // Template filler that reached the CRM and bounced on 2026-10-08.
    expect(extractEmail('<a href="mailto:johndoe@mail.com">johndoe@mail.com</a>', 'colegiobatiz.edu.mx')).toBeNull()
    // mailto with an encoded space: the %20 is not part of the address.
    expect(extractEmail('<a href="mailto:%20reservaspisosiete@doubletreegdlch.com">Reservas</a>', 'doubletreegdlch.com')).toBe('reservaspisosiete@doubletreegdlch.com')
  })
})
