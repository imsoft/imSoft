'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Mail, Loader2, Sparkles, Save, MessageCircle, Briefcase } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import jsPDF from 'jspdf'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface QuotationDetailProps {
  quotation: any
  questions: any[]
  dict: Dictionary
  lang: Locale
}

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
  approved: 'bg-green-500/10 text-green-700 dark:text-green-400',
  rejected: 'bg-red-500/10 text-red-700 dark:text-red-400',
  converted: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
}

const statusLabels = {
  pending: { es: 'Pendiente', en: 'Pending' },
  approved: { es: 'Aprobada', en: 'Approved' },
  rejected: { es: 'Rechazada', en: 'Rejected' },
  converted: { es: 'Convertida', en: 'Converted' },
}

export function QuotationDetail({ quotation, questions, dict, lang }: QuotationDetailProps) {
  const router = useRouter()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false)
  const [isGettingAIRecommendation, setIsGettingAIRecommendation] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isConvertingToDeal, setIsConvertingToDeal] = useState(false)
  const [finalPrice, setFinalPrice] = useState<string>(quotation.final_price?.toString() || '')
  const [estimatedTime, setEstimatedTime] = useState<string>(quotation.estimated_development_time?.toString() || '')
  const [aiRecommendation, setAiRecommendation] = useState<any>(quotation.ai_recommendation || null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(lang === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const service = quotation.services as any
  const serviceName = lang === 'es'
    ? service?.title_es || service?.title
    : service?.title_en || service?.title

  const generatePDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPosition = 20

      // Cargar logo
      const loadImage = (src: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image()
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas')
              canvas.width = img.width
              canvas.height = img.height
              const ctx = canvas.getContext('2d')
              if (ctx) {
                ctx.drawImage(img, 0, 0)
                resolve(canvas.toDataURL('image/png'))
              } else {
                reject(new Error('Could not get canvas context'))
              }
            } catch (error) {
              reject(error)
            }
          }
          img.onerror = (error) => {
            reject(new Error(`Failed to load image: ${src}`))
          }
          // Usar ruta absoluta desde la raíz del sitio
          img.src = window.location.origin + src
        })
      }

      // Color primario de marca: #1e9df1
      const brandColor = { r: 30, g: 157, b: 241 }

      // Header con color de marca
      doc.setFillColor(brandColor.r, brandColor.g, brandColor.b)
      doc.rect(0, 0, pageWidth, 50, 'F')
      
      // Intentar cargar y agregar logo
      try {
        const logoPath = '/logos/logo-imsoft-white.png'
        const logoDataUrl = await loadImage(logoPath)
        // Agregar logo a la izquierda del header (ajustar tamaño según necesidad)
        const logoWidth = 40
        const logoHeight = 12
        doc.addImage(logoDataUrl, 'PNG', 20, 15, logoWidth, logoHeight)
        
        // Título a la derecha del logo
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(18)
        doc.setFont('helvetica', 'bold')
        doc.text(lang === 'es' ? 'Cotización' : 'Quotation', pageWidth - 20, 25, { align: 'right' })
      } catch (logoError) {
        // Si falla cargar el logo, usar solo texto
        console.warn('Could not load logo, using text only:', logoError)
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont('helvetica', 'bold')
        doc.text('imSoft', pageWidth / 2, 25, { align: 'center' })
        doc.setFontSize(16)
        doc.text(lang === 'es' ? 'Cotización' : 'Quotation', pageWidth / 2, 35, { align: 'center' })
      }

      // Reset text color
      doc.setTextColor(0, 0, 0)
      yPosition = 60

      // General Information
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(lang === 'en' ? 'General Information' : 'Información General', 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`${lang === 'en' ? 'Client Name' : 'Nombre del Cliente'}: ${quotation.client_name || '-'}`, 20, yPosition)
      yPosition += 7
      doc.text(`${lang === 'en' ? 'Email' : 'Correo'}: ${quotation.client_email || '-'}`, 20, yPosition)
      yPosition += 7
      if (quotation.client_phone) {
        doc.text(`${lang === 'en' ? 'Phone' : 'Teléfono'}: ${quotation.client_phone}`, 20, yPosition)
        yPosition += 7
      }
      if (quotation.client_company) {
        doc.text(`${lang === 'en' ? 'Company' : 'Empresa'}: ${quotation.client_company}`, 20, yPosition)
        yPosition += 7
      }
      doc.text(`${lang === 'en' ? 'Service' : 'Servicio'}: ${serviceName || '-'}`, 20, yPosition)
      yPosition += 7
      doc.text(`${lang === 'en' ? 'Created At' : 'Fecha de Creación'}: ${quotation.created_at ? formatDate(quotation.created_at) : '-'}`, 20, yPosition)
      yPosition += 7
      if (quotation.valid_until) {
        doc.text(`${lang === 'en' ? 'Valid Until' : 'Válida Hasta'}: ${formatDate(quotation.valid_until)}`, 20, yPosition)
        yPosition += 7
      }

      yPosition += 5

      // Questionnaire Answers
      if (quotation.answers && Object.keys(quotation.answers).length > 0) {
        if (yPosition > pageHeight - 40) {
          doc.addPage()
          yPosition = 20
        }
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(lang === 'en' ? 'Questionnaire Answers' : 'Respuestas del Cuestionario', 20, yPosition)
        yPosition += 10

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        Object.entries(quotation.answers).forEach(([questionId, answer]) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = 20
          }
          const question = questions.find(q => q.id === questionId)
          const questionText = question
            ? (lang === 'es' ? question.question_es : question.question_en)
            : `${lang === 'en' ? 'Question ID' : 'ID de Pregunta'}: ${questionId}`
          
          let answerText = ''
          if (question) {
            if (question.question_type === 'multiple_choice' && question.options) {
              const selectedOption = question.options.find((opt: any) =>
                opt.label_es === answer || opt.label_en === answer
              )
              answerText = selectedOption
                ? (lang === 'es' ? selectedOption.label_es : selectedOption.label_en)
                : String(answer)
            } else if (question.question_type === 'yes_no') {
              answerText = answer === 'yes' || answer === 'si'
                ? (lang === 'es' ? 'Sí' : 'Yes')
                : (lang === 'es' ? 'No' : 'No')
            } else {
              answerText = String(answer)
            }
          } else {
            answerText = typeof answer === 'object' ? JSON.stringify(answer) : String(answer)
          }

          const lines = doc.splitTextToSize(`${questionText}: ${answerText}`, pageWidth - 40)
          doc.text(lines, 20, yPosition)
          yPosition += lines.length * 5 + 3
        })
      }

      yPosition += 5

      // Price Summary
      if (yPosition > pageHeight - 50) {
        doc.addPage()
        yPosition = 20
      }
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(lang === 'en' ? 'Price Summary' : 'Resumen del Precio', 20, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`${lang === 'en' ? 'Subtotal' : 'Subtotal'}: ${formatCurrency(quotation.subtotal)}`, 20, yPosition)
      yPosition += 7
      doc.text(`IVA (16%): ${formatCurrency(quotation.iva)}`, 20, yPosition)
      yPosition += 7
      
      // Línea divisoria con color de marca
      doc.setDrawColor(brandColor.r, brandColor.g, brandColor.b)
      doc.setLineWidth(0.5)
      doc.line(20, yPosition, pageWidth - 20, yPosition)
      yPosition += 7
      
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      // Total con color de marca
      doc.setTextColor(brandColor.r, brandColor.g, brandColor.b)
      doc.text(`${lang === 'en' ? 'Total' : 'Total'}: ${formatCurrency(quotation.total)}`, 20, yPosition)

      // Save PDF
      const fileName = `cotizacion-${quotation.id}-${new Date().toISOString().split('T')[0]}.pdf`
      doc.save(fileName)
      
      toast.success(lang === 'en' ? 'PDF generated successfully' : 'PDF generado exitosamente')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error(lang === 'en' ? 'Error generating PDF' : 'Error al generar PDF')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const sendEmail = async () => {
    setIsSendingEmail(true)
    try {
      const response = await fetch(`/api/quotations/${quotation.id}/send-email`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Mostrar detalles del error si están disponibles
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Error al enviar el correo'
        throw new Error(errorMessage)
      }

      toast.success(lang === 'en' ? 'Email sent successfully' : 'Correo enviado exitosamente')
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error(lang === 'en' ? 'Error sending email' : 'Error al enviar correo', {
        description: error instanceof Error ? error.message : undefined,
        duration: 5000, // Mostrar por más tiempo para que se pueda leer
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const sendWhatsApp = async () => {
    setIsSendingWhatsApp(true)
    try {
      const response = await fetch(`/api/quotations/${quotation.id}/send-whatsapp`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        // Mostrar detalles del error si están disponibles
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || 'Error al enviar WhatsApp'
        throw new Error(errorMessage)
      }

      toast.success(lang === 'en' ? 'WhatsApp message sent successfully' : 'Mensaje de WhatsApp enviado exitosamente')
    } catch (error) {
      console.error('Error sending WhatsApp:', error)
      toast.error(lang === 'en' ? 'Error sending WhatsApp' : 'Error al enviar WhatsApp', {
        description: error instanceof Error ? error.message : undefined,
        duration: 6000, // Mostrar por más tiempo para que se pueda leer
      })
    } finally {
      setIsSendingWhatsApp(false)
    }
  }

  const getAIRecommendation = async () => {
    setIsGettingAIRecommendation(true)
    try {
      const response = await fetch(`/api/quotations/${quotation.id}/ai-recommendation`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al obtener recomendación de IA')
      }

      const data = await response.json()
      setAiRecommendation(data.recommendation)
      
      // Auto-completar campos si están vacíos
      if (!finalPrice && data.recommendation.recommended_price) {
        setFinalPrice(data.recommendation.recommended_price.toString())
      }
      if (!estimatedTime && data.recommendation.recommended_time_days) {
        setEstimatedTime(data.recommendation.recommended_time_days.toString())
      }

      toast.success(lang === 'en' ? 'AI recommendation generated successfully' : 'Recomendación de IA generada exitosamente')
    } catch (error) {
      console.error('Error getting AI recommendation:', error)
      toast.error(lang === 'en' ? 'Error getting AI recommendation' : 'Error al obtener recomendación de IA', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsGettingAIRecommendation(false)
    }
  }

  const saveAdminFields = async () => {
    setIsSaving(true)
    try {
      const updateData: any = {}
      
      if (finalPrice) {
        const price = parseFloat(finalPrice)
        if (isNaN(price) || price < 0) {
          throw new Error(lang === 'en' ? 'Invalid price' : 'Precio inválido')
        }
        updateData.final_price = price
      }

      if (estimatedTime) {
        const time = parseInt(estimatedTime)
        if (isNaN(time) || time < 0) {
          throw new Error(lang === 'en' ? 'Invalid time' : 'Tiempo inválido')
        }
        updateData.estimated_development_time = time
      }

      const response = await fetch(`/api/quotations/${quotation.id}/update-admin-fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al guardar')
      }

      toast.success(lang === 'en' ? 'Saved successfully' : 'Guardado exitosamente')
      router.refresh()
    } catch (error) {
      console.error('Error saving admin fields:', error)
      toast.error(lang === 'en' ? 'Error saving' : 'Error al guardar', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const convertToDeal = async () => {
    setIsConvertingToDeal(true)
    try {
      const supabase = createClient()

      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error(lang === 'en' ? 'User not authenticated' : 'Usuario no autenticado')
      }

      // Buscar o crear contacto basado en la información de la cotización
      let contactId: string | null = null
      
      if (quotation.client_email) {
        // Buscar contacto existente por email
        const { data: existingContact } = await supabase
          .from('contacts')
          .select('id')
          .eq('email', quotation.client_email)
          .single()

        if (existingContact) {
          contactId = existingContact.id
        } else {
          // Crear nuevo contacto
          const { data: newContact, error: contactError } = await supabase
            .from('contacts')
            .insert({
              first_name: quotation.client_name?.split(' ')[0] || '',
              last_name: quotation.client_name?.split(' ').slice(1).join(' ') || '',
              email: quotation.client_email,
              phone: quotation.client_phone || null,
              company: quotation.client_company || null,
              contact_type: 'prospect',
              status: 'active',
              created_by: user.id,
            })
            .select('id')
            .single()

          if (contactError) throw contactError
          contactId = newContact.id
        }
      }

      // Crear el deal
      const dealData = {
        contact_id: contactId,
        service_id: quotation.service_id || null,
        title: quotation.title || `${lang === 'en' ? 'Deal from Quotation' : 'Negocio de Cotización'}: ${quotation.client_name}`,
        description: quotation.description || null,
        value: quotation.final_price || quotation.total,
        currency: 'MXN',
        stage: 'qualification', // Note: stage value remains 'qualification' in DB, but displayed as 'Prospección'
        probability: 50,
        created_by: user.id,
      }

      const { data: newDeal, error: dealError } = await supabase
        .from('deals')
        .insert(dealData)
        .select('id')
        .single()

      if (dealError) throw dealError

      // Asociar la cotización al deal
      const { error: updateError } = await supabase
        .from('quotations')
        .update({ deal_id: newDeal.id, status: 'converted' })
        .eq('id', quotation.id)

      if (updateError) throw updateError

      toast.success(lang === 'en' ? 'Quotation converted to deal successfully' : 'Cotización convertida a negocio exitosamente')
      router.push(`/${lang}/dashboard/admin/crm/deals/${newDeal.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error converting quotation to deal:', error)
      toast.error(lang === 'en' ? 'Error converting to deal' : 'Error al convertir a negocio', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsConvertingToDeal(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Título y Descripción */}
      {(quotation.title || quotation.description) && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{quotation.title || (lang === 'en' ? 'Quotation Details' : 'Detalles de la Cotización')}</CardTitle>
          </CardHeader>
          {quotation.description && (
            <CardContent>
              <p className="text-base whitespace-pre-wrap text-foreground">{quotation.description}</p>
            </CardContent>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={generatePDF}
          disabled={isGeneratingPDF}
          variant="outline"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {lang === 'en' ? 'Generating...' : 'Generando...'}
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {lang === 'en' ? 'Generate PDF' : 'Generar PDF'}
            </>
          )}
        </Button>
        <Button
          onClick={sendEmail}
          disabled={isSendingEmail || !quotation.client_email}
          variant="outline"
        >
          {isSendingEmail ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {lang === 'en' ? 'Sending...' : 'Enviando...'}
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              {lang === 'en' ? 'Send by Email' : 'Enviar por Correo'}
            </>
          )}
        </Button>
        <Button
          onClick={sendWhatsApp}
          disabled={isSendingWhatsApp || !quotation.client_phone}
          variant="outline"
        >
          {isSendingWhatsApp ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {lang === 'en' ? 'Sending...' : 'Enviando...'}
            </>
          ) : (
            <>
              <MessageCircle className="mr-2 h-4 w-4" />
              {lang === 'en' ? 'Send by WhatsApp' : 'Enviar por WhatsApp'}
            </>
          )}
        </Button>
        {!quotation.deal_id && (
          <Button
            onClick={convertToDeal}
            disabled={isConvertingToDeal}
            variant="outline"
          >
            {isConvertingToDeal ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {lang === 'en' ? 'Converting...' : 'Convirtiendo...'}
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                {lang === 'en' ? 'Convert to Deal' : 'Convertir a Negocio'}
              </>
            )}
          </Button>
        )}
        {quotation.deal_id && (
          <Button asChild variant="outline">
            <Link href={`/${lang}/dashboard/admin/crm/deals/${quotation.deal_id}`}>
              <Briefcase className="mr-2 h-4 w-4" />
              {lang === 'en' ? 'View Deal' : 'Ver Negocio'}
            </Link>
          </Button>
        )}
      </div>

      {/* Información General */}
      <Card className="bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{lang === 'en' ? 'General Information' : 'Información General'}</CardTitle>
            <Badge variant="outline" className={statusColors[quotation.status as keyof typeof statusColors]}>
              {statusLabels[quotation.status as keyof typeof statusLabels][lang]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Client Name' : 'Nombre del Cliente'}
              </label>
              <p className="text-base font-medium">{quotation.client_name || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Email' : 'Correo'}
              </label>
              <p className="text-base font-medium">{quotation.client_email || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Phone Number' : 'Número de Teléfono'}
              </label>
              <p className="text-base font-medium">{quotation.client_phone || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Company' : 'Empresa'}
              </label>
              <p className="text-base font-medium">{quotation.client_company || '-'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Service' : 'Servicio'}
              </label>
              <p className="text-base font-medium">{serviceName || '-'}</p>
            </div>
            {quotation.title && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {lang === 'en' ? 'Title' : 'Título'}
                </label>
                <p className="text-base font-medium">{quotation.title}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Created At' : 'Fecha de Creación'}
              </label>
              <p className="text-base font-medium">
                {quotation.created_at ? formatDate(quotation.created_at) : '-'}
              </p>
            </div>
            {quotation.valid_until && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {lang === 'en' ? 'Valid Until' : 'Válida Hasta'}
                </label>
                <p className="text-base font-medium">{formatDate(quotation.valid_until)}</p>
              </div>
            )}
            {quotation.deal_id && quotation.deals && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {lang === 'en' ? 'Associated Deal' : 'Negocio Asociado'}
                </label>
                <div className="mt-1">
                  <Link
                    href={`/${lang}/dashboard/admin/crm/deals/${quotation.deal_id}`}
                    className="text-base font-medium text-primary hover:underline"
                  >
                    {quotation.deals.title}
                    {quotation.deals.contacts && (
                      <span className="text-muted-foreground ml-2">
                        - {quotation.deals.contacts.first_name} {quotation.deals.contacts.last_name}
                        {quotation.deals.contacts.company && ` (${quotation.deals.contacts.company})`}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>
          {quotation.description && (
            <div className="mt-4">
              <label className="text-sm font-medium text-muted-foreground">
                {lang === 'en' ? 'Description' : 'Descripción'}
              </label>
              <p className="text-base whitespace-pre-wrap text-foreground mt-2">{quotation.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Respuestas del Cuestionario */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{lang === 'en' ? 'Questionnaire Answers' : 'Respuestas del Cuestionario'}</CardTitle>
          <CardDescription>
            {lang === 'en'
              ? 'Answers provided by the client'
              : 'Respuestas proporcionadas por el cliente'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {quotation.answers && Object.keys(quotation.answers).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(quotation.answers).map(([questionId, answer]) => {
                const question = questions.find(q => q.id === questionId)
                const questionText = question
                  ? (lang === 'es' ? question.question_es : question.question_en)
                  : `${lang === 'en' ? 'Question ID' : 'ID de Pregunta'}: ${questionId}`
                
                let answerText = ''
                if (question) {
                  if (question.question_type === 'multiple_choice' && question.options) {
                    const selectedOption = question.options.find((opt: any) =>
                      opt.label_es === answer || opt.label_en === answer
                    )
                    answerText = selectedOption
                      ? (lang === 'es' ? selectedOption.label_es : selectedOption.label_en)
                      : String(answer)
                  } else if (question.question_type === 'yes_no') {
                    answerText = answer === 'yes' || answer === 'si'
                      ? (lang === 'es' ? 'Sí' : 'Yes')
                      : (lang === 'es' ? 'No' : 'No')
                  } else {
                    answerText = String(answer)
                  }
                } else {
                  answerText = typeof answer === 'object' ? JSON.stringify(answer) : String(answer)
                }

                return (
                  <div key={questionId} className="p-4 border rounded-lg">
                    <p className="text-sm font-medium mb-2">{questionText}</p>
                    <p className="text-base">{answerText}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">
              {lang === 'en' ? 'No answers provided' : 'No se proporcionaron respuestas'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Resumen de Precio */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{lang === 'en' ? 'Price Summary' : 'Resumen del Precio'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{lang === 'en' ? 'Subtotal' : 'Subtotal'}:</span>
            <span className="font-medium">{formatCurrency(quotation.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">IVA (16%):</span>
            <span className="font-medium">{formatCurrency(quotation.iva)}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between text-lg font-bold">
            <span>{lang === 'en' ? 'Total (Calculated)' : 'Total (Calculado)'}:</span>
            <span className="text-primary">{formatCurrency(quotation.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Administración: Precio Final y Tiempo Estimado */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>{lang === 'en' ? 'Admin Settings' : 'Configuración de Administrador'}</CardTitle>
          <CardDescription>
            {lang === 'en'
              ? 'Set final price and estimated development time for the client'
              : 'Establece el precio final y tiempo estimado de desarrollo para el cliente'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Botón para obtener recomendación de IA */}
          <div className="flex items-center justify-between p-4 bg-white rounded-lg">
            <div>
              <p className="font-medium mb-1">
                {lang === 'en' ? 'AI Recommendation' : 'Recomendación de IA'}
              </p>
              <p className="text-sm text-muted-foreground">
                {lang === 'en'
                  ? 'Get AI-powered recommendations for price and development time'
                  : 'Obtén recomendaciones de IA para precio y tiempo de desarrollo'}
              </p>
            </div>
            <Button
              onClick={getAIRecommendation}
              disabled={isGettingAIRecommendation}
              variant="outline"
            >
              {isGettingAIRecommendation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {lang === 'en' ? 'Analyzing...' : 'Analizando...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {lang === 'en' ? 'Get AI Recommendation' : 'Obtener Recomendación de IA'}
                </>
              )}
            </Button>
          </div>

          {/* Mostrar recomendación de IA si existe */}
          {aiRecommendation && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                {lang === 'en' ? 'AI Recommendation' : 'Recomendación de IA'}
              </h4>
              <div className="space-y-2 text-sm">
                {aiRecommendation.recommended_price && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {lang === 'en' ? 'Recommended Price' : 'Precio Recomendado'}:
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(aiRecommendation.recommended_price)}
                    </span>
                  </div>
                )}
                {aiRecommendation.recommended_time_days && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {lang === 'en' ? 'Recommended Time' : 'Tiempo Recomendado'}:
                    </span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {aiRecommendation.recommended_time_days} {lang === 'en' ? 'days' : 'días'}
                    </span>
                  </div>
                )}
                {aiRecommendation.reasoning && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-muted-foreground mb-1 font-medium">
                      {lang === 'en' ? 'Reasoning' : 'Razonamiento'}:
                    </p>
                    <p className="text-sm">{aiRecommendation.reasoning}</p>
                  </div>
                )}
                {aiRecommendation.analysis && (
                  <div className="mt-2">
                    <p className="text-muted-foreground mb-1 font-medium">
                      {lang === 'en' ? 'Analysis' : 'Análisis'}:
                    </p>
                    <p className="text-sm">{aiRecommendation.analysis}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Campos de entrada */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="final-price">
                {lang === 'en' ? 'Final Price (MXN)' : 'Precio Final (MXN)'}
              </Label>
              <Input
                id="final-price"
                type="number"
                step="0.01"
                min="0"
                value={finalPrice}
                onChange={(e) => setFinalPrice(e.target.value)}
                placeholder={formatCurrency(quotation.total)}
                className="!border-2 !border-border bg-white"
              />
              <p className="text-xs text-muted-foreground">
                {lang === 'en'
                  ? 'Price to be charged to the client'
                  : 'Precio que se cobrará al cliente'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated-time">
                {lang === 'en' ? 'Estimated Development Time (days)' : 'Tiempo Estimado de Desarrollo (días)'}
              </Label>
              <Input
                id="estimated-time"
                type="number"
                min="0"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="0"
                className="!border-2 !border-border bg-white"
              />
              <p className="text-xs text-muted-foreground">
                {lang === 'en'
                  ? 'Estimated time in business days'
                  : 'Tiempo estimado en días hábiles'}
              </p>
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="flex justify-end">
            <Button
              onClick={saveAdminFields}
              disabled={isSaving || (!finalPrice && !estimatedTime)}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {lang === 'en' ? 'Saving...' : 'Guardando...'}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {lang === 'en' ? 'Save' : 'Guardar'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      {quotation.notes && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>{lang === 'en' ? 'Notes' : 'Notas'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{quotation.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

