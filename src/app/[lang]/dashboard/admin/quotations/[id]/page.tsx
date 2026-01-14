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
  // Hacer la consulta en dos pasos para evitar problemas con relaciones anidadas
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

  if (error) {
    console.error('Error fetching quotation:', error)
    notFound()
  }

  if (!quotation) {
    notFound()
  }

  // Obtener información del deal si existe
  // Manejar errores silenciosamente si el deal no existe o hay problemas de permisos
  let dealData = null
  if (quotation.deal_id) {
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select(`
        id,
        title,
        stage,
        value,
        contact_id,
        contacts (
          id,
          first_name,
          last_name,
          company
        )
      `)
      .eq('id', quotation.deal_id)
      .single()
    
    // Si hay error al obtener el deal, simplemente continuamos sin él
    // No es crítico para mostrar la cotización
    if (!dealError && deal) {
      dealData = deal
    } else if (dealError) {
      console.warn('Error fetching deal for quotation:', dealError)
    }
  }

  // Combinar los datos si hay deal
  const quotationWithDeal = dealData 
    ? { ...quotation, deals: dealData }
    : quotation

  // Obtener las preguntas del cuestionario para mostrar los textos
  // Solo si hay service_id
  let questions = null
  if (quotation.service_id) {
    const { data: questionsData } = await supabase
      .from('quotation_questions')
      .select('*')
      .eq('service_id', quotation.service_id)
      .order('order_index')
    questions = questionsData
  }

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
      <QuotationDetail quotation={quotationWithDeal} questions={questions || []} dict={dict} lang={lang} />
    </div>
  )
}

