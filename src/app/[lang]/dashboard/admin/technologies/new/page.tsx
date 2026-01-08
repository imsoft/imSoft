import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TechnologyForm } from '../technology-form'

export default async function NewTechnologyPage({ params }: {
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
        <h1 className="text-3xl font-bold">{(dict as any).technologies?.create || (lang === 'en' ? 'Create Technology' : 'Crear Tecnología')}</h1>
        <p className="text-muted-foreground">
          {lang === 'en'
            ? 'Add a new technology that imSoft uses'
            : 'Agrega una nueva tecnología que utiliza imSoft'}
        </p>
      </div>
      <TechnologyForm 
        dict={dict} 
        lang={lang} 
      />
    </div>
  )
}
