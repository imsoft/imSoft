'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Mail, Sparkles, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { ContactStatus } from '@/types/database'

interface SendEmailPageClientProps {
  contactId: string
  contactName: string
  contactEmail: string
  contactCompany: string
  contactStatus: ContactStatus
  lang: string
}

export function SendEmailPageClient({
  contactId,
  contactName,
  contactEmail,
  contactCompany,
  contactStatus,
  lang,
}: SendEmailPageClientProps) {
  const router = useRouter()
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [hasInitialGenerated, setHasInitialGenerated] = useState(false)

  // Generar email con AI al cargar automáticamente
  useEffect(() => {
    if (!hasInitialGenerated && !emailSubject && !emailBody) {
      setHasInitialGenerated(true)
      generateAIEmail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const generateAIEmail = async () => {
    setIsGeneratingAI(true)
    try {
      const response = await fetch(`/api/crm/contacts/${contactId}/generate-email`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(lang === 'en' ? 'Failed to generate email' : 'Error al generar email')
      }

      const data = await response.json()
      if (data.subject && data.body) {
        setEmailSubject(data.subject)
        setEmailBody(data.body)
        toast.success(lang === 'en' ? 'Email generated successfully' : 'Email generado exitosamente')
      }
    } catch (error) {
      console.error('Error generating email:', error)
      toast.error(lang === 'en' ? 'Error generating email' : 'Error al generar email')
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error(lang === 'en' ? 'Subject and body are required' : 'El asunto y el cuerpo son requeridos')
      return
    }

    setIsSending(true)
    try {
      const response = await fetch(`/api/crm/contacts/${contactId}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || (lang === 'en' ? 'Failed to send email' : 'Error al enviar email'))
      }

      toast.success(lang === 'en' ? 'Email sent successfully' : 'Correo enviado exitosamente')
      router.push(`/${lang}/dashboard/admin/crm/contacts/${contactId}`)
      router.refresh()
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error(lang === 'en' ? 'Error sending email' : 'Error al enviar correo', {
        description: error instanceof Error ? error.message : undefined,
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
            <Link href={`/${lang}/dashboard/admin/crm/contacts/${contactId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {lang === 'en' ? 'Send Email' : 'Enviar Correo'}
            </h1>
            <p className="text-muted-foreground">
              {lang === 'en' 
                ? `Send email to: ${contactName}`
                : `Enviar correo a: ${contactName}`}
            </p>
          </div>
        </div>
        <Button
          onClick={generateAIEmail}
          disabled={isGeneratingAI}
          variant="outline"
        >
          {isGeneratingAI ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {lang === 'en' ? 'Generating...' : 'Generando...'}
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              {lang === 'en' ? 'Generate with AI' : 'Generar con IA'}
            </>
          )}
        </Button>
      </div>

      {/* Email Form */}
      <Card className="p-6 bg-white">
        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">{lang === 'en' ? 'Subject' : 'Asunto'} *</Label>
            {isGeneratingAI ? (
              <Skeleton className="mt-1 h-10 w-full" />
            ) : (
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder={lang === 'en' ? 'Email subject...' : 'Asunto del correo...'}
                className="mt-1 border-2"
              />
            )}
          </div>

          <div>
            <Label htmlFor="body">{lang === 'en' ? 'Email Body' : 'Cuerpo del Correo'} *</Label>
            {isGeneratingAI ? (
              <Skeleton className="mt-1 h-[400px] w-full" />
            ) : (
              <Tabs defaultValue="preview" className="mt-1">
                <TabsList>
                  <TabsTrigger value="preview">{lang === 'en' ? 'Preview' : 'Vista Previa'}</TabsTrigger>
                  <TabsTrigger value="editor">{lang === 'en' ? 'HTML Editor' : 'Editor HTML'}</TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="mt-4">
                  <div className="border-2 rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
                    <iframe
                      srcDoc={emailBody}
                      className="w-full h-full"
                      style={{ minHeight: '400px', border: 'none' }}
                      title="Email Preview"
                    />
                  </div>
                </TabsContent>
                <TabsContent value="editor" className="mt-4">
                  <Textarea
                    id="body"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder={lang === 'en' ? 'Email body (HTML)...' : 'Cuerpo del correo (HTML)...'}
                    className="min-h-[400px] font-mono text-sm border-2"
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
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
      </Card>
    </div>
  )
}
