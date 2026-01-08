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
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import { TranslateButton } from '@/components/ui/translate-button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'

const companySchema = z.object({
  name: z.string().min(1, 'El nombre de la empresa es requerido'),
  logo_url: z.string().optional(),
})

const technologySchema = z.object({
  name_es: z.string().min(1, 'El nombre en español es requerido'),
  name_en: z.string().min(1, 'El nombre en inglés es requerido'),
  description_es: z.string().min(10, 'La descripción en español debe tener al menos 10 caracteres'),
  description_en: z.string().min(10, 'La descripción en inglés debe tener al menos 10 caracteres'),
  category: z.string().optional(),
  logo_url: z.string().optional(),
  website_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
  companies: z.array(companySchema),
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
  logo_url?: string
  website_url?: string
  technology_companies?: Array<{
    company_name: string
    logo_url?: string
  }>
}

interface TechnologyFormProps {
  dict: Dictionary
  lang: Locale
  technology?: Technology
}

export function TechnologyForm({ dict, lang, technology }: TechnologyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewLogo, setPreviewLogo] = useState<string | null>(technology?.logo_url || null)
  const [uploadingCompanyIndex, setUploadingCompanyIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const companyFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({})
  const isEditing = !!technology

  const form = useForm<TechnologyFormValues>({
    resolver: zodResolver(technologySchema),
    defaultValues: {
      name_es: technology?.name_es || technology?.name || '',
      name_en: technology?.name_en || technology?.name || '',
      description_es: technology?.description_es || '',
      description_en: technology?.description_en || '',
      category: technology?.category || '',
      logo_url: technology?.logo_url || '',
      website_url: technology?.website_url || '',
      companies: technology?.technology_companies?.map(tc => ({
        name: tc.company_name,
        logo_url: tc.logo_url || '',
      })) || [],
    },
  })

  // Función helper para extraer el path del storage desde la URL pública
  function getStoragePathFromUrl(url: string, bucketName: string): string | null {
    try {
      const urlParts = url.split(`/storage/v1/object/public/${bucketName}/`)
      return urlParts[1] || null
    } catch {
      return null
    }
  }

  // Función para eliminar logo del storage
  async function deleteLogoFromStorage(logoUrl: string) {
    try {
      const supabase = createClient()
      const filePath = getStoragePathFromUrl(logoUrl, 'technology-logos')

      if (!filePath) {
        console.warn('No se pudo extraer el path del logo:', logoUrl)
        return
      }

      const { error } = await supabase.storage
        .from('technology-logos')
        .remove([filePath])

      if (error) {
        console.error('Error al eliminar logo del storage:', error)
      }
    } catch (error) {
      console.error('Error al eliminar logo:', error)
    }
  }

  async function handleFileUpload(file: File) {
    setIsUploading(true)
    try {
      const supabase = createClient()

      // Si estamos editando, usar el ID real
      // Si estamos creando, usar un nombre temporal único
      const technologyId = technology?.id || `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`

      // Eliminar logo anterior si existe
      const currentLogoUrl = form.getValues('logo_url')
      if (currentLogoUrl && !currentLogoUrl.includes('/temp-')) {
        await deleteLogoFromStorage(currentLogoUrl)
      }

      // Estructura: /<technology_id>/logo.ext
      const fileExtension = file.name.split('.').pop()
      const fileName = `logo.${fileExtension}`
      const filePath = `${technologyId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('technology-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('technology-logos')
        .getPublicUrl(filePath)

      form.setValue('logo_url', data.publicUrl)
      setPreviewLogo(data.publicUrl)
      toast.success(lang === 'en' ? 'Logo uploaded successfully' : 'Logo subido exitosamente')
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error(lang === 'en' ? 'Error uploading logo' : 'Error al subir el logo', {
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

  async function handleRemoveLogo() {
    const currentLogoUrl = form.getValues('logo_url')

    // Eliminar del storage
    if (currentLogoUrl) {
      await deleteLogoFromStorage(currentLogoUrl)
    }

    // Limpiar el formulario
    form.setValue('logo_url', '')
    setPreviewLogo(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
        logo_url: values.logo_url || null,
        website_url: values.website_url || null,
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

      // Si se subió un logo con ID temporal, moverlo al ID real
      if (previewLogo && previewLogo.includes('/temp-')) {
        const tempPath = getStoragePathFromUrl(previewLogo, 'technology-logos')
        if (tempPath) {
          const tempFolder = tempPath.split('/')[0]
          const fileName = tempPath.split('/').pop()
          const newPath = `${technologyId}/${fileName}`
          
          // Descargar el archivo temporal
          const { data: downloadData, error: downloadError } = await supabase.storage
            .from('technology-logos')
            .download(tempPath)
          
          if (downloadError) {
            console.error('Error downloading temp logo:', downloadError)
          } else if (downloadData) {
            // Subir al nuevo path
            const { error: uploadError } = await supabase.storage
              .from('technology-logos')
              .upload(newPath, downloadData, { upsert: true })
            
            if (uploadError) {
              console.error('Error uploading logo to new path:', uploadError)
            } else {
              // Obtener la nueva URL
              const { data: newUrl } = supabase.storage
                .from('technology-logos')
                .getPublicUrl(newPath)
              
              // Actualizar en la base de datos
              await supabase
                .from('technologies')
                .update({ logo_url: newUrl.publicUrl })
                .eq('id', technologyId)
              
              // Eliminar archivo temporal
              await supabase.storage
                .from('technology-logos')
                .remove([tempPath])
              
              // Intentar eliminar la carpeta temporal si está vacía
              const { data: folderContents } = await supabase.storage
                .from('technology-logos')
                .list(tempFolder)
              
              if (folderContents && folderContents.length === 0) {
                // La carpeta está vacía, pero no podemos eliminarla directamente
                // Supabase no permite eliminar carpetas vacías, así que la dejamos
              }
            }
          }
        }
      }

      // Gestionar empresas (nombres de empresas famosas con logos)
      // Primero eliminar todas las relaciones existentes
      const { error: deleteError } = await supabase
        .from('technology_companies')
        .delete()
        .eq('technology_id', technologyId)

      if (deleteError) throw deleteError

      // Luego crear las nuevas relaciones con nombres de empresas y logos
      if (values.companies.length > 0) {
        const relations = values.companies
          .filter(company => company.name.trim() !== '')
          .map(company => ({
            technology_id: technologyId,
            company_name: company.name.trim(),
            logo_url: company.logo_url || null,
          }))

        if (relations.length > 0) {
          const { error: insertError } = await supabase
            .from('technology_companies')
            .insert(relations)

          if (insertError) throw insertError
        }
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
    { value: 'servidor', label_es: 'Servidor', label_en: 'Server' },
    { value: 'storage', label_es: 'Storage', label_en: 'Storage' },
    { value: 'authentication', label_es: 'Autenticación', label_en: 'Authentication' },
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
                    <FormLabel>{(dict as any).technologies?.name || (lang === 'en' ? 'Name' : 'Nombre')}</FormLabel>
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
                    <FormLabel>{(dict as any).technologies?.description || (lang === 'en' ? 'Description' : 'Descripción')}</FormLabel>
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
            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{(dict as any).technologies?.name || (lang === 'en' ? 'Name' : 'Nombre')}</FormLabel>
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
                  <FormLabel>{(dict as any).technologies?.description || (lang === 'en' ? 'Description' : 'Descripción')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={4} className="!border-2 !border-border" />
                  </FormControl>
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
                    <SelectTrigger className="w-full !border-2 !border-border">
                      <SelectValue />
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
            name="website_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{(dict as any).technologies?.websiteUrl || (lang === 'en' ? 'Website URL' : 'URL del Sitio Web')}</FormLabel>
                <FormControl>
                  <Input {...field} type="url" className="!border-2 !border-border" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Logo Upload */}
        <FormField
          control={form.control}
          name="logo_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{(dict as any).technologies?.logo || (lang === 'en' ? 'Logo' : 'Logo')}</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {previewLogo ? (
                    <div className="relative inline-block">
                      <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-border">
                        <Image
                          src={previewLogo}
                          alt="Logo preview"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="!border-2 !border-border"
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        {isUploading
                          ? (lang === 'en' ? 'Uploading...' : 'Subiendo...')
                          : (lang === 'en' ? 'Upload Logo' : 'Subir Logo')}
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardHeader>
            <CardTitle>{(dict as any).technologies?.companies || (lang === 'en' ? 'Companies' : 'Empresas')}</CardTitle>
            <CardDescription>
              {lang === 'en'
                ? 'Add famous companies that use this technology (e.g., Liverpool, Netflix)'
                : 'Agrega empresas famosas que utilizan esta tecnología (ej: Liverpool, Netflix)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="companies"
              render={({ field }) => (
                <FormItem>
                  <div className="space-y-4">
                    {field.value?.map((company, index) => {
                      async function handleCompanyLogoUpload(file: File, companyIndex: number) {
                        setUploadingCompanyIndex(companyIndex)
                        try {
                          const supabase = createClient()
                          const technologyId = technology?.id || `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`
                          const companyName = field.value[companyIndex].name || `company-${companyIndex}`
                          const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                          
                          // Eliminar logo anterior si existe
                          const currentLogoUrl = field.value[companyIndex].logo_url
                          if (currentLogoUrl && !currentLogoUrl.includes('/temp-')) {
                            const filePath = getStoragePathFromUrl(currentLogoUrl, 'technology-logos')
                            if (filePath) {
                              await supabase.storage.from('technology-logos').remove([filePath])
                            }
                          }
                          
                          // Subir nuevo logo
                          const fileExtension = file.name.split('.').pop()
                          const fileName = `company-${companyIndex}-${Date.now()}.${fileExtension}`
                          const filePath = `${technologyId}/companies/${fileName}`
                          
                          const { error: uploadError } = await supabase.storage
                            .from('technology-logos')
                            .upload(filePath, file, {
                              cacheControl: '3600',
                              upsert: true
                            })
                          
                          if (uploadError) throw uploadError
                          
                          const { data } = supabase.storage
                            .from('technology-logos')
                            .getPublicUrl(filePath)
                          
                          // Actualizar el logo en el formulario
                          const newCompanies = [...(field.value || [])]
                          newCompanies[companyIndex] = {
                            ...newCompanies[companyIndex],
                            logo_url: data.publicUrl,
                          }
                          field.onChange(newCompanies)
                          
                          toast.success(lang === 'en' ? 'Logo uploaded successfully' : 'Logo subido exitosamente')
                        } catch (error) {
                          console.error('Error uploading company logo:', error)
                          toast.error(lang === 'en' ? 'Error uploading logo' : 'Error al subir el logo', {
                            description: error instanceof Error ? error.message : undefined,
                          })
                        } finally {
                          setUploadingCompanyIndex(null)
                        }
                      }
                      
                      async function handleRemoveCompanyLogo(companyIndex: number) {
                        const currentLogoUrl = field.value[companyIndex].logo_url
                        if (currentLogoUrl) {
                          const filePath = getStoragePathFromUrl(currentLogoUrl, 'technology-logos')
                          if (filePath) {
                            const supabase = createClient()
                            await supabase.storage.from('technology-logos').remove([filePath])
                          }
                        }
                        
                        const newCompanies = [...(field.value || [])]
                        newCompanies[companyIndex] = {
                          ...newCompanies[companyIndex],
                          logo_url: '',
                        }
                        field.onChange(newCompanies)
                      }
                      
                      return (
                        <div key={index} className="space-y-2 p-4 border rounded-lg">
                          <div className="flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <Input
                                value={company.name}
                                onChange={(e) => {
                                  const newCompanies = [...(field.value || [])]
                                  newCompanies[index] = {
                                    ...newCompanies[index],
                                    name: e.target.value,
                                  }
                                  field.onChange(newCompanies)
                                }}
                                className="!border-2 !border-border"
                              />
                              {company.logo_url ? (
                                <div className="relative inline-block">
                                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border-2 border-border">
                                    <Image
                                      src={company.logo_url}
                                      alt={company.name || 'Company logo'}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                                    onClick={() => handleRemoveCompanyLogo(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => companyFileInputRefs.current[index]?.click()}
                                    disabled={uploadingCompanyIndex === index}
                                    className="!border-2 !border-border"
                                  >
                                    <ImageIcon className="mr-2 h-3 w-3" />
                                    {uploadingCompanyIndex === index
                                      ? (lang === 'en' ? 'Uploading...' : 'Subiendo...')
                                      : (lang === 'en' ? 'Upload Logo' : 'Subir Logo')}
                                  </Button>
                                  <input
                                    ref={(el) => {
                                      companyFileInputRefs.current[index] = el
                                    }}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
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
                                        handleCompanyLogoUpload(file, index)
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </div>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                // Eliminar logo del storage si existe
                                const companyToRemove = field.value[index]
                                if (companyToRemove.logo_url) {
                                  handleRemoveCompanyLogo(index)
                                }
                                // Eliminar la empresa del array
                                const newCompanies = field.value?.filter((_, i) => i !== index)
                                field.onChange(newCompanies)
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        field.onChange([...(field.value || []), { name: '', logo_url: '' }])
                      }}
                      className="w-full !border-2 !border-border"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {lang === 'en' ? 'Add Company' : 'Agregar Empresa'}
                    </Button>
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
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting
              ? (lang === 'en' ? 'Saving...' : 'Guardando...')
              : dict.dashboard.admin.crud.save}
          </Button>
        </div>
      </form>
    </Form>
  )
}
