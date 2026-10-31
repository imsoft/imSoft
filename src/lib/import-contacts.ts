// Mapping of a prospecting CSV list to rows of the `contacts` table.
//
// The logic lives here (and not in the script) so it can be tested with vitest.
// The `scripts/import-contacts.mjs` script only does the I/O and the POST to Supabase.

export type ContactType = 'lead' | 'prospect' | 'customer' | 'partner'
export type ContactStatus = 'no_contact' | 'qualification' | 'negotiation' | 'closed_won' | 'closed_lost'

/** Raw CSV row, with headers already normalized to lowercase English keys. */
export interface CsvRow {
  email?: string
  first_name?: string
  last_name?: string
  company?: string
  job_title?: string
  phone?: string
  website?: string
  hook?: string
  segment?: string
  /** Zone tag ("premium-zone"); set by the prospect search. */
  zone?: string
  instagram?: string
  /** WhatsApp number (digits only, with country code). */
  whatsapp?: string
  facebook?: string
  linkedin?: string
  [key: string]: string | undefined
}

/**
 * Old (Spanish) CSV headers and the English key they map to. Lists made before the
 * rename still import; new lists use the English headers.
 */
export const CSV_HEADER_ALIASES: Record<string, string> = {
  correo: 'email',
  nombre: 'first_name',
  apellido: 'last_name',
  empresa: 'company',
  puesto: 'job_title',
  cargo: 'job_title',
  telefono: 'phone',
  'teléfono': 'phone',
  sitio: 'website',
  gancho: 'hook',
  segmento: 'segment',
  zona: 'zone',
  asunto: 'subject',
  saludo: 'greeting',
}

/** Row ready to be inserted into `public.contacts`. */
export interface ContactInsert {
  first_name: string | null
  last_name: string | null
  /** Null for WhatsApp or Instagram prospects, which don't publish an email. */
  email: string | null
  phone: string | null
  company: string | null
  job_title: string | null
  contact_type: ContactType
  status: ContactStatus
  source: string | null
  tags: string[] | null
  website_url: string | null
  instagram_url: string | null
  linkedin_url: string | null
  /** Extra channels of the contact: the WhatsApp it publishes on its website and its Facebook page. */
  social_links: Array<{ platform: 'whatsapp' | 'facebook'; url: string }> | null
  notes: string | null
}

export interface MapOptions {
  source?: string
  contactType?: ContactType
  status?: ContactStatus
  /** Tags added to ALL rows, besides the segment one. */
  tags?: string[]
}

export interface MapResult {
  contacts: ContactInsert[]
  skipped: {
    /** Rows without any contact detail: no email, no phone, no Instagram. */
    noContact: CsvRow[]
    /** Emails with an invalid format. */
    invalidEmail: string[]
    /** Emails repeated within the same CSV: `email` is UNIQUE. */
    duplicate: string[]
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value: string | undefined): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

/**
 * Turns CSV rows into `contacts` rows, dropping those the database wouldn't accept. The
 * default status is `no_contact` (not the `'active'` the column has in the database)
 * because the CRM kanban only groups by the ContactStatus values; a contact in `'active'`
 * falls into the discard column.
 */
export function mapRowsToContacts(rows: CsvRow[], options: MapOptions = {}): MapResult {
  const {
    source = null,
    contactType = 'prospect',
    status = 'no_contact',
    tags: baseTags = [],
  } = options

  const contacts: ContactInsert[] = []
  const skipped: MapResult['skipped'] = { noContact: [], invalidEmail: [], duplicate: [] }
  const seen = new Set<string>()

  for (const row of rows) {
    const email = clean(row.email)?.toLowerCase()

    const phone = clean(row.phone)
    const instagram = clean(row.instagram)
    const whatsapp = (clean(row.whatsapp) ?? '').replace(/\D/g, '') || null

    // No email is fine: WhatsApp and Instagram prospects are reached by phone or by their
    // profile. Without any of them, the contact is useless.
    if (!email && !phone && !instagram && !whatsapp) {
      skipped.noContact.push(row)
      continue
    }
    if (email && !EMAIL_RE.test(email)) {
      skipped.invalidEmail.push(email)
      continue
    }
    if (email && seen.has(email)) {
      skipped.duplicate.push(email)
      continue
    }
    if (email) seen.add(email)

    const segment = clean(row.segment)
    const zone = clean(row.zone)
    const tags = [...baseTags, ...(segment ? [segment] : []), ...(zone ? [zone] : [])]

    contacts.push({
      first_name: clean(row.first_name),
      last_name: clean(row.last_name),
      email: email ?? null,
      phone,
      company: clean(row.company),
      job_title: clean(row.job_title),
      contact_type: contactType,
      status,
      source,
      tags: tags.length > 0 ? tags : null,
      website_url: clean(row.website),
      instagram_url: instagram,
      linkedin_url: clean(row.linkedin),
      social_links: (() => {
        const links: Array<{ platform: 'whatsapp' | 'facebook'; url: string }> = []
        if (whatsapp) links.push({ platform: 'whatsapp', url: `+${whatsapp}` })
        const facebook = clean(row.facebook)
        if (facebook) links.push({ platform: 'facebook', url: facebook })
        return links.length ? links : null
      })(),
      notes: clean(row.hook),
    })
  }

  return { contacts, skipped }
}

/**
 * CSV parser good enough for these lists: double quotes, commas inside quotes, `""` as an
 * escaped quote and CRLF or LF line breaks. Old Spanish headers are mapped to their
 * English key (see CSV_HEADER_ALIASES).
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
      // CRLF counts as a single line break.
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      field = ''
      rows.push(row)
      row = []
    } else {
      field += char
    }
  }

  // Last field, if the file doesn't end with a line break.
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const nonEmpty = rows.filter((r) => r.some((cell) => cell.trim() !== ''))
  if (nonEmpty.length === 0) return []

  const headers = nonEmpty[0].map((h) => {
    const lower = h.trim().toLowerCase()
    return CSV_HEADER_ALIASES[lower] ?? lower
  })

  return nonEmpty.slice(1).map((cells) => {
    const obj: CsvRow = {}
    headers.forEach((header, idx) => {
      const value = (cells[idx] ?? '').trim()
      // If a list has both the old and the new header, the non-empty one wins.
      if (value !== '' || obj[header] === undefined) obj[header] = value
    })
    return obj
  })
}
