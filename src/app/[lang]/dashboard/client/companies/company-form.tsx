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
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Company } from '@/types/database'
import { X, Image as ImageIcon, Upload } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'

// Función para generar slug desde un texto
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final
}

const companySchema = z.object({
  name: z.string().min(1, 'El nombre de la empresa es requerido'),
  logo_url: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companySchema>

interface CompanyFormProps {
  dict: Dictionary
  lang: Locale
  company?: Company
}

export function CompanyForm({ dict, lang, company }: CompanyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(company?.logo_url || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!company

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      logo_url: company?.logo_url || '',
    },
  })

  // Actualizar previewImage cuando cambie la empresa
  useEffect(() => {
    if (company?.logo_url) {
      setPreviewImage(company.logo_url)
    } else {
      setPreviewImage(null)
    }
  }, [company?.logo_url])

  async function handleFileUpload(file: File) {
    setIsUploading(true)
    try {
      const supabase = createClient()

      // Obtener el nombre actual del formulario
      const companyName = form.getValues('name')

      if (!companyName) {
        toast.error(lang === 'en' ? 'Please enter a company name first' : 'Por favor ingresa el nombre de la empresa primero')
        setIsUploading(false)
        return
      }

      // Generar slug desde el nombre de la empresa
      const companySlug = generateSlug(companyName)

      // Nueva estructura: /<slug>/nombre-original.ext
      const filePath = `${companySlug}/${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Permitir sobrescribir el logo existente
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath)

      form.setValue('logo_url', data.publicUrl)
      setPreviewImage(data.publicUrl)
      toast.success(lang === 'en' ? 'Logo uploaded successfully' : 'Logo subido exitosamente')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(lang === 'en' ? 'Error uploading logo' : 'Error al subir el logo', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    e.stopPropagation()
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
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
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
    form.setValue('logo_url', '')
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function onSubmit(values: CompanyFormValues) {
    setIsSubmitting(true)
    try {
      const data = {
        name: values.name.trim(),
        logo_url: values.logo_url || null,
      }

      if (isEditing) {
        const response = await fetch(`/api/companies/${company.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al actualizar la empresa')
        }
      } else {
        const response = await fetch('/api/companies', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Error al crear la empresa')
        }
      }

      if (isEditing) {
        toast.success(lang === 'en' ? 'Company updated successfully' : 'Empresa actualizada exitosamente')
      } else {
        toast.success(lang === 'en' ? 'Company created successfully' : 'Empresa creada exitosamente')
      }

      router.push(`/${lang}/dashboard/client/companies`)
      router.refresh()
    } catch (error) {
      console.error('Error saving company:', error)
      toast.error(
        lang === 'en' ? 'Error saving company' : 'Error al guardar la empresa',
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
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.companies.title}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="!border-2 !border-border"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{dict.companies.logo}</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      onClick={(e) => e.stopPropagation()}
                      className="hidden"
                      disabled={isUploading}
                    />
                    {previewImage ? (
                      <div className="flex flex-col items-start gap-4">
                        <div className="relative inline-block">
                          <div className="relative h-40 w-40 overflow-hidden rounded-lg border-2 border-border bg-muted/50 p-2">
                            <Image
                              src={previewImage}
                              alt={form.watch('name') || 'Logo'}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -right-2 -top-2 h-7 w-7 rounded-full shadow-md"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            fileInputRef.current?.click()
                          }}
                          disabled={isUploading}
                          className="!border-2 !border-border"
                        >
                          {isUploading ? (
                            <>
                              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              {lang === 'en' ? 'Uploading...' : 'Subiendo...'}
                            </>
                          ) : (
                            <>
                              <ImageIcon className="mr-2 h-4 w-4" />
                              {lang === 'en' ? 'Change Logo' : 'Cambiar Logo'}
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Card
                        className={`relative overflow-hidden transition-all duration-200 ${
                          isDragging
                            ? 'border-primary bg-primary/5 scale-[1.01]'
                            : 'border-2 border-dashed'
                        } ${
                          isUploading
                            ? 'opacity-60 cursor-not-allowed'
                            : 'cursor-pointer hover:border-primary/50 hover:bg-accent/50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={(e) => {
                          e.preventDefault()
                          if (!isUploading) {
                            fileInputRef.current?.click()
                          }
                        }}
                      >
                        <div className="p-8">
                          <div className="flex flex-col items-center justify-center text-center space-y-4">
                            {isUploading ? (
                              <>
                                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    {lang === 'en' ? 'Uploading...' : 'Subiendo...'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {lang === 'en' ? 'Please wait' : 'Por favor espera'}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                  <Upload className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    {lang === 'en' ? 'Click to upload logo' : 'Haz clic para subir logo'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {lang === 'en' ? 'or drag and drop' : 'o arrastra y suelta'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {lang === 'en' ? 'PNG, JPG, GIF up to 5MB' : 'PNG, JPG, GIF hasta 5MB'}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
              lang === 'en' ? 'Saving...' : 'Guardando...'
            ) : isEditing ? (
              dict.companies.edit
            ) : (
              dict.companies.create
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

