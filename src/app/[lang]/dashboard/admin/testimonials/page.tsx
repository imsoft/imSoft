import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TestimonialsTable } from './testimonials-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminTestimonialsPage({ params }: {
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

  const { data: testimonials = [] } = await supabase
    .from('testimonials')
    .select(`
      *,
      companies (
        id,
        name,
        logo_url
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.testimonials}</h1>
          <p className="text-muted-foreground">
            {lang === 'en' ? 'Manage testimonials' : 'Gestiona los testimonios'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/testimonials/new`}>
            <Plus className="mr-1.5 size-4" />
            {lang === 'en' ? 'Create Testimonial' : 'Crear Testimonio'}
          </Link>
        </Button>
      </div>
      <TestimonialsTable testimonials={testimonials || []} dict={dict} lang={lang} />
    </div>
  )
}

