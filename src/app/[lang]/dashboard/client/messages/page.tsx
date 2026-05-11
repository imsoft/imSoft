import { getDictionary, hasLocale } from '../../../dictionaries'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Inbox, Mail } from 'lucide-react'
import type { ContactMessage } from '@/types/database'

export default async function ClientMessagesPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${lang}/login`)

  const { data: messages, error } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('email', user.email!)
    .order('created_at', { ascending: false })

  if (error) console.error('Error fetching messages:', error)

  const isEs = lang === 'es'

  const statusConfig: Record<ContactMessage['status'], { label: string; className: string }> = {
    unread: {
      label: isEs ? 'Enviado' : 'Sent',
      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    },
    read: {
      label: isEs ? 'Visto' : 'Seen',
      className: 'bg-muted text-muted-foreground',
    },
    replied: {
      label: isEs ? 'Respondido' : 'Replied',
      className: 'bg-green-500/10 text-green-600 border-green-500/20',
    },
    archived: {
      label: isEs ? 'Archivado' : 'Archived',
      className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{dict.dashboard.client.nav.messages}</h1>
        <p className="text-muted-foreground mt-1">
          {isEs
            ? 'Mensajes que has enviado a través del formulario de contacto.'
            : 'Messages you have sent through the contact form.'}
        </p>
      </div>

      {(!messages || messages.length === 0) ? (
        <Card className="p-14 text-center">
          <Inbox className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {dict.dashboard.empty.messages?.title}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto">
            {dict.dashboard.empty.messages?.description}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const cfg = statusConfig[(msg.status as ContactMessage['status'])] ?? statusConfig.read
            return (
              <Card key={msg.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-line line-clamp-3">
                        {msg.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(msg.created_at || '').toLocaleDateString(
                          isEs ? 'es-MX' : 'en-US',
                          { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={`shrink-0 ${cfg.className}`}>
                    {cfg.label}
                  </Badge>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
