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
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { QuotationQuestion } from '@/types/database'
import { Calculator, Mail, User, Building2 } from 'lucide-react'

const quotationSchema = z.object({
  service_id: z.string().min(1, 'El servicio es requerido'),
  client_name: z.string().min(2, 'El nombre es requerido'),
  client_email: z.string().email('Email inválido'),
  client_company: z.string().optional(),
  answers: z.record(z.any()),
})

type QuotationFormValues = z.infer<typeof quotationSchema>

interface PublicQuotationFormProps {
  services: any[]
  dict: Dictionary
  lang: Locale
}

const IVA_RATE = 0.16 // 16% IVA

export function PublicQuotationForm({
  services,
  dict,
  lang,
}: PublicQuotationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<QuotationQuestion[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [iva, setIva] = useState(0)
  const [total, setTotal] = useState(0)
  const [showQuotation, setShowQuotation] = useState(false)
  const [quotationSaved, setQuotationSaved] = useState(false)

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      service_id: '',
      client_name: '',
      client_email: '',
      client_company: '',
      answers: {},
    },
  })

  const selectedServiceId = form.watch('service_id')
  const answers = form.watch('answers')

  // Cargar preguntas cuando cambia el servicio
  useEffect(() => {
    if (selectedServiceId) {
      loadQuestions(selectedServiceId)
    } else {
      setQuestions([])
      setShowQuotation(false)
    }
  }, [selectedServiceId])

  // Calcular precio cuando cambian las respuestas
  useEffect(() => {
    if (questions.length > 0 && showQuotation) {
      calculatePrice()
    }
  }, [answers, questions, showQuotation])

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
      form.setValue('answers', {})
      setShowQuotation(false)
    } catch (error) {
      console.error('Error loading questions:', error)
      toast.error(
        lang === 'en' ? 'Error loading questions' : 'Error al cargar las preguntas'
      )
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  function calculatePrice() {
    let calculatedSubtotal = 0

    questions.forEach((question) => {
      const answer = answers[question.id]

      switch (question.question_type) {
        case 'multiple_choice':
          if (answer && question.options && Array.isArray(question.options)) {
            const selectedOption = question.options.find(
              (opt) => opt.label_es === answer || opt.label_en === answer
            )
            if (selectedOption) {
              calculatedSubtotal += selectedOption.price || 0
            }
          }
          break

        case 'multiple_selection':
          if (answer && Array.isArray(answer) && question.options && Array.isArray(question.options)) {
            answer.forEach((selectedLabel: string) => {
              const selectedOption = question.options!.find(
                (opt) => opt.label_es === selectedLabel || opt.label_en === selectedLabel
              )
              if (selectedOption) {
                calculatedSubtotal += selectedOption.price || 0
              }
            })
          }
          break

        case 'yes_no':
          if (answer === 'yes' || answer === 'si') {
            calculatedSubtotal += question.base_price || 0
          }
          break

        case 'number':
        case 'range':
          if (answer && !isNaN(Number(answer))) {
            calculatedSubtotal +=
              (question.base_price || 0) * Number(answer) * (question.price_multiplier || 1)
          }
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
        user_id: null, // Usuario público/anónimo
        service_id: values.service_id,
        client_name: values.client_name,
        client_email: values.client_email,
        client_company: values.client_company || null,
        answers: values.answers,
        subtotal: subtotal,
        iva: iva,
        total: total,
        status: 'pending' as const,
      }

      const { error } = await supabase.from('quotations').insert([quotationData])

      if (error) throw error

      setQuotationSaved(true)
      toast.success(
        lang === 'en' ? 'Quotation saved successfully!' : '¡Cotización guardada exitosamente!',
        {
          description:
            lang === 'en'
              ? 'We will contact you soon at ' + values.client_email
              : 'Te contactaremos pronto a ' + values.client_email,
        }
      )
    } catch (error) {
      console.error('Error saving quotation:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Error al guardar la cotización'
      toast.error(lang === 'en' ? 'Error saving quotation' : 'Error al guardar la cotización', {
        description: errorMessage,
      })
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

  if (quotationSaved) {
    return (
      <div className="text-center py-12 space-y-6">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
          <svg
            className="w-10 h-10 text-green-600 dark:text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">
          {lang === 'en' ? 'Quotation Sent!' : '¡Cotización Enviada!'}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          {lang === 'en'
            ? 'Thank you for your interest. We will review your quotation and contact you soon.'
            : 'Gracias por tu interés. Revisaremos tu cotización y te contactaremos pronto.'}
        </p>
        <div className="pt-6">
          <Button onClick={() => window.location.reload()} variant="outline">
            {lang === 'en' ? 'Request Another Quote' : 'Solicitar Otra Cotización'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Información del cliente */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            {lang === 'en' ? 'Your Information' : 'Tu Información'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="client_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Full Name' : 'Nombre Completo'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={lang === 'en' ? 'John Doe' : 'Juan Pérez'}
                      className="!border-2 !border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="client_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Email' : 'Correo Electrónico'}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder={lang === 'en' ? 'john@example.com' : 'juan@ejemplo.com'}
                      className="!border-2 !border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="client_company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {lang === 'en' ? 'Company (Optional)' : 'Empresa (Opcional)'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={lang === 'en' ? 'Acme Inc.' : 'Mi Empresa S.A.'}
                    className="!border-2 !border-border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Selector de servicio */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {lang === 'en' ? 'Select Service' : 'Seleccionar Servicio'}
          </h2>
          <FormField
            control={form.control}
            name="service_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Service' : 'Servicio'}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full !border-2 !border-border">
                      <SelectValue
                        placeholder={lang === 'en' ? 'Select a service' : 'Selecciona un servicio'}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="w-full max-w-full">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {lang === 'es' ? service.title_es : service.title_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Preguntas */}
        {isLoadingQuestions && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">
              {lang === 'en' ? 'Loading questions...' : 'Cargando preguntas...'}
            </p>
          </div>
        )}

        {!isLoadingQuestions && selectedServiceId && questions.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {lang === 'en' ? 'Quotation Questions' : 'Preguntas de Cotización'}
            </h2>
            <div className="space-y-6">
              {questions.map((question, index) => {
                const questionText = lang === 'es' ? question.question_es : question.question_en

                return (
                  <div
                    key={question.id}
                    className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <h3 className="font-medium text-lg mb-4">
                            {questionText}
                            {question.is_required && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </h3>

                          {question.question_type === 'multiple_choice' && question.options && (
                            <RadioGroup
                              value={answers[question.id] || ''}
                              onValueChange={(value) => {
                                form.setValue(`answers.${question.id}`, value)
                                setTimeout(() => calculatePrice(), 0)
                              }}
                            >
                              {question.options.map((option, optIndex) => {
                                const optionLabel =
                                  lang === 'es' ? option.label_es : option.label_en

                                return (
                                  <div key={optIndex} className="flex items-center space-x-2 py-2">
                                    <RadioGroupItem
                                      value={optionLabel}
                                      id={`${question.id}-${optIndex}`}
                                      className="!border-2 !border-gray-400 dark:!border-gray-500"
                                    />
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

                          {question.question_type === 'multiple_selection' && question.options && (
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => {
                                const optionLabel =
                                  lang === 'es' ? option.label_es : option.label_en
                                const currentAnswers = answers[question.id] || []
                                const isChecked =
                                  Array.isArray(currentAnswers) &&
                                  currentAnswers.includes(optionLabel)

                                return (
                                  <div key={optIndex} className="flex items-center space-x-2 py-2">
                                    <Checkbox
                                      id={`${question.id}-${optIndex}`}
                                      checked={isChecked}
                                      onCheckedChange={(checked) => {
                                        const currentAnswers = answers[question.id] || []
                                        let newAnswers: string[]

                                        if (checked) {
                                          newAnswers = Array.isArray(currentAnswers)
                                            ? [...currentAnswers, optionLabel]
                                            : [optionLabel]
                                        } else {
                                          newAnswers = Array.isArray(currentAnswers)
                                            ? currentAnswers.filter((a: string) => a !== optionLabel)
                                            : []
                                        }

                                        form.setValue(`answers.${question.id}`, newAnswers)
                                        setTimeout(() => calculatePrice(), 0)
                                      }}
                                      className="!border-2 !border-gray-400 dark:!border-gray-500"
                                    />
                                    <label
                                      htmlFor={`${question.id}-${optIndex}`}
                                      className="text-sm font-normal cursor-pointer flex-1"
                                    >
                                      {optionLabel}
                                    </label>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                          {question.question_type === 'yes_no' && (
                            <RadioGroup
                              value={answers[question.id] || 'no'}
                              onValueChange={(value) => {
                                form.setValue(`answers.${question.id}`, value)
                                setTimeout(() => calculatePrice(), 0)
                              }}
                            >
                              <div className="flex items-center space-x-2 py-2">
                                <RadioGroupItem
                                  value="yes"
                                  id={`${question.id}-yes`}
                                  className="!border-2 !border-gray-400 dark:!border-gray-500"
                                />
                                <label
                                  htmlFor={`${question.id}-yes`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {lang === 'es' ? 'Sí' : 'Yes'}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 py-2">
                                <RadioGroupItem
                                  value="no"
                                  id={`${question.id}-no`}
                                  className="!border-2 !border-gray-400 dark:!border-gray-500"
                                />
                                <label
                                  htmlFor={`${question.id}-no`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {lang === 'es' ? 'No' : 'No'}
                                </label>
                              </div>
                            </RadioGroup>
                          )}

                          {question.question_type === 'number' && (
                            <div className="space-y-2">
                              <Input
                                type="number"
                                min={1}
                                value={answers[question.id] || 1}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1
                                  form.setValue(`answers.${question.id}`, value)
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
                                onValueChange={(value) => {
                                  form.setValue(`answers.${question.id}`, value[0])
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

        {/* Resumen de Precio */}
        {showQuotation && selectedServiceId && questions.length > 0 && (
          <div className="space-y-3 p-6 rounded-lg bg-green-50 dark:bg-green-950/20 border-2 border-green-500">
            <h2 className="text-lg font-semibold text-green-700 dark:text-green-400">
              {lang === 'en' ? 'Price Summary' : 'Resumen del Precio'}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {lang === 'en' ? 'Subtotal' : 'Subtotal'}:
                </span>
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

        {/* Botón */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={
              isSubmitting ||
              isLoadingQuestions ||
              !selectedServiceId ||
              questions.length === 0 ||
              !form.watch('client_name') ||
              !form.watch('client_email')
            }
            className="w-full md:w-auto px-8"
          >
            <Calculator className="mr-2 h-5 w-5" />
            {isSubmitting
              ? lang === 'en'
                ? 'Saving...'
                : 'Guardando...'
              : showQuotation
              ? lang === 'en'
                ? 'Request Quotation'
                : 'Solicitar Cotización'
              : lang === 'en'
              ? 'Calculate Quote'
              : 'Calcular Cotización'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
