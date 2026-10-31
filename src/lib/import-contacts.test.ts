import { describe, it, expect } from 'vitest'
import { mapRowsToContacts, parseCsv } from './import-contacts'

describe('parseCsv', () => {
  it('reads lowercase headers and trims spaces', () => {
    const rows = parseCsv('First_Name, Email\nGabriela, gaby@ejemplo.com\n')
    expect(rows).toEqual([{ first_name: 'Gabriela', email: 'gaby@ejemplo.com' }])
  })

  it('maps the old Spanish headers to the English keys', () => {
    const rows = parseCsv('Nombre,Empresa,Teléfono,Gancho,Segmento,Zona,Asunto,Saludo\nGabriela,Cabrera Llamas,33 2388 2444,Sin portal,customs-brokers,premium-zone,Hola,Hola Gaby\n')
    expect(rows).toEqual([{ first_name: 'Gabriela', company: 'Cabrera Llamas', phone: '33 2388 2444', hook: 'Sin portal', segment: 'customs-brokers', zone: 'premium-zone', subject: 'Hola', greeting: 'Hola Gaby' }])
  })

  it('respects commas inside quotes', () => {
    const rows = parseCsv('company,hook\n"Gil y Gil, S.A.","Cotizan a mano, una por una"\n')
    expect(rows[0].company).toBe('Gil y Gil, S.A.')
    expect(rows[0].hook).toBe('Cotizan a mano, una por una')
  })

  it('handles escaped quotes', () => {
    const rows = parseCsv('hook\n"Le preguntan ""donde va mi carga"" todo el dia"\n')
    expect(rows[0].hook).toBe('Le preguntan "donde va mi carga" todo el dia')
  })

  it('accepts CRLF and files without a final line break', () => {
    const rows = parseCsv('email\r\nuno@ejemplo.com\r\ndos@ejemplo.com')
    expect(rows).toHaveLength(2)
    expect(rows[1].email).toBe('dos@ejemplo.com')
  })

  it('ignores blank lines', () => {
    const rows = parseCsv('email\n\nuno@ejemplo.com\n\n')
    expect(rows).toHaveLength(1)
  })

  it('returns empty if the file is empty', () => {
    expect(parseCsv('')).toEqual([])
  })
})

describe('mapRowsToContacts', () => {
  const row = {
    first_name: 'Gabriela',
    company: 'Cabrera Llamas',
    email: 'Gaby@Ejemplo.com',
    phone: '33 2388 2444',
    hook: 'Sin portal de seguimiento',
    segment: 'customs-brokers',
  }

  it('maps a full row to the shape of the contacts table', () => {
    const { contacts } = mapRowsToContacts([row], { source: 'prospeccion-2026' })

    expect(contacts).toHaveLength(1)
    expect(contacts[0]).toEqual({
      first_name: 'Gabriela',
      last_name: null,
      email: 'gaby@ejemplo.com',
      phone: '33 2388 2444',
      company: 'Cabrera Llamas',
      job_title: null,
      contact_type: 'prospect',
      status: 'no_contact',
      source: 'prospeccion-2026',
      tags: ['customs-brokers'],
      website_url: null,
      instagram_url: null,
      linkedin_url: null,
      social_links: null,
      notes: 'Sin portal de seguimiento',
    })
  })

  it('lowercases the email', () => {
    const { contacts } = mapRowsToContacts([{ email: 'MAYUS@Ejemplo.COM' }])
    expect(contacts[0].email).toBe('mayus@ejemplo.com')
  })

  it('uses no_contact so the contact lands in the first kanban column', () => {
    const { contacts } = mapRowsToContacts([{ email: 'uno@ejemplo.com' }])
    expect(contacts[0].status).toBe('no_contact')
  })

  it('accepts contacts without email if they have a phone', () => {
    const { contacts, skipped } = mapRowsToContacts([
      { company: 'Gamas', phone: '33 3695 2526' },
      row,
    ])

    expect(contacts).toHaveLength(2)
    expect(skipped.noContact).toHaveLength(0)
    const gamas = contacts.find((c) => c.company === 'Gamas')!
    expect(gamas.email).toBeNull()
    expect(gamas.phone).toBe('33 3695 2526')
  })

  it('accepts contacts without email if they have Instagram', () => {
    const { contacts } = mapRowsToContacts([
      { company: 'Brunetta', instagram: 'https://instagram.com/brunettaboutique' },
    ])

    expect(contacts).toHaveLength(1)
    expect(contacts[0].email).toBeNull()
    expect(contacts[0].instagram_url).toBe('https://instagram.com/brunettaboutique')
  })

  it('drops the row without any contact detail', () => {
    const { contacts, skipped } = mapRowsToContacts([{ company: 'Sin datos' }, row])

    expect(contacts).toHaveLength(1)
    expect(skipped.noContact).toHaveLength(1)
    expect(skipped.noContact[0].company).toBe('Sin datos')
  })

  it('does not count several contacts without email as duplicates', () => {
    const { contacts, skipped } = mapRowsToContacts([
      { company: 'Uno', phone: '33 1111 1111' },
      { company: 'Dos', phone: '33 2222 2222' },
    ])

    expect(contacts).toHaveLength(2)
    expect(skipped.duplicate).toHaveLength(0)
  })

  it('drops emails with an invalid format', () => {
    const { contacts, skipped } = mapRowsToContacts([{ email: 'esto-no-es-correo' }])
    expect(contacts).toHaveLength(0)
    expect(skipped.invalidEmail).toEqual(['esto-no-es-correo'])
  })

  it('drops repeats within the CSV because email is UNIQUE', () => {
    const { contacts, skipped } = mapRowsToContacts([
      { email: 'uno@ejemplo.com', company: 'A' },
      { email: 'UNO@ejemplo.com', company: 'B' },
    ])

    expect(contacts).toHaveLength(1)
    expect(contacts[0].company).toBe('A')
    expect(skipped.duplicate).toEqual(['uno@ejemplo.com'])
  })

  it('turns empty fields into null, not an empty string', () => {
    const { contacts } = mapRowsToContacts([{ email: 'uno@ejemplo.com', first_name: '   ', company: '' }])
    expect(contacts[0].first_name).toBeNull()
    expect(contacts[0].company).toBeNull()
  })

  it('combines the base tags with the segment one', () => {
    const { contacts } = mapRowsToContacts([row], { tags: ['gdl'] })
    expect(contacts[0].tags).toEqual(['gdl', 'customs-brokers'])
  })

  it('leaves tags as null when there are none', () => {
    const { contacts } = mapRowsToContacts([{ email: 'uno@ejemplo.com' }])
    expect(contacts[0].tags).toBeNull()
  })

  it('allows overriding type and status', () => {
    const { contacts } = mapRowsToContacts([row], { contactType: 'lead', status: 'qualification' })
    expect(contacts[0].contact_type).toBe('lead')
    expect(contacts[0].status).toBe('qualification')
  })
})

describe('WhatsApp in the import', () => {
  it("stores WhatsApp as a contact channel and it's enough to add the contact", () => {
    const { contacts, skipped } = mapRowsToContacts([{ company: 'Ferretería X', whatsapp: '523312345678' }])
    expect(skipped.noContact).toHaveLength(0)
    expect(contacts[0].social_links).toEqual([{ platform: 'whatsapp', url: '+523312345678' }])
    expect(contacts[0].email).toBeNull()
  })
})
