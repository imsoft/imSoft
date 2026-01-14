import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { QuotationDetail } from '../quotation-detail'

export default async function QuotationDetailPage({ params }: {
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

  // Obtener la cotización con información del servicio
  const { data: quotation, error } = await supabase
    .from('quotations')
    .select(`
      *,
      services (
        id,
        title_es,
        title_en
      )
    `)
    .eq('id', id)
    .single()

  if (error || !quotation) {
    notFound()
  }

  // Obtener las preguntas del cuestionario para mostrar los textos
  const { data: questions } = await supabase
    .from('quotation_questions')
    .select('*')
    .eq('service_id', quotation.service_id)
    .order('order_index')

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${lang}/dashboard/admin/quotations`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {lang === 'en' ? 'Quotation Details' : 'Detalles de la Cotización'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en'
              ? 'View quotation information and answers'
              : 'Ver información y respuestas de la cotización'}
          </p>
        </div>
      </div>
      <QuotationDetail quotation={quotation} questions={questions || []} dict={dict} lang={lang} />
    </div>
  )
}

