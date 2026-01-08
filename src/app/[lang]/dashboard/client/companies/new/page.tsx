import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompanyForm } from '../company-form'

export default async function NewCompanyPage({ params }: {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.companies.create}</h1>
        <p className="text-muted-foreground">
          {lang === 'en' 
            ? 'Create a new company and upload its logo'
            : 'Crea una nueva empresa y sube su logo'}
        </p>
      </div>
      <CompanyForm dict={dict} lang={lang} />
    </div>
  )
}

