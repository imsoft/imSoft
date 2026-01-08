import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortfolioForm } from '../../portfolio-form'

export default async function EditPortfolioPage({ params }: {
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

  const { data: portfolio } = await supabase
    .from('portfolio')
    .select('*')
    .eq('id', id)
    .single()

  if (!portfolio) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Edit Portfolio Item' : 'Editar Proyecto de Portafolio'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Update portfolio project information' : 'Actualiza la información del proyecto'}
        </p>
      </div>
      <PortfolioForm dict={dict} lang={lang} portfolio={portfolio} />
    </div>
  )
}

