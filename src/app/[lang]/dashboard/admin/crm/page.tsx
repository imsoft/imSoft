import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ContactsTable } from './contacts/contacts-table'
import { CrmTabs } from './crm-tabs'
import { serviceClient } from '@/lib/quotes/server'
import { emailStatusOf, type EmailRow } from '@/lib/email-status'
import { campaignStatus } from '@/lib/outreach-server'
import { dailyQuota } from '@/lib/batch-send'
import { esAdmin } from '@/lib/roles'

export default async function CRMPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Make sure the user is an admin
  if (!esAdmin(user)) {
    redirect(`/${lang}/dashboard/client`)
  }

  // Fetch all contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  // Where each contact's email sequence stands, to show it in the table.
  // Only the server reads outreach_emails (service role); the admin is already verified.
  const db = serviceClient()
  const [{ data: emails }, campaign] = await Promise.all([
    db.from('outreach_emails').select('id, contact_id, step, status, sent_at, scheduled_for').limit(5000),
    campaignStatus(db),
  ])
  // Daily cap: what was sent today plus the drafts already waiting to go out.
  const pending = (emails ?? []).filter((f) => f.status === 'draft' && String(f.scheduled_for) <= campaign.today).length
  const quota = dailyQuota(campaign.cap, campaign.sentToday, pending)
  const byContact = new Map<string, EmailRow[]>()
  for (const f of (emails ?? []) as Array<EmailRow & { contact_id: string }>) byContact.set(f.contact_id, [...(byContact.get(f.contact_id) ?? []), f])
  const withEmailStatus = (contacts || []).map((c) => ({ ...c, emailStatus: emailStatusOf(byContact.get(c.id) ?? []) }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            CRM
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en'
              ? 'Manage all your contacts, leads, and customers'
              : 'Gestiona todos tus contactos, leads y clientes'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/crm/contacts/new`}>
            <Plus className="mr-1.5 size-4" />
            {lang === 'en' ? 'New Contact' : 'Nuevo Contacto'}
          </Link>
        </Button>
      </div>
      <CrmTabs lang={lang} active="contacts" />
      <ContactsTable contacts={withEmailStatus} dict={dict} lang={lang} quota={quota} />
    </div>
  )
}
