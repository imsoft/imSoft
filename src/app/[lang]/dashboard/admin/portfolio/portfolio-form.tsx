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
import type { PortfolioFormProps } from '@/types/forms'
import { X, Image as ImageIcon, Check, ChevronsUpDown } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { TranslateButton } from '@/components/ui/translate-button'
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

// Función para generar slug desde un texto
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final
}

// Las empresas se cargarán dinámicamente desde la API

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

const portfolioSchema = z.object({
  title_es: z.string().min(1, 'El título en español es requerido'),
  title_en: z.string().min(1, 'Title in English is required'),
  description_es: z.string().min(10, 'La descripción en español debe tener al menos 10 caracteres'),
  description_en: z.string().min(10, 'Description in English must be at least 10 characters'),
  slug: z.string().min(1, 'El slug es requerido'),
  image_url: z.string().optional(),
  project_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  company_id: z.string().min(1, 'La empresa es requerida'),
  project_type: z.string().min(1, 'El tipo de proyecto es requerido'),
})

type PortfolioFormValues = z.infer<typeof portfolioSchema>

export function PortfolioForm({ dict, lang, portfolio }: PortfolioFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(portfolio?.image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [projectTypeOpen, setProjectTypeOpen] = useState(false)
  const [companies, setCompanies] = useState<Array<{ value: string; label: string }>>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const isEditing = !!portfolio

  const form = useForm<PortfolioFormValues>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title_es: portfolio?.title_es || portfolio?.title || '',
      title_en: portfolio?.title_en || portfolio?.title || '',
      description_es: portfolio?.description_es || portfolio?.description || '',
      description_en: portfolio?.description_en || portfolio?.description || '',
      slug: portfolio?.slug || '',
      image_url: portfolio?.image_url || '',
      project_url: portfolio?.project_url || '',
      company_id: portfolio?.company_id || '',
      project_type: portfolio?.project_type || '',
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
      const filePath = getStoragePathFromUrl(imageUrl, 'portfolio-images')

      if (!filePath) {
        console.warn('No se pudo extraer el path de la imagen:', imageUrl)
        return
      }

      const { error } = await supabase.storage
        .from('portfolio-images')
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
      const portfolioSlug = form.getValues('slug')

      if (!portfolioSlug) {
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
      const filePath = `${portfolioSlug}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('portfolio-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('portfolio-images')
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

  async function onSubmit(values: PortfolioFormValues) {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      
      // Obtener el nombre de la empresa para mantener compatibilidad con el campo client
      const selectedCompany = companies.find(c => c.value === values.company_id)
      const companyName = selectedCompany?.label || ''

      const data = {
        ...values,
        image_url: values.image_url || null,
        project_url: values.project_url || null,
        client: companyName, // Mantener para compatibilidad
      }

      if (isEditing) {
        const { error } = await supabase
          .from('portfolio')
          .update(data)
          .eq('id', portfolio.id)

        if (error) throw error
        toast.success(lang === 'en' ? 'Portfolio item updated successfully' : 'Proyecto de portafolio actualizado exitosamente')
      } else {
        const { error } = await supabase
          .from('portfolio')
          .insert([data])

        if (error) throw error
        toast.success(lang === 'en' ? 'Portfolio item created successfully' : 'Proyecto de portafolio creado exitosamente')
      }

      router.push(`/${lang}/dashboard/admin/portfolio`)
      router.refresh()
    } catch (error) {
      console.error('Error saving portfolio:', error)
      toast.error(
        lang === 'en' ? 'Error saving portfolio item' : 'Error al guardar el proyecto de portafolio',
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
                        className={`!border-2 !border-border ${!isEditing ? "bg-white cursor-not-allowed" : ""}`}
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
                        disabled={isLoadingCompanies}
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
          <FormField
            control={form.control}
            name="project_type"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{lang === 'en' ? 'Project Type' : 'Tipo de Proyecto'}</FormLabel>
                <Popover open={projectTypeOpen} onOpenChange={setProjectTypeOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={projectTypeOpen}
                        className="w-full justify-between !border-2 !border-border"
                      >
                        {field.value
                          ? projectTypes.find((type) => type.value === field.value)?.[lang === 'es' ? 'label_es' : 'label_en']
                          : lang === 'en' ? 'Select project type...' : 'Seleccionar tipo de proyecto...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
                    <Command>
                      <CommandInput 
                        placeholder={lang === 'en' ? 'Search client...' : 'Buscar cliente...'} 
                        className="h-9" 
                      />
                      <CommandList>
                        <CommandEmpty>
                          {lang === 'en' ? 'No project type found.' : 'No se encontró tipo de proyecto.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {projectTypes.map((type) => (
                            <CommandItem
                              key={type.value}
                              value={lang === 'es' ? type.label_es : type.label_en}
                              onSelect={() => {
                                field.onChange(type.value === field.value ? '' : type.value)
                                setProjectTypeOpen(false)
                              }}
                            >
                              {lang === 'es' ? type.label_es : type.label_en}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  field.value === type.value ? "opacity-100" : "opacity-0"
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
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${lang}/dashboard/admin/portfolio`)}
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
