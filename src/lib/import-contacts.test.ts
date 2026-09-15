import { describe, it, expect } from 'vitest'
import { mapRowsToContacts, parseCsv } from './import-contacts'

describe('parseCsv', () => {
  it('lee encabezados en minusculas y recorta espacios', () => {
    const rows = parseCsv('Nombre, Email\nGabriela, gaby@ejemplo.com\n')
    expect(rows).toEqual([{ nombre: 'Gabriela', email: 'gaby@ejemplo.com' }])
  })

  it('respeta comas dentro de comillas', () => {
    const rows = parseCsv('empresa,gancho\n"Gil y Gil, S.A.","Cotizan a mano, una por una"\n')
    expect(rows[0].empresa).toBe('Gil y Gil, S.A.')
    expect(rows[0].gancho).toBe('Cotizan a mano, una por una')
  })

  it('interpreta las comillas escapadas', () => {
    const rows = parseCsv('gancho\n"Le preguntan ""donde va mi carga"" todo el dia"\n')
    expect(rows[0].gancho).toBe('Le preguntan "donde va mi carga" todo el dia')
  })

  it('acepta CRLF y archivos sin salto final', () => {
    const rows = parseCsv('email\r\nuno@ejemplo.com\r\ndos@ejemplo.com')
    expect(rows).toHaveLength(2)
    expect(rows[1].email).toBe('dos@ejemplo.com')
  })

  it('ignora lineas en blanco', () => {
    const rows = parseCsv('email\n\nuno@ejemplo.com\n\n')
    expect(rows).toHaveLength(1)
  })

  it('devuelve vacio si el archivo esta vacio', () => {
    expect(parseCsv('')).toEqual([])
  })
})

describe('mapRowsToContacts', () => {
  const fila = {
    nombre: 'Gabriela',
    empresa: 'Cabrera Llamas',
    email: 'Gaby@Ejemplo.com',
    telefono: '33 2388 2444',
    gancho: 'Sin portal de seguimiento',
    segmento: 'aduanal',
  }

  it('mapea una fila completa a la forma de la tabla contacts', () => {
    const { contacts } = mapRowsToContacts([fila], { source: 'prospeccion-2026' })

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
      tags: ['aduanal'],
      website_url: null,
      notes: 'Sin portal de seguimiento',
    })
  })

  it('normaliza el correo a minusculas', () => {
    const { contacts } = mapRowsToContacts([{ email: 'MAYUS@Ejemplo.COM' }])
    expect(contacts[0].email).toBe('mayus@ejemplo.com')
  })

  it('usa no_contact para que el contacto caiga en la primera columna del kanban', () => {
    const { contacts } = mapRowsToContacts([{ email: 'uno@ejemplo.com' }])
    expect(contacts[0].status).toBe('no_contact')
  })

  it('descarta filas sin correo porque la columna es NOT NULL', () => {
    const { contacts, skipped } = mapRowsToContacts([
      { empresa: 'Gamas', telefono: '33 3695 2526' },
      fila,
    ])

    expect(contacts).toHaveLength(1)
    expect(skipped.noEmail).toHaveLength(1)
    expect(skipped.noEmail[0].empresa).toBe('Gamas')
  })

  it('descarta correos con formato invalido', () => {
    const { contacts, skipped } = mapRowsToContacts([{ email: 'esto-no-es-correo' }])
    expect(contacts).toHaveLength(0)
    expect(skipped.invalidEmail).toEqual(['esto-no-es-correo'])
  })

  it('descarta repetidos dentro del CSV porque email es UNIQUE', () => {
    const { contacts, skipped } = mapRowsToContacts([
      { email: 'uno@ejemplo.com', empresa: 'A' },
      { email: 'UNO@ejemplo.com', empresa: 'B' },
    ])

    expect(contacts).toHaveLength(1)
    expect(contacts[0].company).toBe('A')
    expect(skipped.duplicate).toEqual(['uno@ejemplo.com'])
  })

  it('convierte campos vacios en null, no en cadena vacia', () => {
    const { contacts } = mapRowsToContacts([{ email: 'uno@ejemplo.com', nombre: '   ', empresa: '' }])
    expect(contacts[0].first_name).toBeNull()
    expect(contacts[0].company).toBeNull()
  })

  it('combina las etiquetas base con la del segmento', () => {
    const { contacts } = mapRowsToContacts([fila], { tags: ['gdl'] })
    expect(contacts[0].tags).toEqual(['gdl', 'aduanal'])
  })

  it('deja tags en null cuando no hay ninguna', () => {
    const { contacts } = mapRowsToContacts([{ email: 'uno@ejemplo.com' }])
    expect(contacts[0].tags).toBeNull()
  })

  it('permite sobreescribir tipo y estado', () => {
    const { contacts } = mapRowsToContacts([fila], { contactType: 'lead', status: 'qualification' })
    expect(contacts[0].contact_type).toBe('lead')
    expect(contacts[0].status).toBe('qualification')
  })
})
