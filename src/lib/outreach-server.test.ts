import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/gmail/server', () => ({ sendRaw: vi.fn(), threadStatus: vi.fn(), messageIdHeader: vi.fn(), recentBounces: vi.fn(async () => []) }))
vi.mock('@anthropic-ai/sdk', () => ({ default: class {} }))

import { createDraftForContact, domainAcceptsMail, markSentManually, markBounce, recordSocialMessage } from './outreach-server'

/**
 * Fake Supabase: records what was updated/inserted in each table and returns the requested
 * draft. This tests the effect of "Ya lo envié" without a database.
 */
function fakeDb(draft: Record<string, unknown> | null) {
  const updates: Array<{ table: string; values: Record<string, unknown>; filters: Record<string, unknown> }> = []
  const inserts: Array<{ table: string; values: Record<string, unknown> }> = []
  const from = (table: string) => {
    const filters: Record<string, unknown> = {}
    const q: Record<string, unknown> = {
      select: () => q,
      eq: (col: string, val: unknown) => { filters[col] = val; return q },
      in: (col: string, val: unknown) => { filters[col] = val; return q },
      maybeSingle: async () => ({ data: table === 'outreach_emails' ? draft : null }),
      update: (values: Record<string, unknown>) => { updates.push({ table, values, filters }); return q },
      insert: async (values: Record<string, unknown>) => { inserts.push({ table, values }); return { error: null } },
      then: (ok: (v: unknown) => void) => ok({ error: null }),
    }
    return q
  }
  return { db: { from } as never, updates, inserts }
}

describe('markSentManually', () => {
  const draft = { id: 'b1', contact_id: 'c1', step: 1, status: 'draft', subject: 'Hola', html: '<p>Hola</p>' }

  it('marks the draft as sent by hand, records it in the CRM and moves the prospect to qualification', async () => {
    const { db, updates, inserts } = fakeDb(draft)
    const r = await markSentManually(db, 'u1', 'b1')

    const email = updates.find((u) => u.table === 'outreach_emails')!
    expect(email.values).toMatchObject({ status: 'sent', sent_via: 'manual' })
    expect(email.values.sent_at).toBeTruthy()
    expect(email.filters).toEqual({ id: 'b1' })

    expect(inserts).toEqual([{ table: 'contact_emails', values: expect.objectContaining({ contact_id: 'c1', subject: 'Hola', body: '<p>Hola</p>', status: 'sent', sent_by: 'u1' }) }])

    // Only changes the status of someone still "uncontacted": if they were further along, they're not moved back.
    const contact = updates.find((u) => u.table === 'contacts')!
    expect(contact.values).toMatchObject({ status: 'qualification' })
    expect(contact.filters).toEqual({ id: 'c1', status: 'no_contact' })

    // It's the first email: the follow-up gets scheduled.
    expect(r.next).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('after the last follow-up nothing else is scheduled', async () => {
    const { db } = fakeDb({ ...draft, step: 3 })
    expect((await markSentManually(db, 'u1', 'b1')).next).toBeNull()
  })

  it('rejects what does not exist or is no longer a draft, without touching anything', async () => {
    await expect(markSentManually(fakeDb(null).db, 'u1', 'x')).rejects.toThrow('Borrador no encontrado')
    const sent = fakeDb({ ...draft, status: 'sent' })
    await expect(markSentManually(sent.db, 'u1', 'b1')).rejects.toThrow('ya no es un borrador')
    expect(sent.updates).toEqual([])
    expect(sent.inserts).toEqual([])
  })
})

describe('recordSocialMessage', () => {
  it("leaves the message in the contact's history and moves it to qualification", async () => {
    const { db, updates, inserts } = fakeDb(null)
    await recordSocialMessage(db, 'u1', 'c1', 'instagram', 'Hola, soy Brandon…', 'Instagram')
    expect(inserts).toEqual([{ table: 'activities', values: expect.objectContaining({ contact_id: 'c1', activity_type: 'note', subject: 'Mensaje por Instagram', description: 'Hola, soy Brandon…', status: 'completed', created_by: 'u1' }) }])
    const contact = updates.find((u) => u.table === 'contacts')!
    expect(contact.values).toMatchObject({ status: 'qualification' })
    expect(contact.filters).toEqual({ id: 'c1', status: 'no_contact' })
  })
})

describe('email bounce', () => {
  it('closes the sequence, skips drafts and tags the email as invalid without losing its tags', async () => {
    const { db, updates } = fakeDb(null)
    await markBounce(db, 'c1', ['google-places', 'logistics'])
    const emails = updates.filter((u) => u.table === 'outreach_emails')
    expect(emails.map((u) => [u.values.status, u.filters.status])).toEqual([['closed', ['sent', 'replied']], ['skipped', 'draft']])
    const contact = updates.find((u) => u.table === 'contacts')!
    expect(contact.values.tags).toEqual(['google-places', 'logistics', 'invalid-email'])
    expect(contact.filters).toEqual({ id: 'c1' })
  })
})

describe('the domain accepts mail', () => {
  const notFound = async () => { throw Object.assign(new Error('queryMx ENOTFOUND'), { code: 'ENOTFOUND' }) }
  it('with MX yes; missing domain or no MX no; a network failure does not block the draft', async () => {
    expect(await domainAcceptsMail('a@imsoft.io', async () => [{ exchange: 'smtp.google.com', priority: 1 }])).toBe(true)
    expect(await domainAcceptsMail('info@gombienesraices.com', notFound)).toBe(false)
    expect(await domainAcceptsMail('a@x.mx', async () => { throw Object.assign(new Error('x'), { code: 'ENODATA' }) })).toBe(false)
    expect(await domainAcceptsMail('a@x.mx', async () => [])).toBe(false)
    // Null MX or pointing at localhost: the domain says it accepts no mail.
    expect(await domainAcceptsMail('a@x.mx', async () => [{ exchange: '', priority: 0 }])).toBe(false)
    expect(await domainAcceptsMail('a@x.mx', async () => [{ exchange: 'localhost', priority: 0 }])).toBe(false)
    expect(await domainAcceptsMail('a@x.mx', async () => { throw Object.assign(new Error('x'), { code: 'ETIMEOUT' }) })).toBe(true)
    expect(await domainAcceptsMail('no-es-correo', notFound)).toBe(false)
  })
})

describe('draft for a specific contact', () => {
  /** Minimal Supabase: the contact's previous emails, the contact and the draft insert. */
  function db(previous: Array<Record<string, unknown>>) {
    const inserts: Array<Record<string, unknown>> = []
    const from = (table: string) => {
      const q: Record<string, unknown> = {
        select: () => q,
        eq: () => q,
        order: () => q,
        maybeSingle: async () => ({ data: table === 'contacts' ? { id: 'c1', first_name: 'Laura', email: 'laura@x.mx', company: 'Ferretería X', notes: null, tags: ['hardware-stores'] } : null }),
        insert: (v: Record<string, unknown>) => { inserts.push(v); return { select: () => ({ single: async () => ({ data: { id: 'new' }, error: null }) }) } },
        then: (ok: (v: unknown) => void) => ok({ data: table === 'outreach_emails' ? previous : null, error: null }),
      }
      return q
    }
    return { db: { from } as never, inserts }
  }
  const sent = { id: 'e1', step: 1, status: 'sent', sent_at: '2026-09-24T19:14:00Z', hook: 'Las cotizaciones se arman a mano.', campaign: 'hardware-stores' }

  it('if already written to, without asking it creates nothing and says when the follow-up is due', async () => {
    const { db: d, inserts } = db([sent])
    await expect(createDraftForContact(d, 'c1')).rejects.toThrow('Ya se le escribió el 24 sep; su seguimiento toca el 30 sep.')
    expect(inserts).toEqual([])
  })

  it("asking for a follow-up creates step 2 with the same hook and in the campaign's thread", async () => {
    const { db: d, inserts } = db([sent])
    const r = await createDraftForContact(d, 'c1', { followUp: true })
    expect(r).toMatchObject({ id: 'new', existing: false, followUp: 1 })
    expect(inserts[0]).toMatchObject({ contact_id: 'c1', step: 2, status: 'draft', hook: 'Las cotizaciones se arman a mano.', campaign: 'hardware-stores' })
    expect(String(inserts[0].subject)).toMatch(/^Re: /)
  })

  it('with a pending draft it returns that one; if it replied or the sequence finished, it does not write', async () => {
    expect(await createDraftForContact(db([sent, { id: 'e2', step: 2, status: 'draft', sent_at: null }]).db, 'c1', { followUp: true })).toEqual({ id: 'e2', existing: true })
    await expect(createDraftForContact(db([{ ...sent, status: 'replied' }]).db, 'c1', { followUp: true })).rejects.toThrow('ya respondió')
    await expect(createDraftForContact(db([{ ...sent, status: 'closed' }]).db, 'c1', { followUp: true })).rejects.toThrow('no hay más seguimientos')
  })
})
