'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, User, GripVertical, Mail, MailCheck, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Deal } from '@/types/database'

interface DealCardProps {
  deal: Deal & {
    contacts?: {
      first_name: string
      last_name: string
      email: string
      phone?: string
      company?: string
    }
    email_sent?: boolean
  }
  lang: string
  onEmailSent?: (dealId: string) => void
}

export function DealCard({ deal, lang, onEmailSent }: DealCardProps) {
  const router = useRouter()
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(lang === 'en' ? 'en-US' : 'es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleEmailClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Si ya se envió el correo, mostrar toast
    if (deal.email_sent) {
      toast.info(lang === 'en' 
        ? 'Email has already been sent to this contact.' 
        : 'El correo ya ha sido enviado a este contacto.')
      return
    }

    // Si no hay email del contacto, mostrar error
    if (!deal.contacts?.email) {
      toast.error(lang === 'en'
        ? 'Contact email is required to send email.'
        : 'Se requiere el correo del contacto para enviar el email.')
      return
    }

    setIsSendingEmail(true)

    try {
      const response = await fetch(`/api/crm/deals/${deal.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Error sending email')
      }

      // Notificar al componente padre para actualizar el estado
      if (onEmailSent) {
        onEmailSent(deal.id)
      }

      // Refrescar la página para actualizar el estado
      router.refresh()

      toast.success(lang === 'en'
        ? 'Email sent successfully!'
        : '¡Correo enviado exitosamente!')
    } catch (error) {
      console.error('Error sending email:', error)
      const errorMessage = error instanceof Error 
        ? error.message 
        : (lang === 'en' ? 'Error sending email' : 'Error al enviar correo')
      
      toast.error(lang === 'en'
        ? 'Error sending email'
        : 'Error al enviar correo', {
        description: errorMessage,
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4 bg-white hover:shadow-md transition-shadow group">
        <div className="space-y-3">
          {/* Header con drag handle */}
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/${lang}/dashboard/admin/crm/deals/${deal.id}`}
              className="flex-1 min-w-0"
            >
              <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                {deal.title}
              </h3>
            </Link>
            <button
              className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0"
              {...attributes}
              {...listeners}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </div>

          {/* Valor */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="font-bold text-green-600">
              {formatCurrency(deal.value)}
            </span>
          </div>

          {/* Contacto */}
          {deal.contacts && (
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">
                  {deal.contacts.first_name} {deal.contacts.last_name}
                </p>
                {deal.contacts.company && (
                  <p className="text-xs text-muted-foreground truncate">
                    {deal.contacts.company}
                  </p>
                )}
                {deal.contacts.email && (
                  <p className="text-xs text-muted-foreground truncate">
                    {deal.contacts.email}
                  </p>
                )}
                {deal.contacts.phone && (
                  <p className="text-xs text-muted-foreground truncate">
                    {deal.contacts.phone}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Badges: Email enviado y Probability */}
          <div className="flex items-center justify-between gap-2">
            {/* Badge de correo enviado */}
            {deal.stage !== 'no_contact' && (
              <Badge 
                variant={deal.email_sent ? "default" : "outline"}
                className={`text-xs flex items-center gap-1 cursor-pointer transition-opacity hover:opacity-80 ${
                  deal.email_sent 
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' 
                    : 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'
                } ${isSendingEmail ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleEmailClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleEmailClick(e as any)
                  }
                }}
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {lang === 'en' ? 'Sending...' : 'Enviando...'}
                  </>
                ) : deal.email_sent ? (
                  <>
                    <MailCheck className="h-3 w-3" />
                    {lang === 'en' ? 'Email Sent' : 'Correo Enviado'}
                  </>
                ) : (
                  <>
                    <Mail className="h-3 w-3" />
                    {lang === 'en' ? 'No Email' : 'Sin Correo'}
                  </>
                )}
              </Badge>
            )}
            {/* Probability badge si existe */}
            {deal.probability !== null && deal.probability !== undefined && (
              <Badge variant="outline" className="text-xs">
                {deal.probability}%
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
