'use client'

import { useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SendEmailButtonProps {
  dealId: string
  dealStage: string
  lang: string
  contactEmail?: string
}

export function SendEmailButton({ dealId, dealStage, lang, contactEmail }: SendEmailButtonProps) {
  const router = useRouter()
  const [isSending, setIsSending] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [isLoadingEmailPreview, setIsLoadingEmailPreview] = useState(false)

  const getStageLabel = (stage: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      no_contact: { en: 'No Contact', es: 'Sin Contacto' },
      qualification: { en: 'Prospecting', es: 'Prospección' },
      proposal: { en: 'Proposal', es: 'Propuesta' },
      negotiation: { en: 'Negotiation', es: 'Negociación' },
      closed_won: { en: 'Won', es: 'Ganado' },
      closed_lost: { en: 'Lost', es: 'Perdido' },
    }
    return lang === 'en' ? labels[stage]?.en || stage : labels[stage]?.es || stage
  }

  const handleEmailClick = async () => {
    // Si no hay email del contacto, mostrar error
    if (!contactEmail) {
      toast.error(lang === 'en'
        ? 'Contact email is required to send email.'
        : 'Se requiere el correo del contacto para enviar el email.')
      return
    }

    // Cargar preview del email
    setIsLoadingEmailPreview(true)
    try {
      const previewResponse = await fetch(`/api/crm/deals/${dealId}/email-preview`, {
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
    setIsSending(true)

    try {
      const response = await fetch(`/api/crm/deals/${dealId}/send-email`, {
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
        throw new Error(data.error || data.details || 'Failed to send email')
      }

      // Cerrar el diálogo
      setShowEmailDialog(false)

      toast.success(lang === 'en'
        ? 'Email sent successfully!'
        : '¡Correo enviado exitosamente!')

      router.refresh()
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
      setIsSending(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleEmailClick}
        disabled={isSending || isLoadingEmailPreview}
      >
        {isLoadingEmailPreview ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {lang === 'en' ? 'Loading...' : 'Cargando...'}
          </>
        ) : (
          <>
            <Mail className="mr-2 h-4 w-4" />
            {lang === 'en' ? 'Send Email' : 'Enviar Email'}
          </>
        )}
      </Button>

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
                value={contactEmail || ''}
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
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">
                    {lang === 'en' ? 'Preview' : 'Vista Previa'}
                  </TabsTrigger>
                  <TabsTrigger value="html">
                    {lang === 'en' ? 'HTML Editor' : 'Editor HTML'}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-2">
                  <div 
                    className="!border-2 !border-border min-h-[300px] max-h-[400px] overflow-y-auto rounded-md"
                    style={{ 
                      maxWidth: '100%',
                      wordWrap: 'break-word',
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <iframe
                      srcDoc={emailBody || '<p style="color: #666; padding: 20px;">No hay contenido para mostrar</p>'}
                      className="w-full h-full min-h-[300px] border-0 rounded-md"
                      title="Email Preview"
                      sandbox="allow-same-origin"
                      style={{
                        backgroundColor: 'transparent'
                      }}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="html" className="mt-2">
                  <Textarea
                    id="email-body"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder={lang === 'en' ? 'Email body (HTML supported)' : 'Cuerpo del correo (HTML soportado)'}
                    className="!border-2 !border-border min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {lang === 'en' 
                      ? 'You can use HTML tags to format the email body.'
                      : 'Puedes usar etiquetas HTML para formatear el cuerpo del correo.'}
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEmailDialog(false)}
              disabled={isSending}
            >
              {lang === 'en' ? 'Cancel' : 'Cancelar'}
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSending || !emailSubject.trim() || !emailBody.trim()}
            >
              {isSending ? (
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
    </>
  )
}
