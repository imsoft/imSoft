import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TechnologyForm } from '../../technology-form'

export default async function EditTechnologyPage({ params }: {
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

  // Obtener la tecnología con sus empresas asociadas
  const { data: technology, error } = await supabase
    .from('technologies')
    .select(`
      *,
      technology_companies (
        company_name
      )
    `)
    .eq('id', id)
    .single()

  if (error || !technology) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{(dict as any).technologies?.edit || (lang === 'en' ? 'Edit Technology' : 'Editar Tecnología')}</h1>
        <p className="text-muted-foreground">
          {lang === 'en'
            ? 'Edit technology information'
            : 'Edita la información de la tecnología'}
        </p>
      </div>
      <TechnologyForm 
        dict={dict} 
        lang={lang} 
        technology={technology}
      />
    </div>
  )
}
