import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { hasLocale } from '@/app/[lang]/dictionaries'
import { ContactMessagesTable } from './contact-messages-table'

export default async function ContactMessagesPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const supabase = await createClient()

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Obtener mensajes de contacto
  const { data: messages, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contact messages:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Contact Messages' : 'Mensajes de Contacto'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {lang === 'en'
            ? 'Manage messages received from the contact form'
            : 'Gestiona los mensajes recibidos desde el formulario de contacto'}
        </p>
      </div>

      <ContactMessagesTable messages={messages || []} lang={lang} />
    </div>
  )
}
