import { notFound } from 'next/navigation'
import { hasLocale } from '../../../../dictionaries'
import { CrmTabs } from '../crm-tabs'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { connectedAccount, gmailConfigured } from '@/lib/gmail/server'
import { CONTACT_COLUMNS, campaignStatus, socialMessageCounts, socialQueueProspects, type MinContact } from '@/lib/outreach-server'
import { Prospecting, type OutreachRow } from './prospecting'

export const dynamic = 'force-dynamic'

export default async function AdminProspectingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const auth = await requireAdmin()
  if (!auth.ok) notFound()

  const db = serviceClient()
  // Drafts are fetched apart from sent emails: with hundreds of emails awaiting a
  // reply, a single limit of 300 left today's drafts out.
  const [gmail, campaign, social, { data: drafts }, { data: sent }, { count: uncontacted }, queue] = await Promise.all([
    connectedAccount(auth.userId),
    campaignStatus(db),
    socialMessageCounts(db),
    db.from('outreach_emails').select('*').eq('status', 'draft').order('scheduled_for', { ascending: true }).order('step', { ascending: true }).limit(500),
    db.from('outreach_emails').select('*').in('status', ['sent', 'replied']).order('scheduled_for', { ascending: false }).order('step', { ascending: true }).limit(300),
    db.from('contacts').select('id', { count: 'exact', head: true }).eq('contact_type', 'prospect').eq('status', 'no_contact').not('email', 'is', null),
    socialQueueProspects(db),
  ])
  const all = [...(drafts ?? []), ...(sent ?? [])]
  const ids = [...new Set((all ?? []).map((f) => f.contact_id as string))]
  const { data: contacts } = ids.length ? await db.from('contacts').select(CONTACT_COLUMNS).in('id', ids) : { data: [] }
  const contactById = new Map(((contacts ?? []) as MinContact[]).map((c) => [c.id, c]))
  const rows: OutreachRow[] = (all ?? []).map((f) => {
    const c = contactById.get(f.contact_id)
    return {
      id: f.id, contact_id: f.contact_id, step: f.step, status: f.status, subject: f.subject, html: f.html, text: f.text, scheduled_for: f.scheduled_for, sent_at: f.sent_at, sent_via: f.sent_via, hook: f.hook,
      name: [c?.first_name, c?.last_name].filter(Boolean).join(' '), company: c?.company ?? '', email: c?.email ?? '',
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">CRM</h1>
        <p className="text-muted-foreground">
          {lang === 'en'
            ? 'Personalized cold emails sent from your Gmail, with two automatic follow-ups.'
            : 'Correos en frío personalizados, enviados desde tu Gmail, con dos seguimientos automáticos.'}
        </p>
      </div>
      <CrmTabs lang={lang} active="prospecting" />
      <Prospecting lang={lang} gmail={gmail} gmailConfigured={gmailConfigured()} campaign={campaign} social={social} rows={rows} uncontacted={uncontacted ?? 0} queue={queue} />
    </div>
  )
}
