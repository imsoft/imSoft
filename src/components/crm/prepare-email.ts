'use client'

import { toast } from 'sonner'

/**
 * Single entry point for writing to a contact: creates (or fetches) their prospecting
 * draft and returns the URL of the Prospecting tab with that draft open.
 */
export async function prepareEmail(contactId: string, lang: string, opts: { followUp?: boolean } = {}): Promise<string | null> {
  const es = lang !== 'en'
  // The AI takes a few seconds to suggest the hook: without this notice the click looks like it did nothing.
  const notice = toast.loading(opts.followUp ? (es ? 'Preparando el seguimiento…' : 'Preparing the follow-up…') : es ? 'Escribiendo el correo con IA… unos 10 segundos.' : 'Writing the email with AI… about 10 seconds.')
  try {
    const r = await fetch('/api/outreach/drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId, followUp: opts.followUp === true }) })
    const j = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(j.error || r.statusText)
    if (j.existing) toast.info(es ? 'Este contacto ya tenía un borrador.' : 'This contact already has a draft.')
    // Follow-up before its date: allowed, but on purpose.
    if (j.early) toast.warning(es ? `Este seguimiento tocaba el ${j.early}. Insistir antes de tiempo suele molestar; revísalo antes de enviarlo.` : `This follow-up was due on ${j.early}.`, { duration: 10_000 })
    return `/${lang}/dashboard/admin/crm/prospecting?abrir=${j.id}`
  } catch (err) {
    toast.error(err instanceof Error ? err.message : String(err))
    return null
  } finally {
    toast.dismiss(notice)
  }
}
