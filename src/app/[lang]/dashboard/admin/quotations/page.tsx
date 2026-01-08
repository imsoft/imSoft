import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { QuotationsTable } from './quotations-table'

export default async function QuotationsPage({ params }: {
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

  // Obtener todas las cotizaciones con información del servicio
  const { data: quotations, error } = await supabase
    .from('quotations')
    .select(`
      *,
      services (
        id,
        title_es,
        title_en
      )
    `)
    .order('created_at', { ascending: false })

  // Log para debugging
  if (error) {
    console.error('Error fetching quotations:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {lang === 'en' ? 'Quotations' : 'Cotizaciones'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en'
              ? 'Manage quotations and configure quotation questions'
              : 'Gestiona cotizaciones y configura preguntas del cotizador'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/${lang}/dashboard/admin/quotations/questions`}>
              {lang === 'en' ? 'Manage Questions' : 'Gestionar Preguntas'}
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/${lang}/dashboard/admin/quotations/new`}>
              <Plus className="mr-1.5 size-4" />
              {lang === 'en' ? 'New Quotation' : 'Nueva Cotización'}
            </Link>
          </Button>
        </div>
      </div>
      <QuotationsTable quotations={quotations || []} dict={dict} lang={lang} />
    </div>
  )
}
