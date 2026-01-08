import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TaskManagerEnhanced } from '@/components/projects/task-manager-enhanced'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function ProjectTasksPage({ params }: {
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

  // Verificar que el proyecto existe
  const { data: project } = await supabase
    .from('projects')
    .select('id, title_es, title_en, title')
    .eq('id', id)
    .single()

  if (!project) {
    notFound()
  }

  const projectTitle = lang === 'es' 
    ? (project.title_es || project.title || '')
    : (project.title_en || project.title || '')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href={`/${lang}/dashboard/admin/projects/${id}/edit`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {lang === 'en' ? 'Project Tasks' : 'Tareas del Proyecto'}
            </h1>
            <p className="text-muted-foreground">
              {projectTitle && (
                <span>
                  {lang === 'en' ? 'Manage tasks for: ' : 'Gestiona las tareas de: '}
                  <span className="font-medium">{projectTitle}</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
      <TaskManagerEnhanced projectId={id} lang={lang} />
    </div>
  )
}

