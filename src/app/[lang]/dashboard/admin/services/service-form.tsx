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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { ServiceFormProps } from '@/types/forms'
import { X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { TranslateButton } from '@/components/ui/translate-button'

// Función para generar slug desde un texto
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final
}

const serviceSchema = z.object({
  title_es: z.string().min(1, 'El título en español es requerido'),
  title_en: z.string().min(1, 'Title in English is required'),
  description_es: z.string().min(10, 'La descripción en español debe tener al menos 10 caracteres'),
  description_en: z.string().min(10, 'Description in English must be at least 10 characters'),
  slug: z.string().min(1, 'El slug es requerido'),
  image_url: z.string().optional(),
  benefits_es: z.array(z.string()).optional(),
  benefits_en: z.array(z.string()).optional(),
})

type ServiceFormValues = z.infer<typeof serviceSchema>

export function ServiceForm({ dict, lang, service }: ServiceFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(service?.image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!service

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      title_es: service?.title_es || service?.title || '',
      title_en: service?.title_en || service?.title || '',
      description_es: service?.description_es || service?.description || '',
      description_en: service?.description_en || service?.description || '',
      slug: service?.slug || '',
      image_url: service?.image_url || '',
      benefits_es: service?.benefits_es || [],
      benefits_en: service?.benefits_en || [],
    },
  })

  // Generar slug automáticamente basado en el título en inglés
  const titleEn = form.watch('title_en')
  const currentSlug = form.watch('slug')

  useEffect(() => {
    if (!isEditing) {
      if (titleEn && titleEn.trim()) {
        const newSlug = generateSlug(titleEn)
        if (newSlug && newSlug !== currentSlug) {
          form.setValue('slug', newSlug, { shouldValidate: false })
        }
      } else {
        // Si el título está vacío, limpiar el slug
        if (currentSlug) {
          form.setValue('slug', '', { shouldValidate: false })
        }
      }
    }
  }, [titleEn, isEditing, form, currentSlug])

  // Función helper para extraer el path del storage desde la URL pública
  function getStoragePathFromUrl(url: string, bucketName: string): string | null {
    try {
      const urlParts = url.split(`/storage/v1/object/public/${bucketName}/`)
      return urlParts[1] || null
    } catch {
      return null
    }
  }

  // Función para eliminar imagen del storage
  async function deleteImageFromStorage(imageUrl: string) {
    try {
      const supabase = createClient()
      const filePath = getStoragePathFromUrl(imageUrl, 'service-images')

      if (!filePath) {
        console.warn('No se pudo extraer el path de la imagen:', imageUrl)
        return
      }

      const { error } = await supabase.storage
        .from('service-images')
        .remove([filePath])

      if (error) {
        console.error('Error al eliminar imagen del storage:', error)
      }
    } catch (error) {
      console.error('Error al eliminar imagen:', error)
    }
  }

  async function handleFileUpload(file: File) {
    setIsUploading(true)
    try {
      const supabase = createClient()

      // Obtener el slug actual del formulario
      const currentSlug = form.getValues('slug')

      if (!currentSlug) {
        toast.error(lang === 'en' ? 'Please enter a title first to generate the slug' : 'Por favor ingresa un título primero para generar el slug')
        setIsUploading(false)
        return
      }

      // Eliminar imagen anterior si existe
      const currentImageUrl = form.getValues('image_url')
      if (currentImageUrl) {
        await deleteImageFromStorage(currentImageUrl)
      }

      // Nueva estructura: /<slug>/nombre-original.ext
      const filePath = `${currentSlug}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Permitir sobrescribir la imagen existente
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath)

      form.setValue('image_url', data.publicUrl)
      setPreviewImage(data.publicUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(lang === 'en' ? 'Error uploading image' : 'Error al subir la imagen', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(lang === 'en' ? 'Image size must be less than 5MB' : 'El tamaño de la imagen debe ser menor a 5MB')
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error(lang === 'en' ? 'Please select an image file' : 'Por favor selecciona un archivo de imagen')
        return
      }
      handleFileUpload(file)
    }
  }

  async function handleRemoveImage() {
    const currentImageUrl = form.getValues('image_url')

    // Eliminar del storage
    if (currentImageUrl) {
      await deleteImageFromStorage(currentImageUrl)
    }

    // Limpiar el formulario
    form.setValue('image_url', '')
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function onSubmit(values: ServiceFormValues) {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const data = {
        ...values,
        image_url: values.image_url || null,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('services')
          .update(data)
          .eq('id', service.id)

        if (error) throw error
        toast.success(lang === 'en' ? 'Service updated successfully' : 'Servicio actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('services')
          .insert([data])

        if (error) throw error
        toast.success(lang === 'en' ? 'Service created successfully' : 'Servicio creado exitosamente')
      }

      router.push(`/${lang}/dashboard/admin/services`)
      router.refresh()
    } catch (error) {
      console.error('Error saving service:', error)
      toast.error(
        lang === 'en' ? 'Error saving service' : 'Error al guardar el servicio',
        {
          description: error instanceof Error ? error.message : undefined,
        }
      )
    } finally {
      setIsSubmitting(false)
    }
  }

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
              name="title_es"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Título</FormLabel>
                    <TranslateButton
                      text={field.value}
                      targetValue={form.watch('title_en')}
                      onTranslate={(translated) => form.setValue('title_en', translated)}
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
                    <FormLabel>Descripción</FormLabel>
                    <TranslateButton
                      text={field.value}
                      targetValue={form.watch('description_en')}
                      onTranslate={(translated) => form.setValue('description_en', translated)}
                    />
                  </div>
                  <FormControl>
                    <Textarea {...field} rows={4} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="benefits_es"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beneficios</FormLabel>
                  <div className="space-y-2">
                    {field.value?.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={benefit}
                          onChange={(e) => {
                            const newBenefits = [...(field.value || [])]
                            newBenefits[index] = e.target.value
                            field.onChange(newBenefits)
                          }}
                          className="!border-2 !border-border"
                          placeholder="Ej: Ahorro de tiempo"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newBenefits = field.value?.filter((_, i) => i !== index)
                            field.onChange(newBenefits)
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        field.onChange([...(field.value || []), ''])
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar beneficio
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="en" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title_en"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} className="!border-2 !border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        readOnly={!isEditing}
                        className={`!border-2 !border-border ${!isEditing ? "bg-muted cursor-not-allowed" : ""}`}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="benefits_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Benefits</FormLabel>
                  <div className="space-y-2">
                    {field.value?.map((benefit, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={benefit}
                          onChange={(e) => {
                            const newBenefits = [...(field.value || [])]
                            newBenefits[index] = e.target.value
                            field.onChange(newBenefits)
                          }}
                          className="!border-2 !border-border"
                          placeholder="E.g: Time saving"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            const newBenefits = field.value?.filter((_, i) => i !== index)
                            field.onChange(newBenefits)
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        field.onChange([...(field.value || []), ''])
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add benefit
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'en' ? 'Image' : 'Imagen'}</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {previewImage ? (
                    <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {lang === 'en' ? 'Click to upload image' : 'Haz clic para subir imagen'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {lang === 'en' ? 'PNG, JPG, GIF up to 5MB' : 'PNG, JPG, GIF hasta 5MB'}
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {isUploading && (
                    <p className="text-sm text-muted-foreground">
                      {lang === 'en' ? 'Uploading...' : 'Subiendo...'}
                    </p>
                  )}
                </div>
              </FormControl>
              <FormMessage />
              <input type="hidden" {...field} />
            </FormItem>
          )}
        />
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${lang}/dashboard/admin/services`)}
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
