'use client'

import { useState, useEffect } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { QuotationOption } from '@/types/database'
import { Plus, Trash2 } from 'lucide-react'
import { TranslateButton } from '@/components/ui/translate-button'

const questionSchema = z.object({
  service_id: z.string().min(1, 'El servicio es requerido'),
  question_es: z.string().min(1, 'La pregunta en español es requerida'),
  question_en: z.string().min(1, 'La pregunta en inglés es requerida'),
  question_type: z.enum(['multiple_choice', 'yes_no', 'number', 'range']),
  base_price: z.number().min(0, 'El precio base debe ser mayor o igual a 0'),
  price_multiplier: z.number().min(0, 'El multiplicador debe ser mayor o igual a 0'),
  is_required: z.boolean(),
  order_index: z.number(),
})

type QuestionFormValues = z.infer<typeof questionSchema>

interface QuestionFormProps {
  services: any[]
  dict: Dictionary
  lang: Locale
  question?: any
  defaultServiceId?: string
}

export function QuestionForm({ services, dict, lang, question, defaultServiceId }: QuestionFormProps) {
  const router = useRouter()
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<QuotationOption[]>([])
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      service_id: question?.service_id || defaultServiceId || '',
      question_es: question?.question_es || '',
      question_en: question?.question_en || '',
      question_type: question?.question_type || 'yes_no',
      base_price: question?.base_price || 0,
      price_multiplier: question?.price_multiplier || 0,
      is_required: question?.is_required ?? true,
      order_index: question?.order_index || 0,
    },
  })

  const questionType = form.watch('question_type')
  const questionEs = form.watch('question_es')
  const questionEn = form.watch('question_en')

  // Inicializar opciones si es edición
  useEffect(() => {
    if (question && question.options) {
      setMultipleChoiceOptions(question.options)
    }
  }, [question])

  // Resetear opciones cuando cambia el tipo de pregunta
  useEffect(() => {
    if (questionType !== 'multiple_choice') {
      setMultipleChoiceOptions([])
    }
  }, [questionType])

  function addMultipleChoiceOption() {
    setMultipleChoiceOptions([
      ...multipleChoiceOptions,
      { label_es: '', label_en: '', price: 0 },
    ])
  }

  function updateMultipleChoiceOption(index: number, field: keyof QuotationOption, value: string | number) {
    const updated = [...multipleChoiceOptions]
    updated[index] = { ...updated[index], [field]: value }
    setMultipleChoiceOptions(updated)
  }

  function removeMultipleChoiceOption(index: number) {
    setMultipleChoiceOptions(multipleChoiceOptions.filter((_, i) => i !== index))
  }

  async function onSubmit(values: QuestionFormValues) {
    setIsSaving(true)
    try {
      const supabase = createClient()

      // Validar opciones de multiple choice
      if (values.question_type === 'multiple_choice') {
        if (multipleChoiceOptions.length === 0) {
          toast.error(lang === 'en' ? 'Add at least one option' : 'Agrega al menos una opción')
          setIsSaving(false)
          return
        }
        for (const option of multipleChoiceOptions) {
          if (!option.label_es || !option.label_en) {
            toast.error(lang === 'en' ? 'All options must have labels in both languages' : 'Todas las opciones deben tener etiquetas en ambos idiomas')
            setIsSaving(false)
            return
          }
        }
      }

      const questionData: any = {
        service_id: values.service_id,
        question_es: values.question_es,
        question_en: values.question_en,
        question_type: values.question_type,
        base_price: values.base_price,
        price_multiplier: values.price_multiplier,
        is_required: values.is_required,
        order_index: values.order_index,
      }

      if (values.question_type === 'multiple_choice') {
        questionData.options = multipleChoiceOptions
      } else {
        questionData.options = null
      }

      if (question) {
        // Actualizar
        const { error } = await supabase
          .from('quotation_questions')
          .update(questionData)
          .eq('id', question.id)

        if (error) throw error
        toast.success(lang === 'en' ? 'Question updated successfully' : 'Pregunta actualizada exitosamente')
      } else {
        // Crear
        const { error } = await supabase
          .from('quotation_questions')
          .insert([questionData])

        if (error) throw error
        toast.success(lang === 'en' ? 'Question created successfully' : 'Pregunta creada exitosamente')
      }

      router.push(`/${lang}/dashboard/admin/quotations/questions`)
      router.refresh()
    } catch (error) {
      console.error('Error saving question:', error)
      toast.error(lang === 'en' ? 'Error saving question' : 'Error al guardar pregunta')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'Service' : 'Servicio'}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full !border-2 !border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map(service => (
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

              <FormField
                control={form.control}
                name="question_es"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <FormLabel>{lang === 'en' ? 'Question (Spanish)' : 'Pregunta (Español)'}</FormLabel>
                      <TranslateButton
                        text={field.value}
                        targetValue={questionEn}
                        onTranslate={(translated) => form.setValue('question_en', translated)}
                      />
                    </div>
                    <FormControl>
                      <Textarea {...field} className="!border-2 !border-border min-h-[100px] py-3" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="question_en"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2">{lang === 'en' ? 'Question (English)' : 'Pregunta (Inglés)'}</FormLabel>
                    <FormControl>
                      <Textarea {...field} className="!border-2 !border-border min-h-[100px] py-3" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="question_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'Question Type' : 'Tipo de Pregunta'}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full !border-2 !border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="multiple_choice">
                          {lang === 'en' ? 'Multiple Choice' : 'Opción Múltiple'}
                        </SelectItem>
                        <SelectItem value="yes_no">
                          {lang === 'en' ? 'Yes/No' : 'Sí/No'}
                        </SelectItem>
                        <SelectItem value="number">
                          {lang === 'en' ? 'Number' : 'Número'}
                        </SelectItem>
                        <SelectItem value="range">
                          {lang === 'en' ? 'Range' : 'Rango'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Opciones para Multiple Choice */}
              {questionType === 'multiple_choice' && (
                <div className="space-y-4 p-4 border rounded-lg bg-accent/50">
                  <div className="flex items-center justify-between">
                    <FormLabel>{lang === 'en' ? 'Options' : 'Opciones'}</FormLabel>
                    <Button type="button" variant="outline" size="sm" onClick={addMultipleChoiceOption}>
                      <Plus className="mr-2 h-4 w-4" />
                      {lang === 'en' ? 'Add Option' : 'Agregar Opción'}
                    </Button>
                  </div>
                  {multipleChoiceOptions.map((option, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 border rounded bg-background">
                      <div className="flex-1 space-y-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium">
                              {lang === 'en' ? 'Label (Spanish)' : 'Etiqueta (Español)'}
                            </label>
                            <TranslateButton
                              text={option.label_es}
                              targetValue={option.label_en}
                              onTranslate={(translated) => updateMultipleChoiceOption(index, 'label_en', translated)}
                            />
                          </div>
                          <Input
                            value={option.label_es}
                            onChange={(e) => updateMultipleChoiceOption(index, 'label_es', e.target.value)}
                            className="!border-2 !border-border"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1">
                            {lang === 'en' ? 'Label (English)' : 'Etiqueta (Inglés)'}
                          </label>
                          <Input
                            value={option.label_en}
                            onChange={(e) => updateMultipleChoiceOption(index, 'label_en', e.target.value)}
                            className="!border-2 !border-border"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1">
                            {lang === 'en' ? 'Price' : 'Precio'}
                          </label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={option.price === 0 ? '' : option.price.toString()}
                            onChange={(e) => {
                              const value = e.target.value.trim()
                              if (value === '') {
                                updateMultipleChoiceOption(index, 'price', 0)
                              } else {
                                // Remover caracteres no numéricos excepto punto decimal
                                const cleanValue = value.replace(/[^\d.]/g, '')
                                // Permitir solo un punto decimal
                                const parts = cleanValue.split('.')
                                const finalValue = parts.length > 2 
                                  ? parts[0] + '.' + parts.slice(1).join('')
                                  : cleanValue
                                
                                if (finalValue === '' || finalValue === '.') {
                                  updateMultipleChoiceOption(index, 'price', 0)
                                } else {
                                  const numValue = parseFloat(finalValue)
                                  if (!isNaN(numValue) && numValue >= 0) {
                                    updateMultipleChoiceOption(index, 'price', numValue)
                                  }
                                }
                              }
                            }}
                            onFocus={(e) => {
                              e.target.select()
                            }}
                            className="!border-2 !border-border"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMultipleChoiceOption(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {multipleChoiceOptions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {lang === 'en' ? 'No options yet. Add at least one option.' : 'Aún no hay opciones. Agrega al menos una opción.'}
                    </p>
                  )}
                </div>
              )}

              {/* Precio Base */}
              {questionType !== 'multiple_choice' && (
                <FormField
                  control={form.control}
                  name="base_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {questionType === 'yes_no'
                          ? (lang === 'en' ? 'Price if Yes' : 'Precio si Sí')
                          : (lang === 'en' ? 'Base Price' : 'Precio Base')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={field.value === 0 ? '' : field.value.toString()}
                          onChange={(e) => {
                            const value = e.target.value.trim()
                            if (value === '') {
                              field.onChange(0)
                            } else {
                              // Remover caracteres no numéricos excepto punto decimal
                              const cleanValue = value.replace(/[^\d.]/g, '')
                              // Permitir solo un punto decimal
                              const parts = cleanValue.split('.')
                              const finalValue = parts.length > 2 
                                ? parts[0] + '.' + parts.slice(1).join('')
                                : cleanValue
                              
                              if (finalValue === '' || finalValue === '.') {
                                field.onChange(0)
                              } else {
                                const numValue = parseFloat(finalValue)
                                if (!isNaN(numValue) && numValue >= 0) {
                                  field.onChange(numValue)
                                }
                              }
                            }
                          }}
                          onFocus={(e) => {
                            e.target.select()
                          }}
                          className="!border-2 !border-border"
                        />
                      </FormControl>
                      <FormDescription>
                        {questionType === 'yes_no'
                          ? (lang === 'en' ? 'Price added when user selects "Yes"' : 'Precio agregado cuando el usuario selecciona "Sí"')
                          : (lang === 'en' ? 'Base price for this question' : 'Precio base para esta pregunta')}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Multiplicador de Precio */}
              {(questionType === 'number' || questionType === 'range') && (
                <FormField
                  control={form.control}
                  name="price_multiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{lang === 'en' ? 'Price Multiplier' : 'Multiplicador de Precio'}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={field.value === 0 ? '' : field.value.toString()}
                          onChange={(e) => {
                            const value = e.target.value.trim()
                            if (value === '') {
                              field.onChange(0)
                            } else {
                              // Remover caracteres no numéricos excepto punto decimal
                              const cleanValue = value.replace(/[^\d.]/g, '')
                              // Permitir solo un punto decimal
                              const parts = cleanValue.split('.')
                              const finalValue = parts.length > 2 
                                ? parts[0] + '.' + parts.slice(1).join('')
                                : cleanValue
                              
                              if (finalValue === '' || finalValue === '.') {
                                field.onChange(0)
                              } else {
                                const numValue = parseFloat(finalValue)
                                if (!isNaN(numValue) && numValue >= 0) {
                                  field.onChange(numValue)
                                }
                              }
                            }
                          }}
                          onFocus={(e) => {
                            e.target.select()
                          }}
                          className="!border-2 !border-border"
                        />
                      </FormControl>
                      <FormDescription>
                        {lang === 'en'
                          ? 'Price per unit (multiplied by the user\'s answer)'
                          : 'Precio por unidad (multiplicado por la respuesta del usuario)'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="is_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {lang === 'en' ? 'Required Question' : 'Pregunta Requerida'}
                      </FormLabel>
                      <FormDescription>
                        {lang === 'en'
                          ? 'User must answer this question to proceed'
                          : 'El usuario debe responder esta pregunta para continuar'}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />


              <div className="flex gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  {lang === 'en' ? 'Cancel' : 'Cancelar'}
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving
                    ? (lang === 'en' ? 'Saving...' : 'Guardando...')
                    : question
                      ? (lang === 'en' ? 'Update Question' : 'Actualizar Pregunta')
                      : (lang === 'en' ? 'Create Question' : 'Crear Pregunta')}
                </Button>
              </div>
            </form>
          </Form>
  )
}

