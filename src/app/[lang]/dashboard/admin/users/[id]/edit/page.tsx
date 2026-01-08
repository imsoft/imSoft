import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { UserForm } from '../../user-form'

export default async function EditUserPage({ params }: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Obtener el usuario a editar usando el admin client
  const supabaseAdmin = createAdminClient()
  const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(id)

  if (error || !userData.user) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Edit User' : 'Editar Usuario'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Update user information' : 'Actualiza la información del usuario'}
        </p>
      </div>
      <UserForm 
        dict={dict} 
        lang={lang} 
        initialData={{
          id: userData.user.id,
          email: userData.user.email || '',
          user_metadata: userData.user.user_metadata,
        }}
      />
    </div>
  )
}

