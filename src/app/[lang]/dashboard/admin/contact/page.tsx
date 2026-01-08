import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContactForm } from './contact-form'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyAction,
} from "@/components/ui/empty"
import { Contact, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function AdminContactPage({ params }: {
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

  // Obtener datos de contacto (asumiendo que solo hay un registro)
  const { data: contactData, error } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching contact data:', error)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.contact}</h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Manage contact information' : 'Gestiona la información de contacto'}
        </p>
      </div>
      <ContactForm dict={dict} lang={lang} contactData={contactData || undefined} />
    </div>
  )
}

