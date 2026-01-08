import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CompaniesTable } from './companies-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ClientCompaniesPage({ params }: {
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

  // Obtener empresas del usuario
  const { data: companies, error } = await supabase
    .from('companies')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching companies:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.client.nav.companies}</h1>
          <p className="text-muted-foreground">
            {lang === 'en' 
              ? 'Manage your companies and their information'
              : 'Gestiona tus empresas y su información'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/client/companies/new`}>
            <Plus className="mr-1.5 h-4 w-4" />
            {dict.companies.create}
          </Link>
        </Button>
      </div>
      <CompaniesTable companies={companies || []} dict={dict} lang={lang} />
    </div>
  )
}

