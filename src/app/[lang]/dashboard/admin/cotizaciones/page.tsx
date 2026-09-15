import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { QuotesTable } from './quotes-table'
import type { Quote } from '@/types/quotes'

export default async function AdminQuotesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const dict = await getDictionary(lang)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const { data: quotes, error } = await supabase.from('quotes').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.cotizaciones}</h1>
          <p className="text-muted-foreground">
            {lang === 'en' ? 'Quotes, online acceptance and contracts' : 'Cotizaciones, aceptación en línea y contratos'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/cotizaciones/new`}>
            <Plus className="mr-1.5 size-4" />
            {lang === 'en' ? 'New quote' : 'Nueva cotización'}
          </Link>
        </Button>
      </div>
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
          {lang === 'en' ? 'Could not load quotes. ' : 'No se pudieron cargar las cotizaciones. '}
          {/relation .* does not exist/i.test(error.message)
            ? (lang === 'en' ? 'The database migration has not been applied yet.' : 'Falta aplicar la migración en Supabase (supabase/migrations/20260914_create_quotes_and_contracts.sql).')
            : error.message}
        </p>
      ) : (
        <QuotesTable quotes={(quotes ?? []) as Quote[]} lang={lang} />
      )}
    </div>
  )
}
