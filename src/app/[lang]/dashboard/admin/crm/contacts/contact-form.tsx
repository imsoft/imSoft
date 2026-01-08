'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Contact } from '@/types/database'

const contactSchema = z.object({
  first_name: z.string().min(2, 'First name is required'),
  last_name: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  contact_type: z.enum(['lead', 'prospect', 'customer', 'partner']),
  status: z.enum(['active', 'inactive', 'lost']),
  source: z.string().optional(),
  address_street: z.string().optional(),
  address_city: z.string().optional(),
  address_state: z.string().optional(),
  address_country: z.string().optional(),
  address_postal_code: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

interface ContactFormProps {
  contact?: Contact
  lang: string
  userId: string
}

export function ContactForm({ contact, lang, userId }: ContactFormProps) {
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
      job_title: contact?.job_title || '',
      contact_type: contact?.contact_type || 'lead',
      status: contact?.status || 'active',
      source: contact?.source || '',
      address_street: contact?.address_street || '',
      address_city: contact?.address_city || '',
      address_state: contact?.address_state || '',
      address_country: contact?.address_country || '',
      address_postal_code: contact?.address_postal_code || '',
      linkedin_url: contact?.linkedin_url || '',
      website_url: contact?.website_url || '',
      notes: contact?.notes || '',
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
          .update(values)
          .eq('id', contact.id)

        if (error) throw error
      } else {
        // Create new contact
        const { error } = await supabase
          .from('contacts')
          .insert({
            ...values,
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
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Company' : 'Empresa'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="job_title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Job Title' : 'Puesto'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="contact_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Contact Type' : 'Tipo de Contacto'} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full !border-2 !border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">{lang === 'en' ? 'Prospect' : 'Prospecto'}</SelectItem>
                      <SelectItem value="customer">{lang === 'en' ? 'Customer' : 'Cliente'}</SelectItem>
                      <SelectItem value="partner">{lang === 'en' ? 'Partner' : 'Socio'}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Status' : 'Estado'} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full !border-2 !border-border">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{lang === 'en' ? 'Active' : 'Activo'}</SelectItem>
                      <SelectItem value="inactive">{lang === 'en' ? 'Inactive' : 'Inactivo'}</SelectItem>
                      <SelectItem value="lost">{lang === 'en' ? 'Lost' : 'Perdido'}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Source' : 'Fuente'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

        <div className="grid gap-4">
            <FormField
              control={form.control}
              name="address_street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Street Address' : 'Calle'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="address_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'City' : 'Ciudad'}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'State' : 'Estado'}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'Country' : 'País'}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'Postal Code' : 'Código Postal'}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

        <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="linkedin_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Website' : 'Sitio Web'}</FormLabel>
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
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Notes' : 'Notas'}</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} className="!border-2 !border-border" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
