'use client'

import { useState, useEffect, useMemo } from 'react'
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
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { QuotationQuestion } from '@/types/database'
import { Calculator, Save } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

const quotationSchema = z.object({
  service_id: z.string().min(1, 'El servicio es requerido'),
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  client_name: z.string().min(1, 'El nombre del cliente es requerido'),
  client_email: z.string().email('Email inválido'),
  client_phone: z.string().optional(),
  client_company: z.string().optional(),
  answers: z.record(z.any()),
  technology_ids: z.array(z.string()),
})

type QuotationFormValues = z.infer<typeof quotationSchema>

interface QuotationFormProps {
  services: any[]
  dict: Dictionary
  lang: Locale
  userId: string
}

const IVA_RATE = 0.16 // 16% IVA

export function QuotationForm({ services, dict, lang, userId }: QuotationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [questions, setQuestions] = useState<QuotationQuestion[]>([])
  const [technologies, setTechnologies] = useState<Array<{ id: string; name_es?: string; name_en?: string; name?: string }>>([])
  const [isLoadingTechnologies, setIsLoadingTechnologies] = useState(true)
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const [iva, setIva] = useState(0)
  const [total, setTotal] = useState(0)

  // Eliminar servicios duplicados por ID y nombre usando useMemo para mejor rendimiento
  const uniqueServices = useMemo(() => {
    if (!services || services.length === 0) return []
    
    // Primero eliminar duplicados por ID
    const byId = new Map<string, typeof services[0]>()
    services.forEach(service => {
      if (!byId.has(service.id)) {
        byId.set(service.id, service)
      }
    })
    
    // Luego eliminar duplicados por nombre (título)
    const seenTitles = new Set<string>()
    const result: typeof services = []
    
    for (const service of Array.from(byId.values())) {
      const title = (lang === 'es' ? service.title_es : service.title_en)?.toLowerCase().trim() || ''
      const titleKey = title || `__no_title_${service.id}__`
      
      if (!seenTitles.has(titleKey)) {
        seenTitles.add(titleKey)
        result.push(service)
      }
    }
    
    return result
  }, [services, lang])

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      service_id: '',
      title: '',
      description: '',
      client_name: '',
      client_email: '',
      client_phone: '',
      client_company: '',
      answers: {},
      technology_ids: [] as string[],
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
    }
  }, [selectedServiceId])

  // Calcular precio en tiempo real cuando cambian las respuestas
  useEffect(() => {
    calculatePrice()
  }, [answers, questions])

  // Cargar tecnologías
  useEffect(() => {
    async function fetchTechnologies() {
      setIsLoadingTechnologies(true)
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('technologies')
          .select('id, name_es, name_en, name')
          .order('name_es', { ascending: true })

        if (error) throw error

        setTechnologies(data || [])
      } catch (error) {
        console.error('Error fetching technologies:', error)
        toast.error(
          lang === 'en' ? 'Error loading technologies' : 'Error al cargar tecnologías',
          {
            description: error instanceof Error ? error.message : (lang === 'en' ? 'Unknown error' : 'Error desconocido'),
          }
        )
      } finally {
        setIsLoadingTechnologies(false)
      }
    }
    fetchTechnologies()
  }, [])

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

      if (!answer && !question.is_required) return

      switch (question.question_type) {
        case 'multiple_choice':
          if (answer && question.options) {
            const selectedOption = question.options.find(opt =>
              (opt.label_es === answer || opt.label_en === answer)
            )
            if (selectedOption) {
              calculatedSubtotal += selectedOption.price
            }
          }
          break

        case 'yes_no':
          if (answer === 'yes') {
            calculatedSubtotal += question.base_price
          }
          break

        case 'number':
        case 'range':
          const numValue = Number(answer) || 0
          calculatedSubtotal += question.base_price + (numValue * question.price_multiplier)
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
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      const quotationData = {
        user_id: userId,
        service_id: values.service_id,
        title: values.title,
        description: values.description,
        client_name: values.client_name,
        client_email: values.client_email,
        client_phone: values.client_phone || null,
        client_company: values.client_company,
        answers: values.answers,
        subtotal,
        iva,
        total,
        status: 'pending',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      }

      const { data: insertedData, error } = await supabase
        .from('quotations')
        .insert([quotationData])
        .select('id')
        .single()

      if (error) throw error

      // Guardar relaciones de tecnologías
      if (insertedData?.id && values.technology_ids.length > 0) {
        const technologyRelations = values.technology_ids.map(techId => ({
          quotation_id: insertedData.id,
          technology_id: techId,
        }))

        const { error: relationError } = await supabase
          .from('quotation_technologies')
          .insert(technologyRelations)

        if (relationError) {
          console.error('Error saving quotation technologies:', relationError)
          toast.error(
            lang === 'en' ? 'Error saving technologies' : 'Error al guardar tecnologías',
            {
              description: relationError.message,
            }
          )
        }
      }

      toast.success(lang === 'en' ? 'Quotation created successfully' : 'Cotización creada exitosamente')
      router.push(`/${lang}/dashboard/admin/quotations`)
      router.refresh()
    } catch (error) {
      console.error('Error creating quotation:', error)
      toast.error(lang === 'en' ? 'Error creating quotation' : 'Error al crear cotización')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
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
            name="client_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Name' : 'Nombre'}</FormLabel>
                <FormControl>
                  <Input {...field} className="w-full !border-2 !border-border" />
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="w-full !border-2 !border-border" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Phone Number (Optional)' : 'Número de Teléfono (Opcional)'}</FormLabel>
                <FormControl>
                  <Input {...field} type="tel" className="w-full !border-2 !border-border" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Company (Optional)' : 'Empresa (Opcional)'}</FormLabel>
                <FormControl>
                  <Input {...field} className="w-full !border-2 !border-border" />
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
                    <SelectTrigger className="w-full !border-2 !border-border">
                      <SelectValue placeholder={lang === 'en' ? 'Select a service...' : 'Selecciona un servicio...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueServices.map((service) => {
                        const title = lang === 'es' ? service.title_es : service.title_en
                        // Usar el ID como key y value para garantizar unicidad
                        return (
                          <SelectItem key={service.id} value={service.id}>
                            {title}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Quotation Title' : 'Título de la Cotización'}</FormLabel>
                <FormControl>
                  <Input {...field} className="w-full !border-2 !border-border" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Additional Description (Optional)' : 'Descripción Adicional (Opcional)'}</FormLabel>
                <FormControl>
                  <Textarea {...field} className="w-full !border-2 !border-border min-h-[100px]" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Technologies Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                {lang === 'en' ? 'Technologies' : 'Tecnologías'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {lang === 'en'
                  ? 'Select the technologies that will be used in this project'
                  : 'Selecciona las tecnologías que se utilizarán en este proyecto'
                }
              </p>
            </div>

            <FormField
              control={form.control}
              name="technology_ids"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {isLoadingTechnologies ? (
                      <div className="col-span-full text-sm text-muted-foreground">
                        {lang === 'en' ? 'Loading technologies...' : 'Cargando tecnologías...'}
                      </div>
                    ) : technologies.length === 0 ? (
                      <div className="col-span-full text-sm text-muted-foreground">
                        {lang === 'en' ? 'No technologies available' : 'No hay tecnologías disponibles'}
                      </div>
                    ) : (
                      technologies.map((tech) => {
                        const techName = lang === 'es' 
                          ? (tech.name_es || tech.name || '')
                          : (tech.name_en || tech.name || '')
                        return (
                          <FormField
                            key={tech.id}
                            control={form.control}
                            name="technology_ids"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={tech.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 bg-white dark:bg-card"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(tech.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, tech.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== tech.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {techName}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        )
                      })
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Preguntas del Cuestionario */}
        {selectedServiceId && questions.length > 0 && (
          <Card className="bg-white dark:bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {lang === 'en' ? 'Questionnaire' : 'Cuestionario'}
              </CardTitle>
              <CardDescription>
                {lang === 'en'
                  ? 'Answer the following questions to calculate the price'
                  : 'Responde las siguientes preguntas para calcular el precio'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                              }}
                            >
                              {question.options.map((option, optIndex) => {
                                const optionLabel = lang === 'es' ? option.label_es : option.label_en
                                return (
                                  <div key={optIndex} className="flex items-center space-x-2 py-2">
                                    <RadioGroupItem value={optionLabel} id={`${question.id}-${optIndex}`} />
                                    <label
                                      htmlFor={`${question.id}-${optIndex}`}
                                      className="text-sm font-normal cursor-pointer flex-1"
                                    >
                                      {optionLabel}
                                      <span className="ml-2 text-muted-foreground">
                                        (+{formatCurrency(option.price)})
                                      </span>
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
                              }}
                            >
                              <div className="flex items-center space-x-2 py-2">
                                <RadioGroupItem value="yes" id={`${question.id}-yes`} />
                                <label htmlFor={`${question.id}-yes`} className="text-sm font-normal cursor-pointer">
                                  {lang === 'es' ? 'Sí' : 'Yes'}
                                  {question.base_price > 0 && (
                                    <span className="ml-2 text-muted-foreground">
                                      (+{formatCurrency(question.base_price)})
                                    </span>
                                  )}
                                </label>
                              </div>
                              <div className="flex items-center space-x-2 py-2">
                                <RadioGroupItem value="no" id={`${question.id}-no`} />
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
                                  form.setValue(`answers.${question.id}`, parseInt(e.target.value) || 1)
                                }}
                                className="!border-2 !border-border w-full"
                              />
                              {question.price_multiplier > 0 && (
                                <p className="text-xs text-muted-foreground">
                                  {formatCurrency(question.base_price)} + ({formatCurrency(question.price_multiplier)} × cantidad)
                                </p>
                              )}
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
                                }}
                                className="w-full"
                              />
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{answers[question.id] || 1}</span>
                                {question.price_multiplier > 0 && (
                                  <span className="text-muted-foreground">
                                    {formatCurrency(question.base_price + ((answers[question.id] || 1) * question.price_multiplier))}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Resumen de Precio */}
        {selectedServiceId && questions.length > 0 && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>{lang === 'en' ? 'Price Summary' : 'Resumen del Precio'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{lang === 'en' ? 'Subtotal' : 'Subtotal'}:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IVA (16%):</span>
                <span className="font-medium">{formatCurrency(iva)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
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
          <Button type="submit" disabled={isSubmitting || !selectedServiceId || questions.length === 0}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting
              ? (lang === 'en' ? 'Saving...' : 'Guardando...')
              : (lang === 'en' ? 'Save Quotation' : 'Guardar Cotización')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
