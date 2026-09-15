import { notFound } from 'next/navigation'
import { hasLocale } from '../../../../dictionaries'
import { CrmTabs } from '../crm-tabs'
import { requireAdmin, serviceClient } from '@/lib/quotes/server'
import { cuentaConectada, gmailConfigurado } from '@/lib/gmail/server'
import { CONTACTO_COLS, estadoCampana, type ContactoMin } from '@/lib/outreach-server'
import { Prospeccion, type FilaOutreach } from './prospeccion'

export const dynamic = 'force-dynamic'

export default async function AdminProspeccionPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const auth = await requireAdmin()
  if (!auth.ok) notFound()

  const db = serviceClient()
  const [gmail, campana, { data: filas }, { count: sinContactar }] = await Promise.all([
    cuentaConectada(auth.userId),
    estadoCampana(db),
    db.from('outreach_emails').select('*').in('status', ['draft', 'sent', 'replied']).order('scheduled_for', { ascending: true }).order('step', { ascending: true }).limit(300),
    db.from('contacts').select('id', { count: 'exact', head: true }).eq('contact_type', 'prospect').eq('status', 'no_contact').not('email', 'is', null),
  ])
  const ids = [...new Set((filas ?? []).map((f) => f.contact_id as string))]
  const { data: contactos } = ids.length ? await db.from('contacts').select(CONTACTO_COLS).in('id', ids) : { data: [] }
  const cDe = new Map(((contactos ?? []) as ContactoMin[]).map((c) => [c.id, c]))
  const rows: FilaOutreach[] = (filas ?? []).map((f) => {
    const c = cDe.get(f.contact_id)
    return {
      id: f.id, contact_id: f.contact_id, step: f.step, status: f.status, subject: f.subject, html: f.html, text: f.text, scheduled_for: f.scheduled_for, sent_at: f.sent_at, sent_via: f.sent_via, gancho: f.gancho,
      nombre: [c?.first_name, c?.last_name].filter(Boolean).join(' '), empresa: c?.company ?? '', email: c?.email ?? '',
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
      <CrmTabs lang={lang} activa="prospeccion" />
      <Prospeccion lang={lang} gmail={gmail} gmailConfigurado={gmailConfigurado()} campana={campana} filas={rows} sinContactar={sinContactar ?? 0} />
    </div>
  )
}
