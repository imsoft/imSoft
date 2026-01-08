import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminCompanyForm } from '../../company-form'
import type { Company } from '@/types'

export default async function EditAdminCompanyPage({ params }: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params

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

  // Obtener la empresa (admins pueden ver todas, incluyendo las sin usuario)
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !company) {
    console.error('Error fetching company:', error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Edit Company' : 'Editar Empresa'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en' 
            ? 'Update company information'
            : 'Actualiza la información de la empresa'}
        </p>
      </div>
      <AdminCompanyForm dict={dict} lang={lang} initialData={company} />
    </div>
  )
}

