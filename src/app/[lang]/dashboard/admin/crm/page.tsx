import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ContactsTable } from './contacts/contacts-table'
import { CrmTabs } from './crm-tabs'
import { serviceClient } from '@/lib/quotes/server'
import { estadoDeCorreo, type FilaCorreo } from '@/lib/estado-correo'
import { estadoCampana } from '@/lib/outreach-server'
import { cupoDeHoy } from '@/lib/envio-lote'
import { esAdmin } from '@/lib/roles'

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
  if (!esAdmin(user)) {
    redirect(`/${lang}/dashboard/client`)
  }

  // Obtener todos los contactos
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })

  // En que va la secuencia de correos de cada contacto, para mostrarlo en la tabla.
  // outreach_emails solo lo lee el servidor (service role); el admin ya esta verificado.
  const db = serviceClient()
  const [{ data: correos }, campana] = await Promise.all([
    db.from('outreach_emails').select('id, contact_id, step, status, sent_at, scheduled_for').limit(5000),
    estadoCampana(db),
  ])
  // Tope diario: lo enviado hoy mas los borradores que ya esperan envio.
  const enEspera = (correos ?? []).filter((f) => f.status === 'draft' && String(f.scheduled_for) <= campana.hoy).length
  const cupo = cupoDeHoy(campana.tope, campana.enviadosHoy, enEspera)
  const porContacto = new Map<string, FilaCorreo[]>()
  for (const f of (correos ?? []) as Array<FilaCorreo & { contact_id: string }>) porContacto.set(f.contact_id, [...(porContacto.get(f.contact_id) ?? []), f])
  const conCorreo = (contacts || []).map((c) => ({ ...c, correo: estadoDeCorreo(porContacto.get(c.id) ?? []) }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            CRM
          </h1>
          <p className="text-muted-foreground">
            {lang === 'en'
              ? 'Manage all your contacts, leads, and customers'
              : 'Gestiona todos tus contactos, leads y clientes'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/crm/contacts/new`}>
            <Plus className="mr-1.5 size-4" />
            {lang === 'en' ? 'New Contact' : 'Nuevo Contacto'}
          </Link>
        </Button>
      </div>
      <CrmTabs lang={lang} activa="contactos" />
      <ContactsTable contacts={conCorreo} dict={dict} lang={lang} cupo={cupo} />
    </div>
  )
}
