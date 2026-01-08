import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompanyForm } from '../../company-form'

export default async function EditCompanyPage({ params }: {
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

  // Obtener la empresa
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !company) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.companies.edit}</h1>
        <p className="text-muted-foreground">
          {lang === 'en' 
            ? 'Update company information and logo'
            : 'Actualiza la información de la empresa y su logo'}
        </p>
      </div>
      <CompanyForm dict={dict} lang={lang} company={company} />
    </div>
  )
}

