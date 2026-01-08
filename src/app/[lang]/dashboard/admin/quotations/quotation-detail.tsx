'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'

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

  return (
    <div className="space-y-6">
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
            <span>Total:</span>
            <span className="text-primary">{formatCurrency(quotation.total)}</span>
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

