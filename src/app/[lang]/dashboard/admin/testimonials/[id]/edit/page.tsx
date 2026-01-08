import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TestimonialForm } from '../../testimonials-form'

export default async function EditTestimonialPage({ params }: {
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

  const { data: testimonial } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single()

  if (!testimonial) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Edit Testimonial' : 'Editar Testimonio'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Update testimonial information' : 'Actualiza la información del testimonio'}
        </p>
      </div>
      <TestimonialForm dict={dict} lang={lang} testimonial={testimonial} />
    </div>
  )
}

