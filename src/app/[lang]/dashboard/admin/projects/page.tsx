import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectsTable } from './projects-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminProjectsPage({ params }: {
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

  const { data: projects = [] } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.projects}</h1>
          <p className="text-muted-foreground">
            {lang === 'en' ? 'Manage all projects' : 'Gestiona todos los proyectos'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/projects/new`}>
            <Plus className="mr-1.5 size-4" />
            {lang === 'en' ? 'Create Project' : 'Crear Proyecto'}
          </Link>
        </Button>
      </div>
      <ProjectsTable projects={projects || []} dict={dict} lang={lang} />
    </div>
  )
}

