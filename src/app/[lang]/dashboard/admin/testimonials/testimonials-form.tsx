'use client'

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
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { TestimonialFormProps } from '@/types/forms'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TranslateButton } from '@/components/ui/translate-button'

const testimonialSchema = z.object({
  company_id: z.string().min(1, 'La empresa es requerida'),
  content_es: z.string().min(10, 'El testimonio en español debe tener al menos 10 caracteres'),
  content_en: z.string().min(10, 'Testimonial in English must be at least 10 characters'),
})

type TestimonialFormValues = z.infer<typeof testimonialSchema>

export function TestimonialForm({ dict, lang, testimonial }: TestimonialFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [companies, setCompanies] = useState<Array<{ value: string; label: string }>>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const isEditing = !!testimonial

  const form = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      company_id: testimonial?.company_id || '',
      content_es: testimonial?.content_es || testimonial?.content || '',
      content_en: testimonial?.content_en || testimonial?.content || '',
    },
  })

  // Cargar empresas desde la API
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('companies')
          .select('id, name')
          .order('name')

        if (error) throw error

        const companyOptions = (data || []).map((company) => ({
          value: company.id,
          label: company.name,
        }))
        setCompanies(companyOptions)
      } catch (error) {
        console.error('Error fetching companies:', error)
      } finally {
        setIsLoadingCompanies(false)
      }
    }

    fetchCompanies()
  }, [])

  async function onSubmit(values: TestimonialFormValues) {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      // Obtener el nombre de la empresa para mantener compatibilidad con el campo company
      const selectedCompany = companies.find(c => c.value === values.company_id)
      const companyName = selectedCompany?.label || ''

      const data = {
        company_id: values.company_id,
        company: companyName, // Mantener para compatibilidad
        content_es: values.content_es,
        content_en: values.content_en,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('testimonials')
          .update(data)
          .eq('id', testimonial.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([data])

        if (error) throw error
      }

      router.push(`/${lang}/dashboard/admin/testimonials`)
      router.refresh()
    } catch (error) {
      console.error('Error saving testimonial:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="company_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{lang === 'en' ? 'Company' : 'Empresa'}</FormLabel>
              <Popover open={companyOpen} onOpenChange={setCompanyOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={companyOpen}
                      className="w-full justify-between !border-2 !border-border"
                    >
                      {isLoadingCompanies ? (
                        lang === 'en' ? 'Loading...' : 'Cargando...'
                      ) : field.value ? (
                        companies.find((company) => company.value === field.value)?.label
                      ) : (
                        lang === 'en' ? 'Select company...' : 'Seleccionar empresa...'
                      )}
                      {!isLoadingCompanies && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
                  <Command>
                    <CommandInput
                      placeholder={lang === 'en' ? 'Search company...' : 'Buscar empresa...'}
                      className="h-9"
                    />
                    <CommandList>
                      <CommandEmpty>
                        {lang === 'en' ? 'No company found.' : 'No se encontró empresa.'}
                      </CommandEmpty>
                      <CommandGroup>
                        {companies.map((company) => (
                          <CommandItem
                            key={company.value}
                            value={company.label}
                            onSelect={() => {
                              field.onChange(company.value === field.value ? '' : company.value)
                              setCompanyOpen(false)
                            }}
                          >
                            {company.label}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                field.value === company.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Tabs defaultValue="es" className="w-full">
          <TabsList>
            <TabsTrigger value="es">Español</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          <TabsContent value="es" className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="content_es"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Testimonio</FormLabel>
                    <TranslateButton
                      text={field.value}
                      targetValue={form.watch('content_en')}
                      onTranslate={(translated) => form.setValue('content_en', translated)}
                    />
                  </div>
                  <FormControl>
                    <Textarea {...field} rows={6} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="en" className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="content_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testimonial</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={6} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${lang}/dashboard/admin/testimonials`)}
          >
            {dict.dashboard.admin.crud.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? (lang === 'en' ? 'Saving...' : 'Guardando...')
              : dict.dashboard.admin.crud.save}
          </Button>
        </div>
      </form>
    </Form>
  )
}
