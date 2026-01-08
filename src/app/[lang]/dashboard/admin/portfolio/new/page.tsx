import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortfolioForm } from '../portfolio-form'

export default async function NewPortfolioPage({ params }: {
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
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Create Portfolio Item' : 'Crear Proyecto de Portafolio'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Add a new project to your portfolio' : 'Agrega un nuevo proyecto a tu portafolio'}
        </p>
      </div>
      <PortfolioForm dict={dict} lang={lang} />
    </div>
  )
}

