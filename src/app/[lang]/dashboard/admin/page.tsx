import { getDictionary, hasLocale } from '../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage({ params }: {
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

  // Obtener el nombre completo del usuario
  const fullName = user.user_metadata?.full_name ||
                   (user.user_metadata?.first_name && user.user_metadata?.last_name
                     ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                     : user.email?.split('@')[0] || user.email)

  // Obtener estadísticas del dashboard
  const [portfolioCount, contactMessagesCount, contactsCount, blogCount] = await Promise.all([
    supabase.from('portfolio').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('blog').select('*', { count: 'exact', head: true }),
  ])

  const stats = {
    portfolio: portfolioCount.count || 0,
    contactMessages: contactMessagesCount.count || 0,
    contacts: contactsCount.count || 0,
    blog: blogCount.count || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.admin.title}</h1>
        <p className="text-muted-foreground">
          {dict.dashboard.common.welcome}, {fullName}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.portfolio}</div>
          <p className="text-sm text-muted-foreground">
            {lang === 'en' ? 'Portfolio Projects' : 'Proyectos de Portafolio'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.blog}</div>
          <p className="text-sm text-muted-foreground">
            {lang === 'en' ? 'Blog Posts' : 'Publicaciones de Blog'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.contactMessages}</div>
          <p className="text-sm text-muted-foreground">
            {lang === 'en' ? 'Contact Messages' : 'Mensajes de Contacto'}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-2xl font-bold">{stats.contacts}</div>
          <p className="text-sm text-muted-foreground">
            {lang === 'en' ? 'CRM Contacts' : 'Contactos CRM'}
          </p>
        </div>
      </div>
    </div>
  )
}

