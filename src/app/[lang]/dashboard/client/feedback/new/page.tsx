import { getDictionary, hasLocale } from '../../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FeedbackForm } from '../feedback-form'

export default async function NewFeedbackPage({ params }: {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.feedback.create}</h1>
        <p className="text-muted-foreground">
          {dict.feedback.subtitle}
        </p>
      </div>
      
      <div className="w-full">
        <FeedbackForm dict={dict} lang={lang} userId={user.id} />
      </div>
    </div>
  )
}

