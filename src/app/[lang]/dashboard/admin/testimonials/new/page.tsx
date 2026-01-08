import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TestimonialForm } from '../testimonials-form'

export default async function NewTestimonialPage({ params }: {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Create Testimonial' : 'Crear Testimonio'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Add a new testimonial' : 'Agrega un nuevo testimonio'}
        </p>
      </div>
      <TestimonialForm dict={dict} lang={lang} />
    </div>
  )
}

