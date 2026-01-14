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
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'
import type { Company } from '@/types/database'
import { X, Upload, Building2, Check, ChevronsUpDown } from 'lucide-react'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
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
  logo_url: z.string().optional().nullable(),
  user_id: z.string().optional().nullable(),
})

type CompanyFormValues = z.infer<typeof companySchema>

interface AdminCompanyFormProps {
  dict: Dictionary
  lang: Locale
  initialData?: Company
}

interface User {
  id: string
  email: string
  full_name: string
  role: string
}

export function AdminCompanyForm({ dict, lang, initialData }: AdminCompanyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.logo_url || null)
  const [isDragging, setIsDragging] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)
  const [openCombobox, setOpenCombobox] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEditing = !!initialData

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      logo_url: initialData?.logo_url || null,
      user_id: initialData?.user_id || null,
    },
  })

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      } finally {
        setIsLoadingUsers(false)
      }
    }
    fetchUsers()
  }, [])

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
      toast.error(lang === 'en' ? dict.companies.uploadError : dict.companies.uploadError, {
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
        toast.error(lang === 'en' ? dict.companies.sizeError : dict.companies.sizeError)
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error(lang === 'en' ? dict.companies.typeError : dict.companies.typeError)
        return
      }
      handleFileUpload(file)
    }
  }

  function handleRemoveImage() {
    form.setValue('logo_url', null)
    setPreviewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(lang === 'en' ? dict.companies.sizeError : dict.companies.sizeError)
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error(lang === 'en' ? dict.companies.typeError : dict.companies.typeError)
        return
      }
      handleFileUpload(file)
    }
  }

  async function onSubmit(values: CompanyFormValues) {
    setIsSubmitting(true)
    try {
      const data = {
        name: values.name.trim(),
        logo_url: values.logo_url || null,
        user_id: values.user_id === '__none__' ? null : (values.user_id || null),
      }

      if (isEditing) {
        const response = await fetch(`/api/companies/${initialData.id}`, {
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

      toast.success(
        isEditing
          ? (lang === 'en' ? 'Company updated successfully' : 'Empresa actualizada exitosamente')
          : (lang === 'en' ? 'Company created successfully' : 'Empresa creada exitosamente')
      )

      router.push(`/${lang}/dashboard/admin/companies`)
      setTimeout(() => {
        router.refresh()
      }, 100)
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
                <FormLabel>{dict.companies.name}</FormLabel>
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
            name="user_id"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>
                  {lang === 'en' ? 'Assign User (Optional)' : 'Asignar Usuario (Opcional)'}
                </FormLabel>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCombobox}
                        className={cn(
                          "w-full justify-between !border-2 !border-border",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isLoadingUsers}
                      >
                        {isLoadingUsers
                          ? (lang === 'en' ? 'Loading users...' : 'Cargando usuarios...')
                          : field.value && field.value !== '__none__'
                          ? users.find((user) => user.id === field.value)?.full_name ||
                            users.find((user) => user.id === field.value)?.email
                          : (lang === 'en' ? 'No user (unassigned)' : 'Sin usuario (sin asignar)')}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={lang === 'en' ? 'Search user...' : 'Buscar usuario...'}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>
                          {lang === 'en' ? 'No user found.' : 'No se encontró ningún usuario.'}
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="__none__"
                            onSelect={() => {
                              field.onChange('__none__')
                              setOpenCombobox(false)
                            }}
                          >
                            {lang === 'en' ? 'No user (unassigned)' : 'Sin usuario (sin asignar)'}
                            <Check
                              className={cn(
                                "ml-auto h-4 w-4",
                                (!field.value || field.value === '__none__') ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                          {users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={`${user.full_name} ${user.email}`}
                              onSelect={() => {
                                field.onChange(user.id)
                                setOpenCombobox(false)
                              }}
                            >
                              {user.full_name} ({user.email})
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  field.value === user.id ? "opacity-100" : "opacity-0"
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
            name="logo_url"
            render={() => (
              <FormItem>
                <FormLabel>{dict.companies.logo}</FormLabel>
                <FormControl>
                  <div className="space-y-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isUploading}
                    />

                    {/* Área de drag & drop mejorada */}
                    <Card
                      className={cn(
                        "relative overflow-hidden transition-all duration-200",
                        isDragging && "border-primary bg-primary/5 scale-[1.02]",
                        isUploading && "opacity-60 cursor-not-allowed",
                        !isUploading && "cursor-pointer hover:border-primary/50 hover:bg-accent/50"
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => !isUploading && fileInputRef.current?.click()}
                    >
                      <div className="p-8">
                        <div className="flex flex-col items-center gap-6">
                          {/* Vista previa del logo */}
                          <div className="relative">
                            {previewImage ? (
                              <div className="relative group">
                                <div className="size-32 rounded-xl overflow-hidden border-2 border-border bg-background shadow-lg">
                                  <Image
                                    src={previewImage}
                                    alt={form.watch('name') || "Company Logo"}
                                    width={128}
                                    height={128}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                {!isUploading && (
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 size-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleRemoveImage()
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                    <span className="sr-only">{dict.companies.removeLogo}</span>
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <div className="size-32 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-white flex items-center justify-center">
                                <Building2 className="size-12 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>

                          {/* Contenido del área de carga */}
                          <div className="text-center space-y-2">
                            {isUploading ? (
                              <>
                                <p className="text-sm font-medium">
                                  {lang === 'en' ? 'Uploading logo...' : 'Subiendo logo...'}
                                </p>
                              </>
                            ) : previewImage ? (
                              <>
                                <Upload className="h-6 w-6 mx-auto text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {lang === 'en' ? 'Click or drag to replace logo' : 'Haz clic o arrastra para reemplazar el logo'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    PNG, JPG, GIF {lang === 'en' ? 'up to' : 'hasta'} 5MB
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {lang === 'en' ? 'Click to upload or drag and drop' : 'Haz clic para subir o arrastra y suelta'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    PNG, JPG, GIF {lang === 'en' ? 'up to' : 'hasta'} 5MB
                                  </p>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Botón de acción opcional */}
                          {!isUploading && (
                            <Button
                              type="button"
                              variant={previewImage ? "outline" : "default"}
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                fileInputRef.current?.click()
                              }}
                            >
                              {previewImage
                                ? (lang === 'en' ? 'Change logo' : 'Cambiar logo')
                                : (lang === 'en' ? 'Select file' : 'Seleccionar archivo')
                              }
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/${lang}/dashboard/admin/companies`)}
            disabled={isSubmitting || isUploading}
          >
            {dict.dashboard.admin.crud.cancel}
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting
              ? (lang === 'en' ? 'Saving...' : 'Guardando...')
              : isEditing
              ? dict.dashboard.admin.crud.save
              : dict.companies.create}
          </Button>
        </div>
      </form>
    </Form>
  )
}

