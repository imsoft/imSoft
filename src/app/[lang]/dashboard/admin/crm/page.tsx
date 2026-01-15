import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { ContactsKanbanBoard } from '@/components/crm/contacts-kanban-board'

export default async function CRMPage({ params }: {
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

  // Verificar que el usuario sea admin
  if (user.user_metadata?.role !== 'admin') {
    redirect(`/${lang}/dashboard/client`)
  }

  // Obtener estadísticas del CRM
  const { count: totalContacts } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })

  const { count: activeLeads } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'qualification')

  // Obtener todos los contactos para el Kanban board
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {lang === 'en' ? 'CRM Dashboard' : 'Panel CRM'}
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en'
              ? 'Manage contacts and activities'
              : 'Gestiona contactos y actividades'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/${lang}/dashboard/admin/crm/contacts`}>
              <Users className="mr-1.5 size-4" />
              {lang === 'en' ? 'Contacts' : 'Contactos'}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6 bg-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Total Contacts' : 'Total Contactos'}
              </p>
              <p className="text-2xl font-bold">{totalContacts || 0}</p>
            </div>
            <Users className="size-8 text-muted-foreground" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {activeLeads || 0} {lang === 'en' ? 'active leads' : 'leads activos'}
          </p>
        </Card>
      </div>

      {/* Contacts Kanban Board */}
      <ContactsKanbanBoard contacts={contacts || []} lang={lang} />
    </div>
  )
}
