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
import { PasswordInput } from '@/components/ui/password-input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'

const userSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  email: z.string().email('Debe ser un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormProps {
  dict: Dictionary
  lang: Locale
  initialData?: {
    id: string
    email: string
    user_metadata?: {
      first_name?: string
      last_name?: string
      company_name?: string
      full_name?: string
    }
  }
}

export function UserForm({ dict, lang, initialData }: UserFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!initialData

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: initialData?.user_metadata?.first_name || '',
      lastName: initialData?.user_metadata?.last_name || '',
      email: initialData?.email || '',
      password: '',
    },
  })

  async function onSubmit(values: UserFormValues) {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(
        isEditing 
          ? `/api/users/${initialData.id}`
          : '/api/users',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            password: values.password || undefined,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar usuario')
      }

      router.push(`/${lang}/dashboard/admin/users`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'First Name' : 'Primer Nombre'}</FormLabel>
                <FormControl>
                  <Input {...field} className="!border-2 !border-border" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Last Name' : 'Apellido'}</FormLabel>
                <FormControl>
                  <Input {...field} className="!border-2 !border-border" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  type="email" 
                  disabled={isEditing}
                  className="!border-2 !border-border" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {lang === 'en' ? 'Password' : 'Contraseña'}
                {isEditing && (
                  <span className="text-muted-foreground ml-2">
                    ({lang === 'en' ? 'Leave empty to keep current password' : 'Dejar vacío para mantener la contraseña actual'})
                  </span>
                )}
              </FormLabel>
              <FormControl>
                <PasswordInput 
                  {...field} 
                  className="!border-2 !border-border"
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

