import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ClientQuotationForm } from '../client-quotation-form'

export default async function NewClientQuotationPage({ params }: {
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

  // Obtener información del usuario
  const userName = user.user_metadata?.full_name || 
                   (user.user_metadata?.first_name && user.user_metadata?.last_name
                     ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                     : user.email?.split('@')[0] || '')
  const userEmail = user.email || ''

  // Obtener empresas del cliente
  const { data: companies } = await supabase
    .from('companies')
    .select('id, name')
    .eq('user_id', user.id)
    .order('name')

  if (!companies || companies.length === 0) {
    redirect(`/${lang}/dashboard/client/companies/new`)
  }

  // Obtener servicios
  const { data: services } = await supabase
    .from('services')
    .select('id, title_es, title_en, slug')
    .order('title_es')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'New Quotation' : 'Nueva Cotización'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en'
            ? 'Create a new quotation by answering the questions'
            : 'Crea una nueva cotización respondiendo las preguntas'}
        </p>
      </div>
      <ClientQuotationForm 
        services={services || []} 
        dict={dict} 
        lang={lang} 
        userId={user.id}
        userName={userName}
        userEmail={userEmail}
        companies={companies}
      />
    </div>
  )
}
