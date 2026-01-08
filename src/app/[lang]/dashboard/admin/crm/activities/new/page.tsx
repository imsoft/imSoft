import { hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ActivityForm } from '../activity-form'

export default async function NewActivityPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Verificar que el usuario sea admin
  if (user.user_metadata?.role !== 'admin') {
    redirect(`/${lang}/dashboard/client`)
  }

  // Obtener contactos y deals
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('first_name')

  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .order('title')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${lang}/dashboard/admin/crm/activities`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {lang === 'en' ? 'New Activity' : 'Nueva Actividad'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en'
              ? 'Log a new interaction or task'
              : 'Registra una nueva interacción o tarea'}
          </p>
        </div>
      </div>
      <ActivityForm contacts={contacts || []} deals={deals || []} lang={lang} userId={user.id} />
    </div>
  )
}
