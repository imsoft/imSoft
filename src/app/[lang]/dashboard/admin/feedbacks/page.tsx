import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { FeedbacksTable } from './feedbacks-table'

export default async function AdminFeedbacksPage({ params }: {
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

  // Obtener todos los feedbacks
  const { data: feedbacks, error } = await supabase
    .from('feedbacks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching feedbacks:', error)
  }

  // Obtener información de usuarios usando el admin client
  const supabaseAdmin = createAdminClient()
  const userIds = [...new Set((feedbacks || []).map(f => f.user_id))]
  const usersMap = new Map()

  // Obtener información de cada usuario
  for (const userId of userIds) {
    try {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
      if (userData?.user) {
        usersMap.set(userId, userData.user)
      }
    } catch (err) {
      console.error(`Error fetching user ${userId}:`, err)
    }
  }

  // Mapear los feedbacks para incluir información del usuario
  const feedbacksWithUser = (feedbacks || []).map((feedback: any) => {
    const userData = usersMap.get(feedback.user_id)
    return {
      ...feedback,
      user_email: userData?.email || 'Unknown',
      user_name: userData?.user_metadata?.full_name || 
                 (userData?.user_metadata?.first_name && userData?.user_metadata?.last_name
                   ? `${userData.user_metadata.first_name} ${userData.user_metadata.last_name}`
                   : userData?.email?.split('@')[0] || 'Unknown'),
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.admin.nav.feedbacks}</h1>
        <p className="text-muted-foreground">
          {lang === 'en' 
            ? 'View and manage all feedback from clients'
            : 'Ver y gestionar todos los feedbacks de los clientes'}
        </p>
      </div>
      <FeedbacksTable feedbacks={feedbacksWithUser} dict={dict} lang={lang} />
    </div>
  )
}

