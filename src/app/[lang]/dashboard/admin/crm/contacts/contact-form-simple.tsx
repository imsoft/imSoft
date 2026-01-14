'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { Contact } from '@/types/database'

const contactSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

interface ContactFormProps {
  contact?: Contact
  lang: string
  userId: string
}

export function ContactFormSimple({ contact, lang, userId }: ContactFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: contact?.first_name || '',
      last_name: contact?.last_name || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      company: contact?.company || '',
    },
  })

  const onSubmit = async (values: ContactFormValues) => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      if (contact) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('id', contact.id)

        if (error) throw error
      } else {
        // Create new contact
        const { error } = await supabase
          .from('contacts')
          .insert({
            ...values,
            contact_type: 'lead',
            status: 'active',
            created_by: userId,
          })

        if (error) throw error
      }

      router.push(`/${lang}/dashboard/admin/crm/contacts`)
      router.refresh()
    } catch (error) {
      console.error('Error saving contact:', error)
      alert(lang === 'en' ? 'Error saving contact' : 'Error al guardar contacto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Contact Information' : 'Información de Contacto'}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'First Name' : 'Nombre'} *</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Last Name' : 'Apellido'} *</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Email' : 'Correo'} *</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Phone' : 'Teléfono'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{lang === 'en' ? 'Company' : 'Empresa'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            {lang === 'en' ? 'Cancel' : 'Cancelar'}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? (lang === 'en' ? 'Saving...' : 'Guardando...')
              : (lang === 'en' ? 'Save Contact' : 'Guardar Contacto')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
