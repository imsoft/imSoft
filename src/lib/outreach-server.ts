/**
 * Email prospecting: drafts, sending through Gmail and follow-ups. Server only.
 */
import Anthropic from '@anthropic-ai/sdk'
import { resolveMx } from 'node:dns/promises'
import type { SupabaseClient } from '@supabase/supabase-js'
import { sendRaw, threadStatus, messageIdHeader, recentBounces } from '@/lib/gmail/server'
import { HOOK_TOOL, listingFromNotes, hookFromNotes, cleanOpener, cleanHook, notesWithoutListing, defaultQuestion, openerPrompt, hookPrompt } from '@/lib/outreach-ai'
import { emailStatusOf, shortDate, type EmailRow } from '@/lib/email-status'
import { isNonSalesMailbox } from '@/lib/invalid-email'
import { searchPlaces, placesConfigured } from '@/lib/places-server'
import { googleListing, normalizedName } from '@/lib/places'
import { socialQueue, countByChannel, socialIndustry, SOCIAL_DISCARD_REASONS, offerOf, renderSocialMessage, SOCIAL_DISCARDED_TAG, CHANNEL_DAILY_CAP, type Channel, type SocialDiscardReason, type QueueContact, type QueueRow, type Offer } from '@/lib/social-message'
import { emailDomain, buildMime, bodyOf, nextStepDate, renderFromBody, renderOutreach, segmentOf, dailyCap, type Step } from '@/lib/outreach'

const TZ = 'America/Mexico_City'

/** Local date (YYYY-MM-DD) in Guadalajara. */
export function localToday(d = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: TZ })
}

export interface MinContact {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  company: string | null
  job_title: string | null
  website_url: string | null
  notes: string | null
  tags: string[] | null
  phone?: string | null
}

export const CONTACT_COLUMNS = 'id, first_name, last_name, email, phone, company, job_title, website_url, notes, tags'

export function firstNameOf(c: Pick<MinContact, 'first_name'>): string {
  return (c.first_name ?? '').trim().split(/\s+/)[0] ?? ''
}

/** How many went out today and how many fit, based on the ramp since the first send. */
export async function campaignStatus(db: SupabaseClient) {
  const { data: first } = await db.from('outreach_emails').select('sent_at').not('sent_at', 'is', null).order('sent_at', { ascending: true }).limit(1).maybeSingle()
  const today = localToday()
  const startOfToday = new Date(`${today}T00:00:00-06:00`).toISOString()
  const { count } = await db.from('outreach_emails').select('id', { count: 'exact', head: true }).not('sent_at', 'is', null).gte('sent_at', startOfToday)
  const days = first?.sent_at ? Math.floor((Date.now() - Date.parse(first.sent_at)) / 86_400_000) : 0
  const cap = dailyCap(days)
  return { today, sentToday: count ?? 0, cap, daysSinceFirstSend: days, remainingToday: Math.max(0, cap - (count ?? 0)) }
}

/**
 * The email's domain exists and accepts mail (has MX). Avoids bounces like
 * info@gombienesraices.com, whose domain doesn't exist. A network failure counts as valid
 * so a transient problem doesn't block drafts.
 */
export async function domainAcceptsMail(email: string | null | undefined, resolver: (d: string) => Promise<unknown[]> = resolveMx): Promise<boolean> {
  const domain = emailDomain(email)
  if (!domain) return false
  try {
    const mx = (await resolver(domain)) as Array<{ exchange?: string }>
    // Null MX (".") or pointing at the machine itself: the domain declares it accepts no mail.
    return mx.some((r) => { const h = (r.exchange ?? '').toLowerCase().replace(/\.$/, ''); return h !== '' && h !== 'localhost' })
  } catch (err) {
    const code = (err as { code?: string }).code
    return !(code === 'ENOTFOUND' || code === 'ENODATA')
  }
}

async function discardIfUndeliverable(db: SupabaseClient, c: MinContact): Promise<boolean> {
  // Privacy, billing, HR or legal mailbox: it exists, but it's not who to write to.
  if (!isNonSalesMailbox(c.email) && (await domainAcceptsMail(c.email))) return false
  await db.from('contacts').update({ tags: [...new Set([...(c.tags ?? []), 'invalid-email'])], ...(c.email ? { invalid_emails: [c.email.toLowerCase()] } : {}), updated_at: new Date().toISOString() }).eq('id', c.id)
  return true
}

/** Hook from Claude when the contact doesn't have one in its notes. */
export async function hookWithAI(c: MinContact, offer: Offer | null = null): Promise<string> {
  const client = new Anthropic()
  const msg = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 300,
    tools: [HOOK_TOOL],
    tool_choice: { type: 'tool', name: HOOK_TOOL.name },
    messages: [{ role: 'user', content: hookPrompt({ name: firstNameOf(c), company: c.company ?? '', segment: segmentOf(c.tags) ?? socialIndustry(c.tags), website: c.website_url, notes: (c.notes ?? '').slice(0, 1500), jobTitle: c.job_title, offer }) }],
  })
  const tool = msg.content.find((b) => b.type === 'tool_use')
  return cleanHook(tool && tool.type === 'tool_use' ? tool.input : null)
}

/**
 * Creates step 1 drafts for uncontacted prospects that don't have any yet. The hook comes
 * from the CRM notes; if there's none, the AI proposes it.
 */
export async function createStep1Drafts(db: SupabaseClient, limit: number, campaign?: string | null) {
  const { data: existing } = await db.from('outreach_emails').select('contact_id')
  const alreadyHave = new Set((existing ?? []).map((r) => r.contact_id as string))
  const { data: contacts, error } = await db.from('contacts').select(CONTACT_COLUMNS).eq('contact_type', 'prospect').eq('status', 'no_contact').not('email', 'is', null).order('created_at', { ascending: true }).limit(400)
  if (error) throw new Error(error.message)
  const candidates = ((contacts ?? []) as MinContact[]).filter((c) => !alreadyHave.has(c.id) && c.email && !(c.tags ?? []).includes('invalid-email')).slice(0, limit)
  const created: string[] = []
  const errors: string[] = []
  for (const c of candidates) {
    try {
      if (await discardIfUndeliverable(db, c)) {
        errors.push(`${c.company ?? c.email}: ${c.email} ${isNonSalesMailbox(c.email) ? 'es un buzón de privacidad, facturación, RH o legal' : 'está en un dominio que no recibe correo'}; se marcó como correo inválido`)
        continue
      }
      const hook = hookFromNotes(c.notes) ?? (await hookWithAI(c))
      const r = renderOutreach(1, { name: firstNameOf(c), company: c.company ?? '', hook, segment: segmentOf(c.tags) })
      const { error: e } = await db.from('outreach_emails').insert({ contact_id: c.id, step: 1, status: 'draft', campaign: campaign ?? segmentOf(c.tags), hook, subject: r.subject, html: r.html, text: r.text, scheduled_for: localToday() })
      if (e) throw new Error(e.message)
      created.push(c.id)
    } catch (err) {
      errors.push(`${c.company ?? c.email}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  return { created: created.length, errors, noCandidates: candidates.length === 0 }
}

/**
 * Draft for a specific contact (from the table or the contact page), regardless of its
 * status. If it already has a pending one, returns it. If it was already written to, it
 * only creates the follow-up when explicitly asked (`followUp`): batch sending must not
 * bring follow-ups forward by accident.
 */
export async function createDraftForContact(db: SupabaseClient, contactId: string, opts: { followUp?: boolean } = {}) {
  const { data: previous } = await db.from('outreach_emails').select('id, step, status, sent_at, hook, campaign').eq('contact_id', contactId).order('step', { ascending: false })
  const status = emailStatusOf((previous ?? []) as EmailRow[])
  if (status.type === 'draft') return { id: status.draftId, existing: true }
  if (status.type === 'replied') throw new Error('Este contacto ya respondió: contéstale desde Gmail, en el mismo hilo.')
  if (status.type === 'finished') throw new Error('Ya se le mandaron los correos de la secuencia; no hay más seguimientos.')
  if (status.type === 'sent') {
    if (!opts.followUp) throw new Error(`Ya se le escribió el ${shortDate(status.date)}; su seguimiento toca el ${shortDate(status.dueOn)}.`)
    const { data: c } = await db.from('contacts').select(CONTACT_COLUMNS).eq('id', contactId).maybeSingle()
    if (!c) throw new Error('Contacto no encontrado')
    if ((c.tags ?? []).includes('invalid-email')) throw new Error('El correo de este contacto está marcado como inválido')
    const first = (previous ?? []).find((r) => r.step === 1) ?? (previous ?? [])[0]
    const hook = hookFromNotes(first?.hook as string | null) ?? hookFromNotes(c.notes) ?? (await hookWithAI(c as MinContact))
    const r = renderOutreach(status.nextStep, { name: firstNameOf(c), company: c.company ?? '', hook, segment: segmentOf(c.tags) })
    const { data, error } = await db.from('outreach_emails').insert({ contact_id: c.id, step: status.nextStep, status: 'draft', campaign: first?.campaign ?? segmentOf(c.tags), hook, subject: r.subject, html: r.html, text: r.text, scheduled_for: localToday() }).select('id').single()
    if (error) throw new Error(error.message)
    return { id: data.id as string, existing: false, followUp: status.nextStep - 1, early: status.dueOn > localToday() ? status.dueOn : null }
  }
  const { data: c } = await db.from('contacts').select(CONTACT_COLUMNS).eq('id', contactId).maybeSingle()
  if (!c) throw new Error('Contacto no encontrado')
  if (!c.email) throw new Error('El contacto no tiene correo')
  if ((c.tags ?? []).includes('invalid-email')) throw new Error('El correo de este contacto está marcado como inválido')
  if (await discardIfUndeliverable(db, c as MinContact)) throw new Error(isNonSalesMailbox(c.email) ? `${c.email} es un buzón de privacidad, facturación, RH o legal, no de ventas. Lo marqué como correo inválido; escríbele por redes si tiene.` : `El dominio de ${c.email} no existe o no recibe correo. Lo marqué como correo inválido; escríbele por redes si tiene.`)
  const hook = hookFromNotes(c.notes) ?? (await hookWithAI(c as MinContact))
  const r = renderOutreach(1, { name: firstNameOf(c), company: c.company ?? '', hook, segment: segmentOf(c.tags) })
  const { data, error } = await db.from('outreach_emails').insert({ contact_id: c.id, step: 1, status: 'draft', campaign: segmentOf(c.tags), hook, subject: r.subject, html: r.html, text: r.text, scheduled_for: localToday() }).select('id').single()
  if (error) throw new Error(error.message)
  return { id: data.id as string, existing: false }
}

/** Sends a draft through Gmail, records it in the CRM and schedules the next step. */
export async function sendDraft(db: SupabaseClient, userId: string, id: string) {
  const { data: row } = await db.from('outreach_emails').select('*').eq('id', id).maybeSingle()
  if (!row) throw new Error('Borrador no encontrado')
  if (row.status !== 'draft') throw new Error('Este correo ya no es un borrador')
  const campaign = await campaignStatus(db)
  if (campaign.remainingToday <= 0) throw new Error(`Ya mandaste ${campaign.sentToday} hoy; el tope de hoy es ${campaign.cap}. Mañana sigues.`)
  const { data: c } = await db.from('contacts').select(CONTACT_COLUMNS).eq('id', row.contact_id).maybeSingle()
  if (!c?.email) throw new Error('El contacto no tiene correo')

  // Follow-ups: in the same thread as the first email.
  let inReplyTo: string | null = null
  let threadId: string | null = null
  if (row.step > 1) {
    const { data: prev } = await db.from('outreach_emails').select('gmail_message_id, gmail_thread_id').eq('contact_id', row.contact_id).eq('step', row.step - 1).maybeSingle()
    if (prev?.gmail_message_id) {
      threadId = prev.gmail_thread_id
      inReplyTo = await messageIdHeader(userId, prev.gmail_message_id)
    }
  }
  const { data: account } = await db.from('gmail_accounts').select('email').eq('user_id', userId).maybeSingle()
  if (!account) throw new Error('No hay una cuenta de Gmail conectada')
  const raw = buildMime({ from: `Brandon García · imSoft <${account.email}>`, to: c.email, subject: row.subject, text: row.text, html: row.html, inReplyTo })
  const sent = await sendRaw(userId, raw, threadId)
  const now = new Date()
  await db.from('outreach_emails').update({ status: 'sent', sent_at: now.toISOString(), sent_via: 'gmail', gmail_message_id: sent.id, gmail_thread_id: sent.threadId, updated_at: now.toISOString() }).eq('id', id)
  await db.from('contact_emails').insert({ contact_id: row.contact_id, status: 'sent', subject: row.subject, body: row.html, sent_at: now.toISOString(), sent_by: userId })
  await db.from('contacts').update({ status: 'qualification', updated_at: now.toISOString() }).eq('id', row.contact_id).eq('status', 'no_contact')
  return { id: sent.id, threadId: sent.threadId, next: row.step < 3 ? nextStepDate(now, (row.step + 1) as 2 | 3) : null }
}

/**
 * The draft was sent outside the system (copied to Gmail, WhatsApp...): it's recorded as
 * sent by hand with the same effect as sending through Gmail, except for the thread (there's none).
 */
export async function markSentManually(db: SupabaseClient, userId: string, id: string) {
  const { data: row } = await db.from('outreach_emails').select('*').eq('id', id).maybeSingle()
  if (!row) throw new Error('Borrador no encontrado')
  if (row.status !== 'draft') throw new Error('Este correo ya no es un borrador')
  const now = new Date()
  await db.from('outreach_emails').update({ status: 'sent', sent_at: now.toISOString(), sent_via: 'manual', updated_at: now.toISOString() }).eq('id', id)
  await db.from('contact_emails').insert({ contact_id: row.contact_id, status: 'sent', subject: row.subject, body: row.html, sent_at: now.toISOString(), sent_by: userId })
  await db.from('contacts').update({ status: 'qualification', updated_at: now.toISOString() }).eq('id', row.contact_id).eq('status', 'no_contact')
  return { next: row.step < 3 ? nextStepDate(now, (row.step + 1) as 2 | 3) : null }
}

/** Opener (real observation + question) from Claude, based on the Google listing and the notes. */
export async function openerWithAI(c: MinContact, data: string | null, offer: Offer | null): Promise<string> {
  const client = new Anthropic()
  const msg = await client.messages.create({
    model: 'claude-opus-5',
    max_tokens: 200,
    tools: [HOOK_TOOL],
    tool_choice: { type: 'tool', name: HOOK_TOOL.name },
    messages: [{ role: 'user', content: openerPrompt({ company: c.company ?? '', segment: segmentOf(c.tags) ?? socialIndustry(c.tags), data, notes: notesWithoutListing(c.notes).slice(0, 600), offer }) }],
  })
  const tool = msg.content.find((b) => b.type === 'tool_use')
  const text = cleanOpener(tool && tool.type === 'tool_use' ? tool.input : null)
  // Without a question there's no conversation: the industry's default one is appended.
  return /\?\s*$/.test(text) ? text : `${text.replace(/\.?\s*$/, '.')} ${defaultQuestion(segmentOf(c.tags) ?? socialIndustry(c.tags), offer)}`
}

/**
 * If the contact doesn't have its Google listing (prospects from before 2026-10-30), it
 * looks it up in Places by name and city and saves it in the notes for next time.
 */
async function googleListingFor(db: SupabaseClient, c: MinContact): Promise<string | null> {
  const saved = listingFromNotes(c.notes)
  if (saved || !placesConfigured() || !c.company) return saved
  try {
    const candidates = await searchPlaces(c.company, 'zmg', 5)
    const k = normalizedName(c.company)
    const hit = candidates.find((x) => normalizedName(x.name).includes(k) || k.includes(normalizedName(x.name)))
    const listing = hit ? googleListing(hit) : null
    if (listing) await db.from('contacts').update({ notes: [c.notes?.trim(), listing].filter(Boolean).join('\n'), updated_at: new Date().toISOString() }).eq('id', c.id)
    return listing
  } catch {
    return null
  }
}

/**
 * First prospecting message for a social network: opener with a real fact about the
 * business and a question, plus an introduction line (see renderSocialMessage). If
 * Brandon left a hand-written hook in the notes, that one is used.
 */
export async function socialMessageFor(db: SupabaseClient, contactId: string, channel: Channel) {
  const { data: c } = await db.from('contacts').select(CONTACT_COLUMNS).eq('id', contactId).maybeSingle()
  if (!c) throw new Error('Contacto no encontrado')
  const offer = offerOf(c.tags)
  const segment = segmentOf(c.tags) ?? socialIndustry(c.tags)
  const listing = await googleListingFor(db, c as MinContact)
  const hook = hookFromNotes(c.notes) || (await openerWithAI(c as MinContact, listing, offer))
  return { text: renderSocialMessage(channel, { name: firstNameOf(c), company: c.company ?? '', hook, segment, offer }), hook }
}

/** Social messages recorded today (Guadalajara time) and in the last 7 days, per channel. */
export async function socialMessageCounts(db: SupabaseClient) {
  const today = localToday()
  const startOfToday = new Date(`${today}T00:00:00-06:00`)
  const sevenDaysAgo = new Date(startOfToday.getTime() - 6 * 86_400_000)
  const { data } = await db.from('activities').select('subject, completed_at').like('subject', 'Mensaje por %').gte('completed_at', sevenDaysAgo.toISOString()).limit(2000)
  const rows = data ?? []
  return {
    today: countByChannel(rows.filter((f) => new Date(f.completed_at as string) >= startOfToday).map((f) => f.subject as string)),
    week: countByChannel(rows.map((f) => f.subject as string)),
    caps: CHANNEL_DAILY_CAP,
  }
}

/**
 * Uncontacted prospects that can be written to on WhatsApp or Instagram, in the order they
 * should be handled. `total` is how many are in the queue; `rows` holds at most `limit`.
 */
export async function socialQueueProspects(db: SupabaseClient, limit = 25): Promise<{ rows: QueueRow[]; total: number }> {
  const { data } = await db
    .from('contacts')
    .select('id, first_name, last_name, company, email, phone, instagram_url, social_links, tags')
    .eq('contact_type', 'prospect')
    .eq('status', 'no_contact')
    .order('created_at', { ascending: true })
    .limit(1000)
  const queue = socialQueue((data ?? []) as QueueContact[])
  return { rows: queue.slice(0, limit), total: queue.length }
}

/** The message was already sent on the network: it goes into the history and the prospect moves to qualification. */
export async function recordSocialMessage(db: SupabaseClient, userId: string, contactId: string, channel: Channel, text: string, label: string) {
  const now = new Date().toISOString()
  const { error } = await db.from('activities').insert({ contact_id: contactId, activity_type: 'note', subject: `Mensaje por ${label}`, description: text, status: 'completed', completed_at: now, created_by: userId })
  if (error) throw new Error(error.message)
  await db.from('contacts').update({ status: 'qualification', updated_at: now }).eq('id', contactId).eq('status', 'no_contact')
  return { ok: true }
}

/**
 * Takes the contact out of the social queue without pretending it was written to: adds
 * the `social-discarded` tag, leaves the reason in its history and doesn't touch its status.
 */
export async function discardFromSocial(db: SupabaseClient, userId: string, contactId: string, reason: SocialDiscardReason) {
  const { data: c } = await db.from('contacts').select('id, tags').eq('id', contactId).maybeSingle()
  if (!c) throw new Error('Contacto no encontrado')
  const now = new Date().toISOString()
  const { error } = await db.from('contacts').update({ tags: [...new Set([...((c.tags as string[] | null) ?? []), SOCIAL_DISCARDED_TAG])], updated_at: now }).eq('id', contactId)
  if (error) throw new Error(error.message)
  await db.from('activities').insert({ contact_id: contactId, activity_type: 'note', subject: 'Descartado de la cola de redes', description: SOCIAL_DISCARD_REASONS[reason], status: 'completed', completed_at: now, created_by: userId })
  return { ok: true }
}

/** Rebuilds subject, text and html from the edited body. */
export async function editDraft(db: SupabaseClient, id: string, changes: { subject?: string; body?: string; scheduled_for?: string }) {
  const { data: row } = await db.from('outreach_emails').select('id, step, status, subject, text, contact_id').eq('id', id).maybeSingle()
  if (!row) throw new Error('Borrador no encontrado')
  if (row.status !== 'draft') throw new Error('Solo se editan borradores')
  const { data: c } = await db.from('contacts').select('company').eq('id', row.contact_id).maybeSingle()
  const r = renderFromBody(row.step as Step, { subject: changes.subject ?? row.subject, body: changes.body ?? bodyOf(row.text), company: c?.company ?? '' })
  const upd: Record<string, unknown> = { subject: r.subject, text: r.text, html: r.html, updated_at: new Date().toISOString() }
  if (changes.scheduled_for && /^\d{4}-\d{2}-\d{2}$/.test(changes.scheduled_for)) upd.scheduled_for = changes.scheduled_for
  const { error } = await db.from('outreach_emails').update(upd).eq('id', id)
  if (error) throw new Error(error.message)
  return r
}

/**
 * 1) Checks Gmail for replies in open threads and closes those contacts.
 * 2) Creates the follow-up drafts that are already due (4 and 6 business days).
 * 3) Closes those that already got the 3 emails without a reply.
 */
export async function syncOutreach(db: SupabaseClient, userId: string) {
  const res = { replied: 0, bounced: 0, followUpsCreated: 0, closed: 0, errors: [] as string[] }
  const { data: sent } = await db.from('outreach_emails').select('*').eq('status', 'sent').order('sent_at', { ascending: true })
  const byContact = new Map<string, typeof sent>()
  for (const r of sent ?? []) byContact.set(r.contact_id, [...(byContact.get(r.contact_id) ?? []), r])

  // Bounces that arrived as a separate email (outside the thread) or from sends made by hand.
  try {
    const failed = await recentBounces(userId)
    if (failed.length) {
      const { data: affected } = await db.from('contacts').select('id, email, tags').in('email', failed)
      for (const c of affected ?? []) {
        if (((c.tags as string[] | null) ?? []).includes('invalid-email')) continue
        await markBounce(db, c.id as string, c.tags as string[] | null)
        byContact.delete(c.id as string)
        res.bounced += 1
      }
    }
  } catch (err) {
    res.errors.push(`rebotes: ${err instanceof Error ? err.message : String(err)}`)
  }

  const { data: contacts } = await db.from('contacts').select(CONTACT_COLUMNS).in('id', [...byContact.keys()].length ? [...byContact.keys()] : ['00000000-0000-0000-0000-000000000000'])
  const contactById = new Map(((contacts ?? []) as MinContact[]).map((c) => [c.id, c]))
  const today = localToday()

  for (const [contactId, rows] of byContact) {
    const last = rows![rows!.length - 1]
    try {
      const thread = rows!.find((f) => f.gmail_thread_id)?.gmail_thread_id as string | undefined
      const threadState = thread ? await threadStatus(userId, thread) : null
      if (threadState === 'bounce') {
        await markBounce(db, contactId, contactById.get(contactId)?.tags ?? null)
        res.bounced += 1
        continue
      }
      if (threadState === 'reply') {
        const now = new Date().toISOString()
        await db.from('outreach_emails').update({ status: 'replied', replied_at: now, updated_at: now }).eq('contact_id', contactId).eq('status', 'sent')
        await db.from('outreach_emails').update({ status: 'skipped', updated_at: now }).eq('contact_id', contactId).eq('status', 'draft')
        res.replied += 1
        continue
      }
      if (last.step >= 3) {
        if (nextStepDate(new Date(last.sent_at), 3) <= today) {
          await db.from('outreach_emails').update({ status: 'closed', updated_at: new Date().toISOString() }).eq('contact_id', contactId).eq('status', 'sent')
          res.closed += 1
        }
        continue
      }
      const next = (last.step + 1) as 2 | 3
      const due = nextStepDate(new Date(last.sent_at), next)
      if (due > today) continue
      const { data: existing } = await db.from('outreach_emails').select('id').eq('contact_id', contactId).eq('step', next).maybeSingle()
      if (existing) continue
      const c = contactById.get(contactId)
      if (!c) continue
      const hook = hookFromNotes(rows![0].hook as string | null) ?? hookFromNotes(c.notes) ?? (await hookWithAI(c))
      const r = renderOutreach(next, { name: firstNameOf(c), company: c.company ?? '', hook, segment: segmentOf(c.tags) })
      const { error } = await db.from('outreach_emails').insert({ contact_id: contactId, step: next, status: 'draft', campaign: rows![0].campaign, hook, subject: r.subject, html: r.html, text: r.text, scheduled_for: due })
      if (error) throw new Error(error.message)
      res.followUpsCreated += 1
    } catch (err) {
      res.errors.push(`${contactById.get(contactId)?.company ?? contactId}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  return res
}

/**
 * The contact's email doesn't exist: its sequence is closed, its drafts are skipped and it
 * gets the `invalid-email` tag, which keeps it out of future drafts. It stays in the CRM in
 * case it has Instagram or a phone.
 */
export async function markBounce(db: SupabaseClient, contactId: string, tags: string[] | null) {
  const now = new Date().toISOString()
  await db.from('outreach_emails').update({ status: 'closed', updated_at: now }).eq('contact_id', contactId).in('status', ['sent', 'replied'])
  await db.from('outreach_emails').update({ status: 'skipped', updated_at: now }).eq('contact_id', contactId).eq('status', 'draft')
  const newTags = [...new Set([...(tags ?? []), 'invalid-email'])]
  const { data: c } = await db.from('contacts').select('email, invalid_emails').eq('id', contactId).maybeSingle()
  const invalid = [...new Set([...((c?.invalid_emails as string[] | null) ?? []), ...(c?.email ? [String(c.email).toLowerCase()] : [])])]
  await db.from('contacts').update({ tags: newTags, invalid_emails: invalid, updated_at: now }).eq('id', contactId)
}

/** Records as sent by hand (step 1) the contacts that were already reached outside the system. */
export async function recordManualSends(db: SupabaseClient, contactIds: string[], sentAt: string) {
  const { data: contacts } = await db.from('contacts').select(CONTACT_COLUMNS).in('id', contactIds)
  let created = 0
  for (const c of (contacts ?? []) as MinContact[]) {
    const hook = hookFromNotes(c.notes) ?? ''
    const r = renderOutreach(1, { name: firstNameOf(c), company: c.company ?? '', hook, segment: segmentOf(c.tags) })
    const { error } = await db.from('outreach_emails').upsert({ contact_id: c.id, step: 1, status: 'sent', campaign: segmentOf(c.tags), hook, subject: r.subject, html: r.html, text: r.text, scheduled_for: sentAt.slice(0, 10), sent_at: sentAt, sent_via: 'manual' }, { onConflict: 'contact_id,step', ignoreDuplicates: true })
    if (!error) created += 1
  }
  return { created }
}
