import { getDictionary, hasLocale } from '../../../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BlogForm } from '../../blog-form'

export default async function EditBlogPage({ params }: {
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

  const { data: post } = await supabase
    .from('blog')
    .select('*')
    .eq('id', id)
    .single()

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {lang === 'en' ? 'Edit Blog Post' : 'Editar Publicación'}
        </h1>
        <p className="text-muted-foreground">
          {lang === 'en' ? 'Update blog post information' : 'Actualiza la información de la publicación'}
        </p>
      </div>
      <BlogForm dict={dict} lang={lang} post={post} />
    </div>
  )
}

