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

  // Obtener el deal con el contacto
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .select(`
      *,
      contacts (
        id,
        first_name,
        last_name,
        email,
        company
      )
    `)
    .eq('id', id)
    .single()

  if (dealError || !deal) {
    console.error('Deal fetch error:', dealError)
    notFound()
  }

  if (!deal.contacts?.email) {
    redirect(`/${lang}/dashboard/admin/crm/deals/${id}`)
  }

  // Los valores iniciales se cargarán desde el cliente usando el endpoint
  // Esto evita duplicar la lógica del template

  return (
    <SendEmailPageClient
      dealId={id}
      dealTitle={deal.title}
      contactEmail={deal.contacts.email}
      contactName={`${deal.contacts.first_name} ${deal.contacts.last_name}`}
      initialSubject=""
      initialBody=""
      lang={lang}
    />
  )
}
