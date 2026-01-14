import { hasLocale } from '../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { KanbanBoard } from '@/components/crm/kanban-board'

export default async function DealsPage({ params }: {
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

  // Obtener todos los deals con información relacionada
  const { data: deals } = await supabase
    .from('deals')
    .select(`
      *,
      contacts (
        id,
        first_name,
        last_name,
        email,
        phone,
        company
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/${lang}/dashboard/admin/crm`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">
              {lang === 'en' ? 'Sales Pipeline' : 'Pipeline de Ventas'}
            </h1>
          </div>
          <p className="text-muted-foreground ml-12">
            {lang === 'en'
              ? 'Drag and drop deals between stages'
              : 'Arrastra y suelta negocios entre etapas'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/crm/deals/new`}>
            <Plus className="mr-1.5 size-4" />
            {lang === 'en' ? 'New Deal' : 'Nuevo Negocio'}
          </Link>
        </Button>
      </div>
      <KanbanBoard deals={deals || []} lang={lang} />
    </div>
  )
}
