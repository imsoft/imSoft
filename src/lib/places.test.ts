import { describe, expect, it } from 'vitest'
import { candidatoDe, dominioDe, enlacesDeContacto, extraerCorreo, extraerInstagram, filaDesdeCandidato, formatoTelefono, giroDe, marcarExistentes, nombreNormalizado, sinRepetidos } from './places'
import { mapRowsToContacts } from './import-contacts'

describe('buscador de prospectos (Places)', () => {
  it('normaliza dominio, teléfono y nombre', () => {
    expect(dominioDe('http://www.dhiconsultores.com/')).toBe('dhiconsultores.com')
    expect(dominioDe('https://www.facebook.com/negocio')).toBeNull()
    expect(dominioDe('negocio.business.site')).toBeNull()
    expect(dominioDe(null)).toBeNull()
    expect(formatoTelefono('33 1652 5572')).toBe('33 1652 5572')
    expect(formatoTelefono('+52 33 1652 5572')).toBe('33 1652 5572')
    expect(formatoTelefono('(33) 1652-5572')).toBe('33 1652 5572')
    expect(nombreNormalizado('GGV CONTADORES FISCALISTAS, S.C.')).toBe('ggv contadores fiscalistas')
    expect(nombreNormalizado('Distribuidora La Abundancia S.A. de C.V.')).toBe('distribuidora la abundancia')
  })

  it('convierte un resultado de Places en candidato', () => {
    const c = candidatoDe({ id: 'abc', displayName: { text: ' ES Contable ' }, formattedAddress: 'Eje Central 5140, Zapopan', websiteUri: 'https://www.escontable.com/', nationalPhoneNumber: '33 1973 2676', rating: 5, userRatingCount: 32, primaryTypeDisplayName: { text: 'Asesor' } })
    expect(c).toMatchObject({ placeId: 'abc', nombre: 'ES Contable', dominio: 'escontable.com', telefono: '33 1973 2676', rating: 5, resenas: 32, tipo: 'Asesor', enCrm: false })
  })

  it('marca los que ya están en el CRM por dominio, teléfono o nombre', () => {
    const cands = [
      candidatoDe({ id: '1', displayName: { text: 'Roistom Despacho' }, websiteUri: 'https://roistom.com/' }),
      candidatoDe({ id: '2', displayName: { text: 'Otro' }, nationalPhoneNumber: '33 2001 2700' }),
      candidatoDe({ id: '3', displayName: { text: 'GMC Consultores S.C.' } }),
      candidatoDe({ id: '4', displayName: { text: 'Nuevo Despacho' }, websiteUri: 'https://nuevo.mx' }),
    ]
    const existentes = [
      { company: 'Roistom', website_url: 'https://roistom.com', phone: null, email: 'contacto@roistom.com' },
      { company: 'X', website_url: null, phone: '33 2001 2700', email: null },
      { company: 'GMC Consultores', website_url: null, phone: null, email: null },
    ]
    expect(marcarExistentes(cands, existentes).map((c) => c.enCrm)).toEqual([true, true, true, false])
  })

  it('quita repetidos entre páginas', () => {
    const a = candidatoDe({ id: '1', displayName: { text: 'A' } })
    expect(sinRepetidos([a, { ...a }, candidatoDe({ id: '2', displayName: { text: 'B' } })])).toHaveLength(2)
  })

  it('elige el mejor correo de un sitio', () => {
    const html = `<a href="mailto:noreply@wixpress.com">x</a> Escríbenos a ventas@escontable.com o a juan@gmail.com. <img src="logo@2x.png">`
    expect(extraerCorreo(html, 'escontable.com')).toBe('ventas@escontable.com')
    expect(extraerCorreo('solo texto', 'x.com')).toBeNull()
    expect(extraerCorreo('info [at] negocio [dot] mx', 'negocio.mx')).toBe('info@negocio.mx')
    // Sin correo del dominio, prefiere contacto@ sobre un gmail personal
    expect(extraerCorreo('contacto@otro.mx y persona@gmail.com', 'negocio.mx')).toBe('contacto@otro.mx')
  })

  it('saca el Instagram y los enlaces de contacto', () => {
    expect(extraerInstagram('<a href="https://www.instagram.com/roistom_despachocontable/">ig</a>')).toBe('https://instagram.com/roistom_despachocontable')
    expect(extraerInstagram('https://instagram.com/p/abc123')).toBeNull()
    const links = enlacesDeContacto('<a href="/contacto">c</a><a href="https://otro.com/contacto">x</a><a href="/blog">b</a><a href="nosotros.html">n</a>', 'https://negocio.mx/')
    expect(links).toEqual(['https://negocio.mx/contacto', 'https://negocio.mx/nosotros.html'])
  })

  it('la fila del candidato entra al mismo mapeo que el CSV', () => {
    const c = { ...candidatoDe({ id: '1', displayName: { text: 'ES Contable' }, websiteUri: 'https://escontable.com', nationalPhoneNumber: '33 1973 2676' }), correo: 'ventas@escontable.com', instagram: null }
    const { contacts } = mapRowsToContacts([filaDesdeCandidato(c, 'contabilidad')], { source: 'Google Places', tags: ['auto'] })
    expect(contacts[0]).toMatchObject({ company: 'ES Contable', email: 'ventas@escontable.com', phone: '33 1973 2676', website_url: 'https://escontable.com', tags: ['auto', 'contabilidad'], status: 'no_contact', contact_type: 'prospect' })
    expect(giroDe('contabilidad')?.segmento).toBe('contabilidad')
    expect(giroDe('nada')).toBeNull()
  })
})
