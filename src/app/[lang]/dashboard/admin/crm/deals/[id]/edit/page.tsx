import { hasLocale } from '../../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DealFormSimple } from '../../deal-form-simple'

export default async function EditDealPage({ params }: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params

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

  // Obtener el deal
  const { data: deal, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !deal) {
    notFound()
  }

  // Obtener contactos
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('first_name')

  // Obtener cotizaciones pendientes o aprobadas con información del servicio
  const { data: quotations } = await supabase
    .from('quotations')
    .select(`
      *,
      services (
        id,
        title_es,
        title_en
      )
    `)
    .in('status', ['pending', 'approved'])
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${lang}/dashboard/admin/crm/deals/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {lang === 'en' ? 'Edit Deal' : 'Editar Negocio'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en' ? `Editing ${deal.title}` : `Editando ${deal.title}`}
          </p>
        </div>
      </div>
      <DealFormSimple
        deal={deal}
        contacts={contacts || []}
        quotations={quotations || []}
        lang={lang}
        userId={user.id}
      />
    </div>
  )
}
