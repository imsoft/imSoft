import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminCompanyForm } from '../company-form'

export default async function NewAdminCompanyPage({ params }: {
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

  // Verificar que sea admin
  if (user.user_metadata?.role !== 'admin') {
    redirect(`/${lang}/dashboard/client`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Create Company' : 'Crear Empresa'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en' 
            ? 'Create a company without a user. You can assign it to a user later when they register.'
            : 'Crea una empresa sin usuario. Podrás asignarla a un usuario más tarde cuando se registre.'}
        </p>
      </div>
      <AdminCompanyForm dict={dict} lang={lang} />
    </div>
  )
}

