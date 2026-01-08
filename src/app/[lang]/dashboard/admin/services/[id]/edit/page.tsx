import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ServiceForm } from '../../service-form'

export default async function EditServicePage({ params }: {
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

  // Obtener el servicio
  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (!service) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Edit Service' : 'Editar Servicio'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Update service information' : 'Actualiza la información del servicio'}
        </p>
      </div>
      <ServiceForm dict={dict} lang={lang} service={service} />
    </div>
  )
}

