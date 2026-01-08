import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { UsersTable } from './users-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminUsersPage({ params }: {
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

  // Obtener todos los usuarios usando el admin client
  const supabaseAdmin = createAdminClient()
  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
  
  // Mapear los usuarios de Supabase a nuestro formato
  const users = (usersData?.users || []).map(user => ({
    id: user.id,
    email: user.email || '',
    user_metadata: user.user_metadata,
    created_at: user.created_at,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.users}</h1>
          <p className="text-muted-foreground">
            {lang === 'en' ? 'Manage all system users (clients)' : 'Gestiona todos los usuarios del sistema (clientes)'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/users/new`}>
            <Plus className="mr-2 size-4" />
            {lang === 'en' ? 'Create User' : 'Crear Usuario'}
          </Link>
        </Button>
      </div>
      <UsersTable users={users} dict={dict} lang={lang} />
    </div>
  )
}

