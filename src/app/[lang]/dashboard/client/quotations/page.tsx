import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { QuotationsTable } from './quotations-table'

export default async function ClientQuotationsPage({ params }: {
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

  // Obtener cotizaciones del usuario actual
  const { data: quotations } = await supabase
    .from('quotations')
    .select(`
      *,
      services (
        id,
        title_es,
        title_en
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {lang === 'en' ? 'My Quotations' : 'Mis Cotizaciones'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en'
              ? 'Create and manage your quotations'
              : 'Crea y gestiona tus cotizaciones'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/client/quotations/new`}>
            <Plus className="mr-1.5 size-4" />
            {lang === 'en' ? 'New Quotation' : 'Nueva Cotización'}
          </Link>
        </Button>
      </div>
      <QuotationsTable quotations={quotations || []} dict={dict} lang={lang} />
    </div>
  )
}
