// Mapeo de una lista CSV de prospeccion a filas de la tabla `contacts`.
//
// La logica vive aqui (y no en el script) para poder probarla con vitest.
// El script `scripts/import-contacts.mjs` solo hace la E/S y el POST a Supabase.

export type ContactType = 'lead' | 'prospect' | 'customer' | 'partner'
export type ContactStatus = 'no_contact' | 'qualification' | 'negotiation' | 'closed_won' | 'closed_lost'

/** Fila cruda del CSV, con los encabezados ya normalizados a minusculas. */
export interface CsvRow {
  email?: string
  nombre?: string
  apellido?: string
  empresa?: string
  puesto?: string
  telefono?: string
  sitio?: string
  gancho?: string
  segmento?: string
  [key: string]: string | undefined
}

/** Fila lista para insertarse en `public.contacts`. */
export interface ContactInsert {
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  company: string | null
  job_title: string | null
  contact_type: ContactType
  status: ContactStatus
  source: string | null
  tags: string[] | null
  website_url: string | null
  notes: string | null
}

export interface MapOptions {
  source?: string
  contactType?: ContactType
  status?: ContactStatus
  /** Etiquetas que se agregan a TODAS las filas, ademas de la del segmento. */
  tags?: string[]
}

export interface MapResult {
  contacts: ContactInsert[]
  skipped: {
    /** Filas sin correo: `contacts.email` es NOT NULL, no se pueden insertar. */
    noEmail: CsvRow[]
    /** Correos con formato invalido. */
    invalidEmail: string[]
    /** Correos repetidos dentro del mismo CSV: `email` es UNIQUE. */
    duplicate: string[]
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value: string | undefined): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Convierte filas del CSV en filas de `contacts`, descartando las que la base
 * no aceptaria. El estado default es `no_contact` (no el `'active'` que trae la
 * columna en la base) porque el kanban del CRM solo agrupa por los estados de
 * ContactStatus; un contacto en `'active'` cae en la columna de descarte.
 */
export function mapRowsToContacts(rows: CsvRow[], options: MapOptions = {}): MapResult {
  const {
    source = null,
    contactType = 'prospect',
    status = 'no_contact',
    tags: baseTags = [],
  } = options

  const contacts: ContactInsert[] = []
  const skipped: MapResult['skipped'] = { noEmail: [], invalidEmail: [], duplicate: [] }
  const seen = new Set<string>()

  for (const row of rows) {
    const email = clean(row.email)?.toLowerCase()

    if (!email) {
      skipped.noEmail.push(row)
      continue
    }
    if (!EMAIL_RE.test(email)) {
      skipped.invalidEmail.push(email)
      continue
    }
    if (seen.has(email)) {
      skipped.duplicate.push(email)
      continue
    }
    seen.add(email)

    const segmento = clean(row.segmento)
    const tags = [...baseTags, ...(segmento ? [segmento] : [])]

    contacts.push({
      first_name: clean(row.nombre),
      last_name: clean(row.apellido),
      email,
      phone: clean(row.telefono),
      company: clean(row.empresa),
      job_title: clean(row.puesto),
      contact_type: contactType,
      status,
      source,
      tags: tags.length > 0 ? tags : null,
      website_url: clean(row.sitio),
      notes: clean(row.gancho),
    })
  }

  return { contacts, skipped }
}

/**
 * Parser de CSV suficiente para estas listas: comillas dobles, comas dentro de
 * comillas, `""` como comilla escapada y saltos de linea CRLF o LF.
 */
export function parseCsv(text: string): CsvRow[] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || char === '\r') {
      // CRLF cuenta como un solo salto.
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else {
      field += char
    }
  }

  // Ultimo campo, si el archivo no termina en salto de linea.
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const nonEmpty = rows.filter((r) => r.some((cell) => cell.trim() !== ''))
  if (nonEmpty.length === 0) return []

  const headers = nonEmpty[0].map((h) => h.trim().toLowerCase())

  return nonEmpty.slice(1).map((cells) => {
    const obj: CsvRow = {}
    headers.forEach((header, idx) => {
      obj[header] = (cells[idx] ?? '').trim()
    })
    return obj
  })
}
