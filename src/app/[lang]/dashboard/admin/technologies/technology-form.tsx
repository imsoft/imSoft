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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import { TranslateButton } from '@/components/ui/translate-button'
import {
  Checkbox,
} from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const technologySchema = z.object({
  name_es: z.string().min(1, 'El nombre en español es requerido'),
  name_en: z.string().min(1, 'El nombre en inglés es requerido'),
  description_es: z.string().min(10, 'La descripción en español debe tener al menos 10 caracteres'),
  description_en: z.string().min(10, 'La descripción en inglés debe tener al menos 10 caracteres'),
  category: z.string().optional(),
  icon: z.string().optional(),
  website_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  order_index: z.number(),
  company_ids: z.array(z.string()),
})

type TechnologyFormValues = z.infer<typeof technologySchema>

interface Technology {
  id: string
  name_es?: string
  name_en?: string
  name?: string
  description_es?: string
  description_en?: string
  category?: string
  icon?: string
  website_url?: string
  order_index?: number
  technology_companies?: Array<{
    company_id: string
  }>
}

interface TechnologyFormProps {
  dict: Dictionary
  lang: Locale
  technology?: Technology
  companies: Array<{ id: string; name: string }>
}

export function TechnologyForm({ dict, lang, technology, companies }: TechnologyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!technology

  const form = useForm<TechnologyFormValues>({
    resolver: zodResolver(technologySchema),
    defaultValues: {
      name_es: technology?.name_es || technology?.name || '',
      name_en: technology?.name_en || technology?.name || '',
      description_es: technology?.description_es || '',
      description_en: technology?.description_en || '',
      category: technology?.category || '',
      icon: technology?.icon || '',
      website_url: technology?.website_url || '',
      order_index: technology?.order_index ?? 0,
      company_ids: technology?.technology_companies?.map(tc => tc.company_id) ?? [],
    },
  })

  async function onSubmit(values: TechnologyFormValues) {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      const technologyData = {
        name_es: values.name_es,
        name_en: values.name_en,
        name: values.name_es, // Fallback
        description_es: values.description_es,
        description_en: values.description_en,
        category: values.category || null,
        icon: values.icon || null,
        website_url: values.website_url || null,
        order_index: values.order_index || 0,
      }

      let technologyId: string

      if (isEditing) {
        const { data, error } = await supabase
          .from('technologies')
          .update(technologyData)
          .eq('id', technology.id)
          .select()
          .single()

        if (error) throw error
        technologyId = data.id
        toast.success((dict as any).technologies?.saveSuccess || (lang === 'en' ? 'Technology saved successfully' : 'Tecnología guardada exitosamente'))
      } else {
        const { data, error } = await supabase
          .from('technologies')
          .insert([technologyData])
          .select()
          .single()

        if (error) throw error
        technologyId = data.id
        toast.success((dict as any).technologies?.saveSuccess || (lang === 'en' ? 'Technology saved successfully' : 'Tecnología guardada exitosamente'))
      }

      // Gestionar relaciones con empresas
      // Primero eliminar todas las relaciones existentes
      const { error: deleteError } = await supabase
        .from('technology_companies')
        .delete()
        .eq('technology_id', technologyId)

      if (deleteError) throw deleteError

      // Luego crear las nuevas relaciones
      if (values.company_ids.length > 0) {
        const relations = values.company_ids.map(companyId => ({
          technology_id: technologyId,
          company_id: companyId,
        }))

        const { error: insertError } = await supabase
          .from('technology_companies')
          .insert(relations)

        if (insertError) throw insertError
      }

      router.push(`/${lang}/dashboard/admin/technologies`)
      router.refresh()
    } catch (error) {
      console.error('Error saving technology:', error)
      toast.error((dict as any).technologies?.saveError || (lang === 'en' ? 'Error saving technology' : 'Error al guardar la tecnología'), {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const categories = [
    { value: 'frontend', label_es: 'Frontend', label_en: 'Frontend' },
    { value: 'backend', label_es: 'Backend', label_en: 'Backend' },
    { value: 'database', label_es: 'Base de Datos', label_en: 'Database' },
    { value: 'devops', label_es: 'DevOps', label_en: 'DevOps' },
    { value: 'mobile', label_es: 'Móvil', label_en: 'Mobile' },
    { value: 'cloud', label_es: 'Cloud', label_en: 'Cloud' },
    { value: 'other', label_es: 'Otro', label_en: 'Other' },
  ]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="es" className="w-full">
          <TabsList>
            <TabsTrigger value="es">Español</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>
          
          <TabsContent value="es" className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="name_es"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{(dict as any).technologies?.nameEs || (lang === 'en' ? 'Name in Spanish' : 'Nombre en Español')}</FormLabel>
                    <TranslateButton
                      text={field.value}
                      targetValue={form.watch('name_en')}
                      onTranslate={(translated) => form.setValue('name_en', translated)}
                    />
                  </div>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description_es"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>{(dict as any).technologies?.descriptionEs || (lang === 'en' ? 'Description in Spanish' : 'Descripción en Español')}</FormLabel>
                    <TranslateButton
                      text={field.value}
                      targetValue={form.watch('description_en')}
                      onTranslate={(translated) => form.setValue('description_en', translated)}
                    />
                  </div>
                  <FormControl>
                    <Textarea {...field} rows={4} className="!border-2 !border-border" />
                  </FormControl>
                  <FormDescription>
                    {lang === 'en' 
                      ? 'Describe what this technology is used for at imSoft'
                      : 'Describe para qué se utiliza esta tecnología en imSoft'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="en" className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{(dict as any).technologies?.nameEn || (lang === 'en' ? 'Name in English' : 'Nombre en Inglés')}</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{(dict as any).technologies?.descriptionEn || (lang === 'en' ? 'Description in English' : 'Descripción en Inglés')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} className="!border-2 !border-border" />
                  </FormControl>
                  <FormDescription>
                    Describe what this technology is used for at imSoft
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{(dict as any).technologies?.category || (lang === 'en' ? 'Category' : 'Categoría')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ''}>
                  <FormControl>
                    <SelectTrigger className="!border-2 !border-border">
                      <SelectValue placeholder={lang === 'en' ? 'Select category' : 'Selecciona categoría'} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {lang === 'es' ? cat.label_es : cat.label_en}
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
            name="order_index"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{(dict as any).technologies?.orderIndex || (lang === 'en' ? 'Order' : 'Orden')}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className="!border-2 !border-border" 
                  />
                </FormControl>
                <FormDescription>
                  {lang === 'en' 
                    ? 'Order for display (lower numbers appear first)'
                    : 'Orden para mostrar (números menores aparecen primero)'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{(dict as any).technologies?.icon || (lang === 'en' ? 'Icon' : 'Icono')}</FormLabel>
                <FormControl>
                  <Input {...field} className="!border-2 !border-border" placeholder="lucide-react icon name or URL" />
                </FormControl>
                <FormDescription>
                  {lang === 'en' 
                    ? 'Icon name from lucide-react or URL to an image'
                    : 'Nombre del icono de lucide-react o URL de una imagen'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{(dict as any).technologies?.websiteUrl || (lang === 'en' ? 'Website URL' : 'URL del Sitio Web')}</FormLabel>
                <FormControl>
                  <Input {...field} type="url" className="!border-2 !border-border" placeholder="https://..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{(dict as any).technologies?.companies || (lang === 'en' ? 'Companies' : 'Empresas')}</CardTitle>
            <CardDescription>
              {(dict as any).technologies?.selectCompanies || (lang === 'en' ? 'Select companies that use this technology' : 'Selecciona empresas que utilizan esta tecnología')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="company_ids"
              render={() => (
                <FormItem>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {companies.map((company) => (
                      <FormField
                        key={company.id}
                        control={form.control}
                        name="company_ids"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={company.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(company.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, company.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== company.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {company.name}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                    {companies.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {lang === 'en' 
                          ? 'No companies available'
                          : 'No hay empresas disponibles'}
                      </p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
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
