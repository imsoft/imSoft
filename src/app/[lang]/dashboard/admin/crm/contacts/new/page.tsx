import { hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ContactFormSimple } from '../contact-form-simple'

export default async function NewContactPage({ params }: {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${lang}/dashboard/admin/crm/contacts`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {lang === 'en' ? 'New Contact' : 'Nuevo Contacto'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en'
              ? 'Add a new contact to your CRM'
              : 'Agrega un nuevo contacto a tu CRM'}
          </p>
        </div>
      </div>
      <ContactFormSimple lang={lang} userId={user.id} />
    </div>
  )
}
