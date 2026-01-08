import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TechnologiesTable } from './technologies-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminTechnologiesPage({ params }: {
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

  // Verificar que sea admin
  if (user.user_metadata?.role !== 'admin') {
    redirect(`/${lang}/dashboard/client`)
  }

  // Obtener tecnologías con sus empresas asociadas
  const { data: technologies, error } = await supabase
    .from('technologies')
    .select(`
      *,
      technology_companies (
        company_name,
        logo_url
      )
    `)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching technologies:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.technologies}</h1>
          <p className="text-muted-foreground">
            {(dict as any).technologies?.subtitle || (lang === 'en' ? 'Manage the technologies that imSoft uses' : 'Gestiona las tecnologías que utiliza imSoft')}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/technologies/new`}>
            <Plus className="mr-1.5 size-4" />
            {(dict as any).technologies?.create || (lang === 'en' ? 'Create Technology' : 'Crear Tecnología')}
          </Link>
        </Button>
      </div>
      <TechnologiesTable technologies={technologies || []} dict={dict} lang={lang} />
    </div>
  )
}
