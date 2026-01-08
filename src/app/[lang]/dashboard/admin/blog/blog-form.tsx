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
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { BlogFormProps } from '@/types/forms'
import { X, Image as ImageIcon, Check, ChevronsUpDown } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
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
import { RichTextEditor } from '@/components/ui/rich-text-editor'
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

// Lista de categorías para el combobox
const categories = [
  { value: 'technology', label_es: 'Tecnología', label_en: 'Technology' },
  { value: 'design', label_es: 'Diseño', label_en: 'Design' },
  { value: 'business', label_es: 'Negocios', label_en: 'Business' },
  { value: 'marketing', label_es: 'Marketing', label_en: 'Marketing' },
  { value: 'development', label_es: 'Desarrollo', label_en: 'Development' },
  { value: 'tutorials', label_es: 'Tutoriales', label_en: 'Tutorials' },
  { value: 'news', label_es: 'Noticias', label_en: 'News' },
  { value: 'tips', label_es: 'Tips y Trucos', label_en: 'Tips & Tricks' },
]

const blogSchema = z.object({
  title_es: z.string().min(1, 'El título en español es requerido'),
  title_en: z.string().min(1, 'Title in English is required'),
  content_es: z.string().min(50, 'El contenido en español debe tener al menos 50 caracteres'),
  content_en: z.string().min(50, 'Content in English must be at least 50 characters'),
  excerpt_es: z.string().optional(),
  excerpt_en: z.string().optional(),
  slug: z.string().min(1, 'El slug es requerido'),
  image_url: z.string().optional(),
  category: z.string().min(1, 'La categoría es requerida'),
  author_id: z.string().min(1, 'El autor es requerido'),
  published: z.boolean(),
})

type BlogFormValues = z.infer<typeof blogSchema>

export function BlogForm({ dict, lang, post }: BlogFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(post?.image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [authorOpen, setAuthorOpen] = useState(false)
  const [authors, setAuthors] = useState<Array<{ value: string; label: string }>>([])
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const isEditing = !!post

  // Obtener usuario actual y lista de autores
  useEffect(() => {
    async function fetchCurrentUserAndAuthors() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setCurrentUserId(user.id)
        }

        // Obtener lista de usuarios (solo admins)
        const response = await fetch('/api/users')
        if (response.ok) {
          const usersData = await response.json()
          const authorOptions = usersData.map((user: { id: string; full_name: string; email: string }) => ({
            value: user.id,
            label: user.full_name || user.email || 'Usuario',
          }))
          setAuthors(authorOptions)
        }
      } catch (error) {
        console.error('Error fetching authors:', error)
      } finally {
        setIsLoadingAuthors(false)
      }
    }

    fetchCurrentUserAndAuthors()
  }, [])

  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title_es: post?.title_es || post?.title || '',
      title_en: post?.title_en || post?.title || '',
      content_es: post?.content_es || post?.content || '',
      content_en: post?.content_en || post?.content || '',
      excerpt_es: post?.excerpt_es || post?.excerpt || '',
      excerpt_en: post?.excerpt_en || post?.excerpt || '',
      slug: post?.slug || '',
      image_url: post?.image_url || '',
      category: post?.category || '',
      author_id: post?.author_id || '',
      published: post?.published || false,
    },
  })

  // Actualizar author_id cuando se obtiene el usuario actual
  useEffect(() => {
    if (currentUserId && !post?.author_id && !isEditing) {
      form.setValue('author_id', currentUserId)
    }
  }, [currentUserId, post, isEditing, form])

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

  // Intentar subir archivo pendiente cuando el slug esté disponible
  useEffect(() => {
    if (pendingFile && currentSlug && currentSlug.trim() && !isUploading) {
      handleFileUpload(pendingFile)
    }
  }, [currentSlug, pendingFile, isUploading])

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
      const filePath = getStoragePathFromUrl(imageUrl, 'blog-images')

      if (!filePath) {
        console.warn('No se pudo extraer el path de la imagen:', imageUrl)
        return
      }

      const { error } = await supabase.storage
        .from('blog-images')
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
      const blogSlug = form.getValues('slug')

      if (!blogSlug) {
        // Guardar el archivo pendiente para subirlo cuando haya slug
        setPendingFile(file)
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
      const filePath = `${blogSlug}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('blog-images')
        .getPublicUrl(filePath)

      form.setValue('image_url', data.publicUrl)
      setPreviewImage(data.publicUrl)
      setPendingFile(null) // Limpiar archivo pendiente
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

  async function onSubmit(values: BlogFormValues) {
    setIsSubmitting(true)
    try {
      const supabase = createClient()
      const data = {
        ...values,
        image_url: values.image_url || null,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('blog')
          .update(data)
          .eq('id', post.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('blog')
          .insert([data])

        if (error) throw error
      }

      router.push(`/${lang}/dashboard/admin/blog`)
      router.refresh()
    } catch (error) {
      console.error('Error saving blog post:', error)
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
              name="excerpt_es"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Resumen (opcional)</FormLabel>
                    <TranslateButton
                      text={field.value}
                      targetValue={form.watch('excerpt_en')}
                      onTranslate={(translated) => form.setValue('excerpt_en', translated)}
                    />
                  </div>
                  <FormControl>
                    <Textarea {...field} rows={2} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content_es"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Contenido</FormLabel>
                    <TranslateButton
                      text={field.value}
                      targetValue={form.watch('content_en')}
                      onTranslate={(translated) => form.setValue('content_en', translated)}
                    />
                  </div>
                  <FormControl>
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                    />
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
              name="excerpt_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                    />
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
                  {pendingFile && !isUploading && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                      <ImageIcon className="h-4 w-4" />
                      <span>
                        {lang === 'en'
                          ? `Image "${pendingFile.name}" will be uploaded once you enter a title`
                          : `La imagen "${pendingFile.name}" se subirá una vez que ingreses un título`}
                      </span>
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
              <input type="hidden" {...field} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{lang === 'en' ? 'Category' : 'Categoría'}</FormLabel>
              <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className="w-full justify-between !border-2 !border-border"
                    >
                      {field.value
                        ? categories.find((category) => category.value === field.value)?.[lang === 'es' ? 'label_es' : 'label_en']
                        : lang === 'en' ? 'Select category...' : 'Seleccionar categoría...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
                  <Command>
                    <CommandInput 
                      placeholder={lang === 'en' ? 'Search category...' : 'Buscar categoría...'} 
                      className="h-9" 
                    />
                    <CommandList>
                      <CommandEmpty>
                        {lang === 'en' ? 'No category found.' : 'No se encontró categoría.'}
                      </CommandEmpty>
                      <CommandGroup>
                        {categories.map((category) => (
                          <CommandItem
                            key={category.value}
                            value={lang === 'es' ? category.label_es : category.label_en}
                            onSelect={() => {
                              field.onChange(category.value === field.value ? '' : category.value)
                              setCategoryOpen(false)
                            }}
                          >
                            {lang === 'es' ? category.label_es : category.label_en}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                field.value === category.value ? "opacity-100" : "opacity-0"
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
          name="author_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{lang === 'en' ? 'Author' : 'Autor'}</FormLabel>
              <Popover open={authorOpen} onOpenChange={setAuthorOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={authorOpen}
                      className="w-full justify-between !border-2 !border-border"
                      disabled={isLoadingAuthors}
                    >
                      {field.value
                        ? authors.find((author) => author.value === field.value)?.label
                        : lang === 'en' ? 'Select author...' : 'Seleccionar autor...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popper-anchor-width)] p-0">
                  <Command>
                    <CommandInput 
                      placeholder={lang === 'en' ? 'Search author...' : 'Buscar autor...'} 
                      className="h-9" 
                    />
                    <CommandList>
                      <CommandEmpty>
                        {lang === 'en' ? 'No author found.' : 'No se encontró autor.'}
                      </CommandEmpty>
                      <CommandGroup>
                        {authors.map((author) => (
                          <CommandItem
                            key={author.value}
                            value={author.label}
                            onSelect={() => {
                              field.onChange(author.value === field.value ? '' : author.value)
                              setAuthorOpen(false)
                            }}
                          >
                            {author.label}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                field.value === author.value ? "opacity-100" : "opacity-0"
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
          name="published"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  {lang === 'en' ? 'Published' : 'Publicado'}
                </FormLabel>
                <div className="text-sm text-muted-foreground">
                  {lang === 'en' ? 'Make this post visible to visitors' : 'Hacer esta publicación visible para los visitantes'}
                </div>
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
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${lang}/dashboard/admin/blog`)}
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
