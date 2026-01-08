import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BlogTable } from './blog-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminBlogPage({ params }: {
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

  const { data: posts = [] } = await supabase
    .from('blog')
    .select('*')
    .order('created_at', { ascending: false })

  // Obtener información de los autores
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const supabaseAdmin = createAdminClient()
  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
  
  const authorsMap = new Map(
    (usersData?.users || []).map(user => [
      user.id,
      user.user_metadata?.full_name || 
      (user.user_metadata?.first_name && user.user_metadata?.last_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
        : user.email?.split('@')[0] || user.email || 'Usuario')
    ])
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.blog}</h1>
          <p className="text-muted-foreground">
            {lang === 'en' ? 'Manage your blog posts' : 'Gestiona tus publicaciones del blog'}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/admin/blog/new`}>
            <Plus className="mr-1.5 size-4" />
            {lang === 'en' ? 'Create Blog Post' : 'Crear Publicación'}
          </Link>
        </Button>
      </div>
      <BlogTable posts={posts || []} authorsMap={authorsMap} dict={dict} lang={lang} />
    </div>
  )
}

