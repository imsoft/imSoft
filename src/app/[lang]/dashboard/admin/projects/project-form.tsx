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
import { Switch } from '@/components/ui/switch'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Project } from '@/types/database'
import { X, Image as ImageIcon, Check, ChevronsUpDown } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { TranslateButton } from '@/components/ui/translate-button'
import { Checkbox } from '@/components/ui/checkbox'
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
  company_id: z.string().min(1, 'La empresa es requerida'),
  project_type: z.string().min(1, 'El tipo de proyecto es requerido'),
  status: z.string().min(1, 'El estado es requerido'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  total_price: z.string().optional().refine((val) => {
    if (!val || val === '') return true
    const num = parseFloat(val)
    return !isNaN(num) && num >= 0
  }, 'Must be a valid number'),
  currency: z.string().optional(),
  github_repo_url: z.string().optional().refine((val) => {
    if (!val || val === '') return true
    try {
      new URL(val)
      return true
    } catch {
      return false
    }
  }, 'Must be a valid GitHub URL'),
  github_enabled: z.boolean(),
  technology_ids: z.array(z.string()),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  dict: Dictionary
  lang: Locale
  project?: Project
}

export function ProjectForm({ dict, lang, project }: ProjectFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(project?.image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [companyOpen, setCompanyOpen] = useState(false)
  const [projectTypeOpen, setProjectTypeOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [companies, setCompanies] = useState<Array<{ value: string; label: string }>>([])
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true)
  const [technologies, setTechnologies] = useState<Array<{ id: string; name_es?: string; name_en?: string; name?: string }>>([])
  const [isLoadingTechnologies, setIsLoadingTechnologies] = useState(true)
  const isEditing = !!project

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title_es: project?.title_es || project?.title || '',
      title_en: project?.title_en || project?.title || '',
      description_es: project?.description_es || project?.description || '',
      description_en: project?.description_en || project?.description || '',
      slug: project?.slug || '',
      image_url: project?.image_url || '',
      project_url: project?.project_url || '',
      resources_url: project?.resources_url || '',
      company_id: project?.company_id || '',
      project_type: project?.project_type || '',
      status: project?.status || 'planning',
      start_date: project?.start_date || '',
      end_date: project?.end_date || '',
      total_price: project?.total_price?.toString() || '',
      currency: project?.currency || 'MXN',
      github_repo_url: project?.github_repo_url || '',
      github_enabled: project?.github_enabled || false,
      technology_ids: [] as string[],
    },
  })

  // Cargar empresas desde la API
  useEffect(() => {
    async function fetchCompanies() {
      setIsLoadingCompanies(true)
      try {
        const response = await fetch('/api/companies')
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
          console.error('Error fetching companies:', errorData)
          
          // Si la tabla no existe, mostrar un mensaje más útil
          if (errorData.code === 'TABLE_NOT_FOUND' || response.status === 404) {
            toast.error(
              lang === 'en' 
                ? 'Companies table not found' 
                : 'La tabla de empresas no existe',
              {
                description: lang === 'en'
                  ? 'Please create the "companies" table in Supabase. See docs/COMPANIES_SETUP.md for instructions.'
                  : 'Por favor, crea la tabla "companies" en Supabase. Consulta docs/COMPANIES_SETUP.md para las instrucciones.',
              }
            )
          } else if (response.status === 401) {
            toast.error(
              lang === 'en' ? 'You are not authorized' : 'No estás autorizado',
              {
                description: lang === 'en' ? 'Please log in again.' : 'Por favor, inicia sesión nuevamente.',
              }
            )
          } else {
            toast.error(
              lang === 'en' ? 'Error loading companies' : 'Error al cargar empresas',
              {
                description: errorData.error || (lang === 'en' ? 'Unknown error' : 'Error desconocido'),
              }
            )
          }
          return
        }
        const data = await response.json()
        const companyOptions = data.map((company: { id: string; name: string }) => ({
          value: company.id,
          label: company.name,
        }))
        setCompanies(companyOptions)
      } catch (error) {
        console.error('Error fetching companies:', error)
        toast.error(
          lang === 'en' ? 'Error loading companies' : 'Error al cargar empresas',
          {
            description: error instanceof Error ? error.message : (lang === 'en' ? 'Unknown error' : 'Error desconocido'),
          }
        )
      } finally {
        setIsLoadingCompanies(false)
      }
    }
    fetchCompanies()
  }, [lang])

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

  // Cargar tecnologías existentes si estamos editando
  useEffect(() => {
    async function fetchProjectTechnologies() {
      if (!project?.id) return

      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('project_technologies')
          .select('technology_id')
          .eq('project_id', project.id)

        if (error) throw error

        const technologyIds = (data || []).map(pt => pt.technology_id)
        form.setValue('technology_ids', technologyIds)
      } catch (error) {
        console.error('Error fetching project technologies:', error)
      }
    }
    fetchProjectTechnologies()
  }, [project?.id, form])

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
    } else if (!isEditing && currentSlug) {
      form.setValue('slug', '', { shouldValidate: false })
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
      const filePath = getStoragePathFromUrl(imageUrl, 'project-images')

      if (!filePath) {
        console.warn('No se pudo extraer el path de la imagen:', imageUrl)
        return
      }

      const { error } = await supabase.storage
        .from('project-images')
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
      const projectSlug = form.getValues('slug')

      if (!projectSlug) {
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

  async function onSubmit(values: ProjectFormValues) {
    setIsSubmitting(true)
    try {
      const supabase = createClient()

      // Obtener el nombre de la empresa para mantener compatibilidad con el campo client
      const selectedCompany = companies.find(c => c.value === values.company_id)
      const companyName = selectedCompany?.label || ''

      // Extraer owner y repo name de la URL de GitHub
      let github_owner = null
      let github_repo_name = null
      if (values.github_enabled && values.github_repo_url && values.github_repo_url.trim() !== '') {
        try {
          const url = new URL(values.github_repo_url)
          const pathParts = url.pathname.split('/').filter(Boolean)
          if (pathParts.length >= 2) {
            github_owner = pathParts[0]
            github_repo_name = pathParts[1]
          } else {
            throw new Error('Invalid GitHub URL format')
          }
        } catch (error) {
          console.error('Error parsing GitHub URL:', error)
          toast.error(
            lang === 'en' ? 'Invalid GitHub URL' : 'URL de GitHub inválida',
            {
              description: lang === 'en'
                ? 'Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)'
                : 'Por favor ingresa una URL válida de repositorio de GitHub (ej: https://github.com/usuario/repo)'
            }
          )
          setIsSubmitting(false)
          return
        }
      }

      const data = {
        ...values,
        project_url: values.project_url || null,
        resources_url: values.resources_url || null,
        client: companyName, // Mantener para compatibilidad
        start_date: values.start_date || null,
        end_date: values.end_date || null,
        total_price: values.total_price ? parseFloat(values.total_price) : null,
        currency: values.currency || 'MXN',
        github_repo_url: values.github_enabled && values.github_repo_url ? values.github_repo_url : null,
        github_owner: values.github_enabled && github_owner ? github_owner : null,
        github_repo_name: values.github_enabled && github_repo_name ? github_repo_name : null,
        github_enabled: values.github_enabled,
      }

      let projectId: string

      if (project) {
        // Actualizar
        const { error } = await supabase
          .from('projects')
          .update(data)
          .eq('id', project.id)

        if (error) throw error
        projectId = project.id
        toast.success(lang === 'en' ? 'Project updated successfully' : 'Proyecto actualizado exitosamente')
      } else {
        // Crear
        const { data: insertedData, error } = await supabase
          .from('projects')
          .insert([data])
          .select('id')
          .single()

        if (error) throw error
        projectId = insertedData.id
        toast.success(lang === 'en' ? 'Project created successfully' : 'Proyecto creado exitosamente')
      }

      // Guardar relaciones de tecnologías
      if (projectId && values.technology_ids.length > 0) {
        // Eliminar relaciones existentes
        await supabase
          .from('project_technologies')
          .delete()
          .eq('project_id', projectId)

        // Insertar nuevas relaciones
        const technologyRelations = values.technology_ids.map(techId => ({
          project_id: projectId,
          technology_id: techId,
        }))

        const { error: relationError } = await supabase
          .from('project_technologies')
          .insert(technologyRelations)

        if (relationError) {
          console.error('Error saving project technologies:', relationError)
          toast.error(
            lang === 'en' ? 'Error saving technologies' : 'Error al guardar tecnologías',
            {
              description: relationError.message,
            }
          )
        }
      } else if (projectId && values.technology_ids.length === 0) {
        // Si no hay tecnologías seleccionadas, eliminar todas las relaciones
        await supabase
          .from('project_technologies')
          .delete()
          .eq('project_id', projectId)
      }

      router.push(`/${lang}/dashboard/admin/projects`)
      router.refresh()
    } catch (error) {
      console.error('Error saving project:', error)
      let errorMessage = lang === 'en' ? 'Error saving project' : 'Error al guardar el proyecto'
      let errorDescription: string | undefined = undefined
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage
        errorDescription = error.message
      } else if (typeof error === 'object' && error !== null) {
        // Manejar errores de Supabase
        const supabaseError = error as any
        if (supabaseError.message) {
          errorDescription = supabaseError.message
        } else if (supabaseError.code) {
          errorDescription = `Error code: ${supabaseError.code}`
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
      })
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
                        placeholder={lang === 'en' ? 'Search project type...' : 'Buscar tipo de proyecto...'}
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
                              value={type.value}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>{lang === 'en' ? 'Status' : 'Estado'}</FormLabel>
                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={statusOpen}
                        className="w-full justify-between !border-2 !border-border"
                      >
                        {field.value
                          ? statuses.find((status) => status.value === field.value)?.[lang === 'es' ? 'label_es' : 'label_en']
                          : lang === 'en' ? 'Select status...' : 'Seleccionar estado...'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
                    <Command>
                      <CommandInput
                        placeholder={lang === 'en' ? 'Search status...' : 'Buscar estado...'}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {lang === 'en' ? 'No status found.' : 'No se encontró estado.'}
                        </CommandEmpty>
                        <CommandGroup>
                          {statuses.map((status) => (
                            <CommandItem
                              key={status.value}
                              value={status.value}
                              onSelect={() => {
                                field.onChange(status.value === field.value ? '' : status.value)
                                setStatusOpen(false)
                              }}
                            >
                              {lang === 'es' ? status.label_es : status.label_en}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  field.value === status.value ? "opacity-100" : "opacity-0"
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
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Start Date (optional)' : 'Fecha de Inicio (opcional)'}</FormLabel>
                <FormControl>
                  <Input {...field} type="date" className="!border-2 !border-border" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'End Date (optional)' : 'Fecha de Entrega (opcional)'}</FormLabel>
                <FormControl>
                  <Input {...field} type="date" className="!border-2 !border-border" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing Section */}
        <div className="space-y-4 border-t pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {lang === 'en' ? 'Pricing' : 'Precio'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === 'en'
                ? 'Set the total price for this project'
                : 'Establece el precio total para este proyecto'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="total_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Total Price (optional)' : 'Precio Total (opcional)'}</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number" 
                      step="0.01"
                      min="0"
                      className="!border-2 !border-border"
                      onChange={(e) => {
                        const value = e.target.value
                        field.onChange(value === '' ? '' : value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Currency' : 'Moneda'}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border-2 border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="MXN">MXN - Peso Mexicano</option>
                      <option value="USD">USD - Dólar Estadounidense</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Technologies Section */}
        <div className="space-y-4 border-t pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {lang === 'en' ? 'Technologies' : 'Tecnologías'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === 'en'
                ? 'Select the technologies used in this project'
                : 'Selecciona las tecnologías utilizadas en este proyecto'
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

        {/* GitHub Integration Section */}
        <div className="space-y-4 border-t pt-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              {lang === 'en' ? 'GitHub Integration' : 'Integración con GitHub'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === 'en'
                ? 'Connect a GitHub repository to show commit history to your clients'
                : 'Conecta un repositorio de GitHub para mostrar el historial de commits a tus clientes'
              }
            </p>
          </div>

          <FormField
            control={form.control}
            name="github_enabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {lang === 'en' ? 'Enable GitHub Integration' : 'Habilitar Integración con GitHub'}
                  </FormLabel>
                  <FormDescription>
                    {lang === 'en'
                      ? 'Show commit history from GitHub repository to clients'
                      : 'Mostrar historial de commits del repositorio de GitHub a los clientes'
                    }
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {form.watch('github_enabled') && (
            <FormField
              control={form.control}
              name="github_repo_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {lang === 'en' ? 'GitHub Repository URL' : 'URL del Repositorio de GitHub'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      className="!border-2 !border-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${lang}/dashboard/admin/projects`)}
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

