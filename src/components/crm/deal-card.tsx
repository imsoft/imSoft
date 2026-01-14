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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [isLoadingEmailPreview, setIsLoadingEmailPreview] = useState(false)
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

    // Cargar preview del email
    setIsLoadingEmailPreview(true)
    try {
      const previewResponse = await fetch(`/api/crm/deals/${deal.id}/email-preview`, {
        method: 'GET',
      })

      if (previewResponse.ok) {
        const previewData = await previewResponse.json()
        setEmailSubject(previewData.subject || '')
        setEmailBody(previewData.body || '')
        setShowEmailDialog(true)
      } else {
        // Si no hay endpoint de preview, usar valores por defecto
        setEmailSubject('')
        setEmailBody('')
        setShowEmailDialog(true)
      }
    } catch (error) {
      console.error('Error loading email preview:', error)
      // Continuar de todas formas con valores vacíos
      setEmailSubject('')
      setEmailBody('')
      setShowEmailDialog(true)
    } finally {
      setIsLoadingEmailPreview(false)
    }
  }

  const handleSendEmail = async () => {
    setIsSendingEmail(true)

    try {
      const response = await fetch(`/api/crm/deals/${deal.id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Error sending email')
      }

      // Cerrar el diálogo
      setShowEmailDialog(false)

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

      {/* Diálogo de revisión de email */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {lang === 'en' ? 'Review Email Before Sending' : 'Revisar Correo Antes de Enviar'}
            </DialogTitle>
            <DialogDescription>
              {lang === 'en' 
                ? 'Review and edit the email subject and body before sending to the contact.'
                : 'Revisa y edita el asunto y cuerpo del correo antes de enviarlo al contacto.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-to">
                {lang === 'en' ? 'To' : 'Para'}
              </Label>
              <Input
                id="email-to"
                value={deal.contacts?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-subject">
                {lang === 'en' ? 'Subject' : 'Asunto'} *
              </Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder={lang === 'en' ? 'Email subject' : 'Asunto del correo'}
                className="!border-2 !border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-body">
                {lang === 'en' ? 'Body' : 'Cuerpo'} *
              </Label>
              <Textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder={lang === 'en' ? 'Email body (HTML supported)' : 'Cuerpo del correo (HTML soportado)'}
                className="!border-2 !border-border min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                {lang === 'en' 
                  ? 'You can use HTML tags to format the email body.'
                  : 'Puedes usar etiquetas HTML para formatear el cuerpo del correo.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              disabled={isSendingEmail}
            >
              {lang === 'en' ? 'Cancel' : 'Cancelar'}
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSendingEmail || !emailSubject.trim() || !emailBody.trim()}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {lang === 'en' ? 'Sending...' : 'Enviando...'}
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  {lang === 'en' ? 'Send Email' : 'Enviar Correo'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
