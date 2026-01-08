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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import { X, Image as ImageIcon } from 'lucide-react'
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

const projectTypes = [
  { value: 'web-development', label_es: 'Desarrollo Web', label_en: 'Web Development' },
  { value: 'mobile-app', label_es: 'Aplicación Móvil', label_en: 'Mobile App' },
  { value: 'ecommerce', label_es: 'E-commerce', label_en: 'E-commerce' },
  { value: 'landing-page', label_es: 'Página de Aterrizaje', label_en: 'Landing Page' },
  { value: 'web-app', label_es: 'Aplicación Web', label_en: 'Web Application' },
  { value: 'portfolio', label_es: 'Sitio Web Portafolio', label_en: 'Portfolio Website' },
  { value: 'cms', label_es: 'Sistema de Gestión de Contenidos', label_en: 'Content Management System' },
  { value: 'api', label_es: 'Desarrollo de API', label_en: 'API Development' },
]

const statuses = [
  { value: 'planning', label_es: 'Planificación', label_en: 'Planning' },
  { value: 'in-progress', label_es: 'En Progreso', label_en: 'In Progress' },
  { value: 'on-hold', label_es: 'En Pausa', label_en: 'On Hold' },
  { value: 'completed', label_es: 'Completado', label_en: 'Completed' },
  { value: 'cancelled', label_es: 'Cancelado', label_en: 'Cancelled' },
]

const projectSchema = z.object({
  title_es: z.string().min(1, 'El título en español es requerido'),
  title_en: z.string().min(1, 'Title in English is required'),
  description_es: z.string().min(10, 'La descripción en español debe tener al menos 10 caracteres'),
  description_en: z.string().min(10, 'Description in English must be at least 10 characters'),
  slug: z.string().min(1, 'El slug es requerido'),
  image_url: z.string().optional(),
  project_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  resources_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  project_type: z.string().min(1, 'El tipo de proyecto es requerido'),
  status: z.string().min(1, 'El estado es requerido'),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ClientProjectFormProps {
  dict: Dictionary
  lang: Locale
  companyId: string
  companyName: string
}

export function ClientProjectForm({ dict, lang, companyId, companyName }: ClientProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title_es: '',
      title_en: '',
      description_es: '',
      description_en: '',
      slug: '',
      image_url: '',
      project_url: '',
      resources_url: '',
      project_type: '',
      status: 'planning',
    },
  })

  const titleEn = form.watch('title_en')
  const currentSlug = form.watch('slug')

  useEffect(() => {
    if (titleEn) {
      const newSlug = generateSlug(titleEn)
      if (newSlug && newSlug !== currentSlug) {
        form.setValue('slug', newSlug, { shouldValidate: false })
      } else if (!newSlug && currentSlug) {
        form.setValue('slug', '', { shouldValidate: false })
      }
    } else if (currentSlug) {
      form.setValue('slug', '', { shouldValidate: false })
    }
  }, [titleEn, form, currentSlug])

  // Función helper para extraer el path del storage desde la URL pública
  function getStoragePathFromUrl(url: string, bucketName: string): string | null {
    try {
      const urlParts = url.split(`/storage/v1/object/public/${bucketName}/`)
      return urlParts[1] || null
    } catch {
      return null
    }
  }

  async function handleFileUpload(file: File) {
    setIsUploading(true)
    try {
      const supabase = createClient()
      const projectSlug = form.getValues('slug')

      if (!projectSlug) {
        toast.error(lang === 'en' ? 'Please enter a title first to generate the slug' : 'Por favor ingresa un título primero para generar el slug')
        setIsUploading(false)
        return
      }

      // Eliminar imagen anterior si existe
      const currentImageUrl = form.getValues('image_url')
      if (currentImageUrl) {
        const filePath = getStoragePathFromUrl(currentImageUrl, 'project-images')
        if (filePath) {
          await supabase.storage.from('project-images').remove([filePath])
        }
      }

      // Nueva estructura: /<slug>/nombre-original.ext
      const filePath = `${projectSlug}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath)

      form.setValue('image_url', data.publicUrl)
      setPreviewImage(data.publicUrl)
      toast.success(lang === 'en' ? 'Image uploaded successfully' : 'Imagen subida exitosamente')
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

  function handleRemoveImage() {
    const currentImageUrl = form.getValues('image_url')
    if (currentImageUrl) {
      const supabase = createClient()
      const filePath = getStoragePathFromUrl(currentImageUrl, 'project-images')
      if (filePath) {
        supabase.storage.from('project-images').remove([filePath])
      }
    }
    form.setValue('image_url', '')
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function onSubmit(values: ProjectFormValues) {
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      const data = {
        ...values,
        project_url: values.project_url || null,
        resources_url: values.resources_url || null,
        company_id: companyId,
        client: companyName, // Mantener para compatibilidad
      }

      const { error } = await supabase
        .from('projects')
        .insert([data])

      if (error) throw error

      toast.success(lang === 'en' ? 'Project created successfully' : 'Proyecto creado exitosamente')
      router.push(`/${lang}/dashboard/client/projects`)
      router.refresh()
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error(
        lang === 'en' ? 'Error saving project' : 'Error al guardar el proyecto',
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
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">
            {lang === 'en' 
              ? `Company: ${companyName}` 
              : `Empresa: ${companyName}`}
          </p>
        </div>

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
                        readOnly
                        className="!border-2 !border-border bg-muted cursor-not-allowed"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="project_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Project Type' : 'Tipo de Proyecto'}</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">{lang === 'en' ? 'Select project type...' : 'Seleccionar tipo de proyecto...'}</option>
                    {projectTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {lang === 'es' ? type.label_es : type.label_en}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Status' : 'Estado'}</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {lang === 'es' ? status.label_es : status.label_en}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="project_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'en' ? 'Project URL (optional)' : 'URL del Proyecto (opcional)'}</FormLabel>
              <FormControl>
                <Input {...field} type="url" className="!border-2 !border-border" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resources_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lang === 'en' ? 'Resources URL (optional)' : 'URL de Recursos (opcional)'}</FormLabel>
              <FormDescription>
                {lang === 'en' 
                  ? 'Link to external resources like Google Drive with project images and files' 
                  : 'Enlace a recursos externos como Google Drive con imágenes y archivos del proyecto'}
              </FormDescription>
              <FormControl>
                <Input {...field} type="url" className="!border-2 !border-border" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            {lang === 'en' ? 'Cancel' : 'Cancelar'}
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? (
              lang === 'en' ? 'Creating...' : 'Creando...'
            ) : (
              lang === 'en' ? 'Create Project' : 'Crear Proyecto'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

