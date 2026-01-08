import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '../project-form'

export default async function NewProjectPage({ params }: {
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
          {lang === 'en' ? 'Create Project' : 'Crear Proyecto'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Add a new project' : 'Agrega un nuevo proyecto'}
        </p>
      </div>
      <ProjectForm dict={dict} lang={lang} />
    </div>
  )
}

