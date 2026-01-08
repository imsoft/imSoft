import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PortfolioTable } from './portfolio-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPortfolioPage({ params }: {
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

  const { data: portfolio = [] } = await supabase
    .from('portfolio')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.portfolio}</h1>
          <p className="text-muted-foreground">
            {lang === 'en' ? 'Manage your portfolio projects' : 'Gestiona los proyectos de tu portafolio'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/portfolio/new`}>
            <Plus className="mr-1.5 size-4" />
            {lang === 'en' ? 'Create Portfolio Item' : 'Crear Proyecto de Portafolio'}
          </Link>
        </Button>
      </div>
      <PortfolioTable portfolio={portfolio || []} dict={dict} lang={lang} />
    </div>
  )
}

