'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Mail, Loader2, Sparkles, Save, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import jsPDF from 'jspdf'
import { useRouter } from 'next/navigation'

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

      // Header
      doc.setFillColor(102, 126, 234)
      doc.rect(0, 0, pageWidth, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text('imSoft', pageWidth / 2, 25, { align: 'center' })
      doc.setFontSize(16)
      doc.text(lang === 'es' ? 'Cotización' : 'Quotation', pageWidth / 2, 35, { align: 'center' })

      // Reset text color
      doc.setTextColor(0, 0, 0)
      yPosition = 50

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
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
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
        throw new Error(errorData.error || 'Error al enviar el correo')
      }

      toast.success(lang === 'en' ? 'Email sent successfully' : 'Correo enviado exitosamente')
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error(lang === 'en' ? 'Error sending email' : 'Error al enviar correo', {
        description: error instanceof Error ? error.message : undefined,
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
        throw new Error(errorData.error || 'Error al enviar WhatsApp')
      }

      toast.success(lang === 'en' ? 'WhatsApp message sent successfully' : 'Mensaje de WhatsApp enviado exitosamente')
    } catch (error) {
      console.error('Error sending WhatsApp:', error)
      toast.error(lang === 'en' ? 'Error sending WhatsApp' : 'Error al enviar WhatsApp', {
        description: error instanceof Error ? error.message : undefined,
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

  return (
    <div className="space-y-6">
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
      </div>

      {/* Información General */}
      <Card>
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
          </div>
        </CardContent>
      </Card>

      {/* Respuestas del Cuestionario */}
      <Card>
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
      <Card>
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
      <Card>
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
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
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
        <Card>
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

