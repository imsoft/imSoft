import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServicesTable } from './services-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminServicesPage({ params }: {
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

  // Obtener servicios desde Supabase (por ahora simulamos datos vacíos)
  const { data: services = [] } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.services}</h1>
          <p className="text-muted-foreground">
            {lang === 'en' ? 'Manage your services' : 'Gestiona tus servicios'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/services/new`}>
            <Plus className="mr-1.5 size-4" />
            {lang === 'en' ? 'Create Service' : 'Crear Servicio'}
          </Link>
        </Button>
      </div>
      <ServicesTable services={services || []} dict={dict} lang={lang} />
    </div>
  )
}

