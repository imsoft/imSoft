'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Contact, SocialLink } from '@/types/database'
import { Plus, Trash2 } from 'lucide-react'
import { SocialLinksEditor } from '@/components/crm/social-links-editor'

const emailSchema = z.string().email('Correo inválido')

const contactSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Correo inválido'),
  phone: z.string().optional(),
  company: z.string().optional(),
  instagram_url: z.string().optional(),
  company_description: z.string().optional(),
  status: z.enum(['no_contact', 'qualification', 'negotiation', 'closed_won', 'closed_lost']),
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

  // Additional emails state (beyond the primary email)
  const [additionalEmails, setAdditionalEmails] = useState<string[]>(
    contact?.additional_emails ?? []
  )
  const [additionalEmailErrors, setAdditionalEmailErrors] = useState<(string | null)[]>(
    contact?.additional_emails?.map(() => null) ?? []
  )

  // Social links state
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(
    contact?.social_links ?? []
  )

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      first_name: contact?.first_name || '',
      last_name: contact?.last_name || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      company: contact?.company || '',
      instagram_url: contact?.instagram_url || '',
      company_description: contact?.notes || '',
      status: (contact?.status as 'no_contact' | 'qualification' | 'negotiation' | 'closed_won' | 'closed_lost') || 'no_contact',
    },
  })

  const addEmail = () => {
    setAdditionalEmails((prev) => [...prev, ''])
    setAdditionalEmailErrors((prev) => [...prev, null])
  }

  const removeEmail = (index: number) => {
    setAdditionalEmails((prev) => prev.filter((_, i) => i !== index))
    setAdditionalEmailErrors((prev) => prev.filter((_, i) => i !== index))
  }

  const updateEmail = (index: number, value: string) => {
    setAdditionalEmails((prev) => prev.map((e, i) => (i === index ? value : e)))
    // Validate on change
    const result = emailSchema.safeParse(value)
    setAdditionalEmailErrors((prev) =>
      prev.map((err, i) =>
        i === index ? (result.success ? null : (lang === 'en' ? 'Invalid email' : 'Correo inválido')) : err
      )
    )
  }

  const validateAdditionalEmails = (): boolean => {
    const errors = additionalEmails.map((email) => {
      if (!email.trim()) return lang === 'en' ? 'Email is required' : 'El correo es requerido'
      const result = emailSchema.safeParse(email)
      return result.success ? null : (lang === 'en' ? 'Invalid email' : 'Correo inválido')
    })
    setAdditionalEmailErrors(errors)
    return errors.every((e) => e === null)
  }

  const onSubmit = async (values: ContactFormValues) => {
    if (!validateAdditionalEmails()) return

    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const instagramLink = socialLinks.find(l => l.platform === 'instagram')
      const instagramVal = instagramLink ? instagramLink.url : null

      const contactData = {
        first_name: values.first_name || null,
        last_name: values.last_name || null,
        email: values.email,
        additional_emails: additionalEmails.length > 0 ? additionalEmails : null,
        phone: values.phone || null,
        company: values.company || null,
        instagram_url: instagramVal,
        social_links: socialLinks.length > 0 ? socialLinks : null,
        notes: values.company_description || null,
        status: values.status,
        updated_at: new Date().toISOString(),
      }

      if (contact) {
        // Update existing contact
        const { error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', contact.id)

        if (error) throw error
      } else {
        // Create new contact
        const { error } = await supabase
          .from('contacts')
          .insert({
            ...contactData,
            contact_type: 'lead',
            status: 'no_contact',
            created_by: userId,
          })

        if (error) throw error
      }

      router.push(`/${lang}/dashboard/admin/crm/contacts`)
      router.refresh()
    } catch (error) {
      console.error('Error saving contact:', error)
      toast.error(lang === 'en' ? 'Error saving contact' : 'Error al guardar contacto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Contact Information' : 'Información de Contacto'}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'First Name' : 'Nombre'}</FormLabel>
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
                  <FormLabel>{lang === 'en' ? 'Last Name' : 'Apellido'}</FormLabel>
                  <FormControl>
                    <Input {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email section */}
          <div className="mt-4 space-y-3">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>
                      {lang === 'en' ? 'Email' : 'Correo'} *
                    </FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                      onClick={addEmail}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {lang === 'en' ? 'Add email' : 'Agregar correo'}
                    </Button>
                  </div>
                  <FormControl>
                    <Input type="email" {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional emails */}
            {additionalEmails.map((email, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    placeholder={lang === 'en' ? 'Additional email' : 'Correo adicional'}
                    className="!border-2 !border-border"
                  />
                  {additionalEmailErrors[index] && (
                    <p className="text-xs text-destructive">{additionalEmailErrors[index]}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-0.5 h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => removeEmail(index)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">{lang === 'en' ? 'Remove email' : 'Eliminar correo'}</span>
                </Button>
              </div>
            ))}
          </div>

          {/* Phone */}
          <div className="grid gap-4 md:grid-cols-2 mt-4">
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
          </div>

          {/* Social Links */}
          <div className="mt-6 border-t pt-6">
            <SocialLinksEditor
              value={socialLinks}
              onChange={setSocialLinks}
              lang={lang}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4">

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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Status' : 'Estado'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full !border-2 !border-border">
                        <SelectValue placeholder={lang === 'en' ? 'Select status' : 'Seleccionar estado'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no_contact">{lang === 'en' ? 'No Contact' : 'Sin Contacto'}</SelectItem>
                      <SelectItem value="qualification">{lang === 'en' ? 'Prospecting' : 'Prospección'}</SelectItem>
                      <SelectItem value="negotiation">{lang === 'en' ? 'Negotiation' : 'Negociación'}</SelectItem>
                      <SelectItem value="closed_won">{lang === 'en' ? 'Won' : 'Ganados'}</SelectItem>
                      <SelectItem value="closed_lost">{lang === 'en' ? 'Lost' : 'Perdidos'}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company_description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>{lang === 'en' ? 'Company Description' : 'Descripción de la Empresa'}</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="!border-2 !border-border min-h-[100px]" 
                    />
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
