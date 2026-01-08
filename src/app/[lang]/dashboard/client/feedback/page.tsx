import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedbacksTable } from './feedbacks-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ClientFeedbackPage({ params }: {
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

  // Obtener feedbacks del usuario
  const { data: feedbacks, error } = await supabase
    .from('feedbacks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feedbacks:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{dict.feedback.title}</h1>
          <p className="text-muted-foreground">
            {dict.feedback.subtitle}
          </p>
        </div>
        <Button asChild>
          <Link href={`/${lang}/dashboard/client/feedback/new`}>
            <Plus className="mr-1.5 h-4 w-4" />
            {dict.feedback.create}
          </Link>
        </Button>
      </div>
      
      <FeedbacksTable feedbacks={feedbacks || []} dict={dict} lang={lang} />
    </div>
  )
}

