import { hasLocale } from '../../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SendEmailPageClient } from './send-email-client'

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

  const contactName = `${contact.first_name} ${contact.last_name}`

  return (
    <SendEmailPageClient
      contactId={id}
      contactName={contactName}
      contactEmail={contact.email}
      contactCompany={contact.company || ''}
      contactStatus={contact.status}
      lang={lang}
    />
  )
}
