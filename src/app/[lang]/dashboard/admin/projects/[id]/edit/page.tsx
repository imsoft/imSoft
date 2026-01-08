import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectForm } from '../../project-form'
import { ProjectPaymentsManager } from '@/components/projects/project-payments-manager'
import { Button } from '@/components/ui/button'
import { CheckSquare } from 'lucide-react'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default async function EditProjectPage({ params }: {
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

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {lang === 'en' ? 'Edit Project' : 'Editar Proyecto'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en' ? 'Update project information' : 'Actualiza la información del proyecto'}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/${lang}/dashboard/admin/projects/${id}/tasks`}>
            <CheckSquare className="mr-2 h-4 w-4" />
            {lang === 'en' ? 'Manage Tasks' : 'Gestionar Tareas'}
          </Link>
        </Button>
      </div>
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">
            {lang === 'en' ? 'Project Details' : 'Detalles del Proyecto'}
          </TabsTrigger>
          <TabsTrigger value="payments">
            {lang === 'en' ? 'Payments' : 'Pagos'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="space-y-6 mt-6">
          <ProjectForm dict={dict} lang={lang} project={project} />
        </TabsContent>
        <TabsContent value="payments" className="space-y-6 mt-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <ProjectPaymentsManager 
              projectId={id} 
              projectCurrency={project.currency || 'MXN'}
              projectTotalPrice={project.total_price}
              lang={lang as 'es' | 'en'}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

