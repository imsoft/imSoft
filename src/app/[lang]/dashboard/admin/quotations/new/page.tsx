import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuotationForm } from '../quotation-form'

export default async function NewQuotationPage({ params }: {
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

  // Obtener servicios (sin duplicados)
  const { data: services } = await supabase
    .from('services')
    .select('id, title_es, title_en, slug')
    .order('title_es')
  
  // Eliminar duplicados por ID y nombre en el servidor usando Map para garantizar unicidad
  const uniqueServicesMap = new Map<string, NonNullable<typeof services>[0]>()
  const seenTitles = new Set<string>()
  
  if (services) {
    services.forEach((service) => {
      // Si ya existe un servicio con el mismo ID, saltarlo
      if (uniqueServicesMap.has(service.id)) {
        return
      }
      
      // Si ya existe un servicio con el mismo nombre, saltarlo
      const titleEs = service.title_es?.toLowerCase().trim() || ''
      if (titleEs && seenTitles.has(titleEs)) {
        return
      }
      
      // Agregar el servicio
      uniqueServicesMap.set(service.id, service)
      if (titleEs) {
        seenTitles.add(titleEs)
      }
    })
  }
  
  const uniqueServices = Array.from(uniqueServicesMap.values())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'New Quotation' : 'Nueva Cotización'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en'
            ? 'Create a new quotation by answering the questions'
            : 'Crea una nueva cotización respondiendo las preguntas'}
        </p>
      </div>
      <QuotationForm services={uniqueServices} dict={dict} lang={lang} userId={user.id} />
    </div>
  )
}
