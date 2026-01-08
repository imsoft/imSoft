import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { QuestionsManager } from './questions-manager'

export default async function QuestionsPage({ params }: {
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

  // Obtener servicios
  const { data: services } = await supabase
    .from('services')
    .select('id, title_es, title_en')
    .order('title_es')

  // Obtener todas las preguntas
  const { data: questions } = await supabase
    .from('quotation_questions')
    .select(`
      *,
      services (
        id,
        title_es,
        title_en
      )
    `)
    .order('service_id')
    .order('order_index')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${lang}/dashboard/admin/quotations`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">
              {lang === 'en' ? 'Quotation Questions' : 'Preguntas del Cotizador'}
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            {lang === 'en'
              ? 'Configure questions for each service to generate quotations'
              : 'Configura preguntas para cada servicio para generar cotizaciones'}
          </p>
        </div>
      </div>
      <QuestionsManager services={services || []} questions={questions || []} dict={dict} lang={lang} />
    </div>
  )
}
