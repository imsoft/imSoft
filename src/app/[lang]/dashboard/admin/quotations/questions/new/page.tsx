import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuestionForm } from '../question-form'

export default async function NewQuestionPage({
  params,
  searchParams
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ service_id?: string }>
}) {
  const { lang } = await params
  const { service_id } = await searchParams

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Obtener servicios
  const { data: services } = await supabase
    .from('services')
    .select('id, title_es, title_en')
    .order('title_es')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Add Question' : 'Agregar Pregunta'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en'
            ? 'Configure the question and its pricing'
            : 'Configura la pregunta y su precio'}
        </p>
      </div>
      <QuestionForm services={services || []} dict={dict} lang={lang} defaultServiceId={service_id} />
    </div>
  )
}

