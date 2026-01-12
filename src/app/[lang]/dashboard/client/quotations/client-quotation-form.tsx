'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { QuotationQuestion } from '@/types/database'
import { Calculator } from 'lucide-react'

const quotationSchema = z.object({
  service_id: z.string().min(1, 'El servicio es requerido'),
  company_id: z.string().min(1, 'La empresa es requerida'),
  answers: z.record(z.any()),
})

type QuotationFormValues = z.infer<typeof quotationSchema>

interface ClientQuotationFormProps {
  services: any[]
  dict: Dictionary
  lang: Locale
  userId: string
  userName: string
  userEmail: string
  companies: Array<{ id: string; name: string }>
}

const IVA_RATE = 0.16 // 16% IVA

export function ClientQuotationForm({ 
  services, 
  dict, 
  lang, 
  userId, 
  userName, 
  userEmail,
  companies 
}: ClientQuotationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<QuotationQuestion[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [iva, setIva] = useState(0)
  const [total, setTotal] = useState(0)
  const [showQuotation, setShowQuotation] = useState(false)

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      service_id: '',
      company_id: '',
      answers: {},
    },
  })

  const selectedServiceId = form.watch('service_id')
  const companyId = form.watch('company_id')
  const answers = form.watch('answers')

  // Cargar preguntas cuando cambia el servicio
  useEffect(() => {
    if (selectedServiceId) {
      loadQuestions(selectedServiceId)
    } else {
      setQuestions([])
    }
  }, [selectedServiceId])

  // Calcular precio en tiempo real cuando cambian las respuestas
  useEffect(() => {
    if (questions.length > 0) {
      calculatePrice()
    }
  }, [answers, questions])

  async function loadQuestions(serviceId: string) {
    setIsLoadingQuestions(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('quotation_questions')
        .select('*')
        .eq('service_id', serviceId)
        .order('order_index')

      if (error) throw error

      setQuestions(data || [])

      // Inicializar respuestas con valores por defecto
      const defaultAnswers: Record<string, any> = {}
      data?.forEach(q => {
        if (q.question_type === 'yes_no') {
          defaultAnswers[q.id] = 'no'
        } else if (q.question_type === 'number') {
          defaultAnswers[q.id] = 1
        } else if (q.question_type === 'range') {
          defaultAnswers[q.id] = 1
        }
      })
      form.setValue('answers', defaultAnswers)
    } catch (error) {
      console.error('Error loading questions:', error)
      toast.error(lang === 'en' ? 'Error loading questions' : 'Error al cargar preguntas')
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  function calculatePrice() {
    let calculatedSubtotal = 0

    questions.forEach(question => {
      const answer = answers[question.id]

      // Si la pregunta es requerida y no hay respuesta, no sumar nada
      if (question.is_required && !answer) {
        return
      }

      // Si no es requerida y no hay respuesta, no sumar nada
      if (!answer) {
        return
      }

      switch (question.question_type) {
        case 'multiple_choice':
          if (answer && question.options) {
            const selectedOption = question.options.find(opt =>
              opt.label_es === answer || opt.label_en === answer
            )
            if (selectedOption) {
              calculatedSubtotal += selectedOption.price || 0
            }
          }
          break

        case 'yes_no':
          if (answer === 'yes' || answer === 'si') {
            calculatedSubtotal += question.base_price || 0
          }
          break

        case 'number':
        case 'range':
          const numValue = Number(answer) || 0
          const basePrice = question.base_price || 0
          const multiplier = question.price_multiplier || 0
          calculatedSubtotal += basePrice + (numValue * multiplier)
          break
      }
    })

    const calculatedIva = calculatedSubtotal * IVA_RATE
    const calculatedTotal = calculatedSubtotal + calculatedIva

    setSubtotal(calculatedSubtotal)
    setIva(calculatedIva)
    setTotal(calculatedTotal)
  }

  async function onSubmit(values: QuotationFormValues) {
    // Si aún no se ha mostrado la cotización, solo calcular y mostrar
    if (!showQuotation) {
      calculatePrice()
      setShowQuotation(true)
      return
    }

    // Si ya se mostró la cotización, guardarla
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      const quotationData = {
        user_id: userId,
        service_id: values.service_id,
        client_name: userName,
        client_email: userEmail,
        client_company: companies.find(c => c.id === values.company_id)?.name || '',
        answers: values.answers,
        subtotal: Number(subtotal.toFixed(2)),
        iva: Number(iva.toFixed(2)),
        total: Number(total.toFixed(2)),
        status: 'pending',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      }

      const { error } = await supabase
        .from('quotations')
        .insert([quotationData])

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      toast.success(lang === 'en' ? 'Quotation created successfully' : 'Cotización creada exitosamente')
      router.push(`/${lang}/dashboard/client/quotations`)
      router.refresh()
    } catch (error) {
      console.error('Error creating quotation:', error)
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error)
      toast.error(
        lang === 'en' ? 'Error creating quotation' : 'Error al crear cotización',
        {
          description: errorMessage,
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="company_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Company' : 'Empresa'}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full !border-2 !border-gray-400 dark:!border-gray-500">
                      <SelectValue placeholder={lang === 'en' ? 'Select a company...' : 'Selecciona una empresa...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="service_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Service' : 'Servicio'}</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full !border-2 !border-gray-400 dark:!border-gray-500">
                      <SelectValue placeholder={lang === 'en' ? 'Select a service...' : 'Selecciona un servicio...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {lang === 'es' ? service.title_es : service.title_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Preguntas del Cuestionario */}
        {selectedServiceId && questions.length > 0 && (
          <div className="space-y-6 p-6 rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                <Calculator className="h-5 w-5" />
                {lang === 'en' ? 'Questionnaire' : 'Cuestionario'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {lang === 'en'
                  ? 'Answer the following questions to calculate the price'
                  : 'Responde las siguientes preguntas para calcular el precio'}
              </p>
            </div>
            <div className="space-y-6">
              {questions.map((question, index) => {
                const questionText = lang === 'es' ? question.question_es : question.question_en

                return (
                  <div key={question.id} className="space-y-3 pb-6 border-b last:border-0">
                    <div className="flex items-start gap-2">
                      <span className="flex items-center justify-center size-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {questionText}
                          {question.is_required && <span className="text-destructive ml-1">*</span>}
                        </label>

                        <div className="mt-3">
                          {question.question_type === 'multiple_choice' && question.options && (
                            <RadioGroup
                              value={answers[question.id] || ''}
                              onValueChange={(value) => {
                                form.setValue(`answers.${question.id}`, value)
                                // Forzar recálculo
                                setTimeout(() => calculatePrice(), 0)
                              }}
                            >
                              {question.options.map((option, optIndex) => {
                                const optionLabel = lang === 'es' ? option.label_es : option.label_en
                                return (
                                  <div key={optIndex} className="flex items-center space-x-2 py-2">
                                    <RadioGroupItem value={optionLabel} id={`${question.id}-${optIndex}`} className="!border-2 !border-gray-400 dark:!border-gray-500" />
                                    <label
                                      htmlFor={`${question.id}-${optIndex}`}
                                      className="text-sm font-normal cursor-pointer flex-1"
                                    >
                                      {optionLabel}
                                    </label>
                                  </div>
                                )
                              })}
                            </RadioGroup>
                          )}

                          {question.question_type === 'yes_no' && (
                            <RadioGroup
                              value={answers[question.id] || 'no'}
                              onValueChange={(value) => {
                                form.setValue(`answers.${question.id}`, value)
                                // Forzar recálculo
                                setTimeout(() => calculatePrice(), 0)
                              }}
                            >
                              <div className="flex items-center space-x-2 py-2">
                                <RadioGroupItem value="yes" id={`${question.id}-yes`} className="!border-2 !border-gray-400 dark:!border-gray-500" />
                                <label htmlFor={`${question.id}-yes`} className="text-sm font-normal cursor-pointer">
                                  {lang === 'es' ? 'Sí' : 'Yes'}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 py-2">
                                <RadioGroupItem value="no" id={`${question.id}-no`} className="!border-2 !border-gray-400 dark:!border-gray-500" />
                                <label htmlFor={`${question.id}-no`} className="text-sm font-normal cursor-pointer">
                                  {lang === 'es' ? 'No' : 'No'}
                                </label>
                              </div>
                            </RadioGroup>
                          )}

                          {question.question_type === 'number' && (
                            <div className="space-y-2">
                              <Input
                                type="number"
                                min="1"
                                value={answers[question.id] || 1}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1
                                  form.setValue(`answers.${question.id}`, value)
                                  // Forzar recálculo
                                  setTimeout(() => calculatePrice(), 0)
                                }}
                                className="!border-2 !border-gray-400 dark:!border-gray-500 w-full"
                              />
                            </div>
                          )}

                          {question.question_type === 'range' && (
                            <div className="space-y-4">
                              <Slider
                                min={1}
                                max={20}
                                step={1}
                                value={[answers[question.id] || 1]}
                                onValueChange={([value]) => {
                                  form.setValue(`answers.${question.id}`, value)
                                  // Forzar recálculo
                                  setTimeout(() => calculatePrice(), 0)
                                }}
                                className="w-full"
                              />
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{answers[question.id] || 1}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}


        {/* Resumen de Precio - Solo se muestra después de cotizar */}
        {showQuotation && selectedServiceId && questions.length > 0 && (
          <div className="space-y-3 p-6 rounded-lg bg-green-50 dark:bg-green-950/20 border-2 border-green-500">
            <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
              {lang === 'en' ? 'Price Summary' : 'Resumen del Precio'}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{lang === 'en' ? 'Subtotal' : 'Subtotal'}:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%):</span>
                <span className="font-medium">{formatCurrency(iva)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span className="text-green-600 dark:text-green-400">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {lang === 'en' ? 'Cancel' : 'Cancelar'}
          </Button>
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isLoadingQuestions ||
              !selectedServiceId ||
              !companyId ||
              questions.length === 0
            }
          >
            <Calculator className="mr-2 h-4 w-4" />
            {isSubmitting
              ? (lang === 'en' ? 'Saving...' : 'Guardando...')
              : showQuotation
              ? (lang === 'en' ? 'Save Quotation' : 'Guardar Cotización')
              : (lang === 'en' ? 'Get Quote' : 'Cotizar')}
          </Button>
        </div>
      </form>
    </Form>
  )
}

