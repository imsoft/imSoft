'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import Link from 'next/link'

interface SendEmailPageClientProps {
  dealId: string
  dealTitle: string
  contactEmail: string
  contactName: string
  initialSubject: string
  initialBody: string
  lang: string
}

export function SendEmailPageClient({
  dealId,
  dealTitle,
  contactEmail,
  contactName,
  initialSubject,
  initialBody,
  lang,
}: SendEmailPageClientProps) {
  const router = useRouter()
  const [emailSubject, setEmailSubject] = useState(initialSubject)
  const [emailBody, setEmailBody] = useState(initialBody)
  const [isSending, setIsSending] = useState(false)
  const [isLoadingPreview, setIsLoadingPreview] = useState(!initialSubject && !initialBody)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Cargar preview si no se proporcionó inicialmente
  useEffect(() => {
    if (!initialSubject && !initialBody) {
      // Por defecto, generar con AI
      generateAIEmail()
    }
  }, [dealId, initialSubject, initialBody])

  const generateAIEmail = async () => {
    setIsGeneratingAI(true)
    setIsLoadingPreview(true)
    try {
      const response = await fetch(`/api/crm/deals/${dealId}/generate-email`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Error generating AI email')
      }

      const data = await response.json()
      setEmailSubject(data.subject || '')
      setEmailBody(data.body || '')
    } catch (error) {
      console.error('Error generating AI email:', error)
      toast.error(lang === 'en' 
        ? 'Error generating AI email. Loading default template...' 
        : 'Error al generar email con IA. Cargando plantilla por defecto...')
      
      // Fallback a template por defecto
      try {
        const previewResponse = await fetch(`/api/crm/deals/${dealId}/email-preview`)
        if (previewResponse.ok) {
          const previewData = await previewResponse.json()
          setEmailSubject(previewData.subject || '')
          setEmailBody(previewData.body || '')
        }
      } catch (previewError) {
        console.error('Error loading default preview:', previewError)
      }
    } finally {
      setIsGeneratingAI(false)
      setIsLoadingPreview(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error(lang === 'en' 
        ? 'Subject and body are required' 
        : 'El asunto y cuerpo son requeridos')
      return
    }

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

      toast.success(lang === 'en'
        ? 'Email sent successfully!'
        : '¡Correo enviado exitosamente!')

      router.push(`/${lang}/dashboard/admin/crm/deals/${dealId}`)
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
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/${lang}/dashboard/admin/crm/deals/${dealId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {lang === 'en' ? 'Send Email' : 'Enviar Correo'}
            </h1>
            <p className="text-muted-foreground">
              {lang === 'en' 
                ? `Review and send email for: ${dealTitle}`
                : `Revisar y enviar correo para: ${dealTitle}`}
            </p>
          </div>
        </div>
      </div>

      {/* Email Form */}
      <Card className="p-6 bg-white">
        {isLoadingPreview ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">
              {lang === 'en' ? 'Loading email preview...' : 'Cargando vista previa del correo...'}
            </span>
          </div>
        ) : (
          <div className="space-y-6">
          {/* To */}
          <div className="space-y-2">
            <Label htmlFor="email-to">
              {lang === 'en' ? 'To' : 'Para'}
            </Label>
            <Input
              id="email-to"
              value={`${contactName} <${contactEmail}>`}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-subject">
                {lang === 'en' ? 'Subject' : 'Asunto'} *
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={generateAIEmail}
                disabled={isGeneratingAI}
                className="h-8 text-xs"
              >
                {isGeneratingAI ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    {lang === 'en' ? 'Generating...' : 'Generando...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-1 h-3 w-3" />
                    {lang === 'en' ? 'Generate with AI' : 'Generar con IA'}
                  </>
                )}
              </Button>
            </div>
            <Input
              id="email-subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder={lang === 'en' ? 'Email subject' : 'Asunto del correo'}
              className="!border-2 !border-border"
            />
          </div>

          {/* Body with Tabs */}
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
                  className="!border-2 !border-border min-h-[400px] max-h-[600px] overflow-y-auto rounded-md"
                  style={{ 
                    maxWidth: '100%',
                    wordWrap: 'break-word',
                    backgroundColor: '#f8f9fa'
                  }}
                >
                  <iframe
                    srcDoc={emailBody || '<p style="color: #666; padding: 20px;">No hay contenido para mostrar</p>'}
                    className="w-full h-full min-h-[400px] border-0 rounded-md"
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
                  className="!border-2 !border-border min-h-[400px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {lang === 'en' 
                    ? 'You can use HTML tags to format the email body.'
                    : 'Puedes usar etiquetas HTML para formatear el cuerpo del correo.'}
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => router.back()}
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
          </div>
        </div>
        )}
      </Card>
    </div>
  )
}
