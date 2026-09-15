import { hasLocale } from '../../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SendEmailPageClient } from './send-email-client'
import { CAMPO_ASUNTO, CAMPO_HTML } from '@/lib/prospect-email'
import { contactName } from '@/lib/contact-name'

export default async function SendEmailPage({ params }: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params

  if (!hasLocale(lang)) notFound()

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Verificar que el usuario sea admin
  if (user.user_metadata?.role !== 'admin') {
    redirect(`/${lang}/dashboard/client`)
  }

  // Obtener el contacto
  const { data: contact, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !contact) {
    notFound()
  }

  if (!contact.email) {
    redirect(`/${lang}/dashboard/admin/crm/contacts/${id}`)
  }

  // Correo de prospeccion ya personalizado para este contacto, si la campana lo
  // dejo listo con `pnpm prospects:emails --sync-crm`.
  const { data: customFields } = await supabase
    .from('contact_custom_fields')
    .select('field_name, field_value')
    .eq('contact_id', id)
    .in('field_name', [CAMPO_ASUNTO, CAMPO_HTML])

  const campo = (nombre: string) =>
    customFields?.find((f) => f.field_name === nombre)?.field_value || ''

  const nombre = contactName(contact)

  return (
    <SendEmailPageClient
      contactId={id}
      contactName={nombre}
      contactFirstName={contact.first_name || ''}
      contactEmail={contact.email}
      additionalEmails={contact.additional_emails || []}
      invalidEmails={contact.invalid_emails || []}
      contactCompany={contact.company || ''}
      contactStatus={contact.status}
      prospectSubject={campo(CAMPO_ASUNTO)}
      prospectHtml={campo(CAMPO_HTML)}
      lang={lang}
    />
  )
}
