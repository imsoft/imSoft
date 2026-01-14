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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { Contact, Quotation, Deal } from '@/types/database'
import { toast } from 'sonner'

const combinedSchema = z.object({
  // Contact fields
  contact_mode: z.enum(['existing', 'new']),
  contact_id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  company_description: z.string().optional(),
  // Deal fields
  title: z.string().min(2, 'Title is required'),
  quotation_id: z.string().optional(),
  value: z.coerce.number().min(0, 'Value must be positive'),
  stage: z.enum(['no_contact', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
}).refine((data) => {
  if (data.contact_mode === 'existing') {
    return !!data.contact_id && data.contact_id.length > 0
  } else {
    return !!(data.first_name && data.first_name.length >= 2) && 
           !!(data.last_name && data.last_name.length >= 2) && 
           !!(data.email && data.email.length > 0 && z.string().email().safeParse(data.email).success)
  }
}, {
  message: 'Please fill in all required contact fields',
  path: ['contact_mode'],
})

type CombinedFormValues = z.infer<typeof combinedSchema>

interface DealContactFormProps {
  deal?: Deal
  contacts: Contact[]
  quotations: Quotation[]
  lang: string
  userId: string
}

export function DealContactForm({ deal, contacts, quotations, lang, userId }: DealContactFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<string | undefined>(deal?.quotation_id || undefined)
  
  // Si hay un deal, buscar el contacto asociado
  // Primero intentar desde deal.contacts (si viene de la query), luego buscar en la lista
  const associatedContact = deal?.contacts 
    ? (typeof deal.contacts === 'object' && 'id' in deal.contacts ? deal.contacts : null)
    : (deal?.contact_id ? contacts.find(c => c.id === deal.contact_id) : null)
  
  const [contactMode, setContactMode] = useState<'existing' | 'new'>(
    deal && associatedContact ? 'existing' : 'new'
  )

  const form = useForm<CombinedFormValues>({
    resolver: zodResolver(combinedSchema),
    mode: 'onChange',
    defaultValues: {
      contact_mode: deal && associatedContact ? 'existing' : 'new',
      contact_id: deal?.contact_id || '',
      first_name: associatedContact?.first_name || '',
      last_name: associatedContact?.last_name || '',
      email: associatedContact?.email || '',
      phone: associatedContact?.phone || '',
      company: associatedContact?.company || '',
      company_description: associatedContact?.notes || '',
      title: deal?.title || '',
      quotation_id: deal?.quotation_id || undefined,
      value: deal?.value || 0,
      stage: deal?.stage || 'no_contact',
    },
  })

  // Cuando se selecciona una cotización, actualizar el valor automáticamente
  const handleQuotationChange = (quotationId: string) => {
    if (quotationId === 'none') {
      setSelectedQuotation(undefined)
      form.setValue('quotation_id', undefined)
      return
    }

    setSelectedQuotation(quotationId)
    form.setValue('quotation_id', quotationId)

    const quotation = quotations.find(q => q.id === quotationId)
    if (quotation) {
      form.setValue('value', quotation.final_price || quotation.total)
      
      // Si estamos en modo "nuevo contacto" y la cotización tiene datos del cliente, autocompletar
      if (contactMode === 'new' && quotation.client_email) {
        form.setValue('email', quotation.client_email)
        if (quotation.client_name) {
          const nameParts = quotation.client_name.split(' ')
          form.setValue('first_name', nameParts[0] || '')
          form.setValue('last_name', nameParts.slice(1).join(' ') || '')
        }
        if (quotation.client_company) {
          form.setValue('company', quotation.client_company)
        }
        if (quotation.client_phone) {
          form.setValue('phone', quotation.client_phone)
        }
      }
      
      // Si estamos en modo "contacto existente", intentar encontrar el contacto
      if (contactMode === 'existing' && quotation.client_email) {
        const contact = contacts.find(c => c.email === quotation.client_email)
        if (contact) {
          form.setValue('contact_id', contact.id)
        }
      }
    }
  }

  const onSubmit = async (values: CombinedFormValues) => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      let contactId = values.contact_id

      // Si estamos creando un contacto nuevo, crearlo primero
      if (values.contact_mode === 'new') {
        if (!values.first_name || !values.last_name || !values.email) {
          throw new Error(lang === 'en' ? 'Please fill in all required contact fields' : 'Por favor completa todos los campos requeridos del contacto')
        }

        // Si estamos editando y el contacto ya existe y estamos en modo "nuevo contacto",
        // actualizar el contacto existente en lugar de crear uno nuevo
        if (deal && deal.contact_id && associatedContact) {
          // Verificar si el email cambió o si es el mismo contacto
          if (values.email === associatedContact.email || deal.contact_id === associatedContact.id) {
            const { error: updateError } = await supabase
              .from('contacts')
              .update({
                first_name: values.first_name,
                last_name: values.last_name,
                email: values.email,
                phone: values.phone || null,
                company: values.company || null,
                notes: values.company_description || null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', deal.contact_id)

            if (updateError) throw updateError
            contactId = deal.contact_id
          } else {
            // Email cambió, crear nuevo contacto o buscar existente
            const { data: existingContact } = await supabase
              .from('contacts')
              .select('id')
              .eq('email', values.email)
              .single()
            
            if (existingContact) {
              contactId = existingContact.id
            } else {
              // Crear nuevo contacto con el nuevo email
              const { data: newContact, error: contactError } = await supabase
                .from('contacts')
                .insert({
                  first_name: values.first_name,
                  last_name: values.last_name,
                  email: values.email,
                  phone: values.phone || null,
                  company: values.company || null,
                  notes: values.company_description || null,
                  contact_type: 'lead',
                  status: 'active',
                  created_by: userId,
                })
                .select()
                .single()

              if (contactError) throw contactError
              contactId = newContact.id
            }
          }
        } else {
          // Crear nuevo contacto
          const { data: newContact, error: contactError } = await supabase
            .from('contacts')
            .insert({
              first_name: values.first_name,
              last_name: values.last_name,
              email: values.email,
              phone: values.phone || null,
              company: values.company || null,
              contact_type: 'lead',
              status: 'active',
              created_by: userId,
            })
            .select()
            .single()

          if (contactError) {
            // Si el error es por email duplicado, intentar buscar el contacto existente
            if (contactError.code === '23505' && values.email) {
              const { data: existingContact } = await supabase
                .from('contacts')
                .select('id')
                .eq('email', values.email)
                .single()
              
              if (existingContact) {
                contactId = existingContact.id
              } else {
                throw contactError
              }
            } else {
              throw contactError
            }
          } else {
            contactId = newContact.id
          }
        }
      }

      if (!contactId) {
        throw new Error(lang === 'en' ? 'Contact ID is required' : 'Se requiere un ID de contacto')
      }

      // Preparar datos del deal
      const dealData = {
        title: values.title,
        contact_id: contactId,
        quotation_id: values.quotation_id || null,
        value: values.value,
        stage: values.stage,
        currency: 'MXN',
        updated_at: new Date().toISOString(),
      }

      if (deal) {
        // Actualizar deal existente
        const { error: dealError } = await supabase
          .from('deals')
          .update(dealData)
          .eq('id', deal.id)

        if (dealError) throw dealError
      } else {
        // Crear nuevo deal
        const { error: dealError } = await supabase
          .from('deals')
          .insert({
            ...dealData,
            created_by: userId,
          })

        if (dealError) throw dealError
      }

      router.push(`/${lang}/dashboard/admin/crm/deals`)
      router.refresh()
    } catch (error: any) {
      console.error('Error saving deal and contact:', error)
      const errorMessage = error?.message || (lang === 'en' ? 'Error saving deal' : 'Error al guardar negocio')
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStageLabel = (stage: string) => {
    const labels: Record<string, { en: string; es: string }> = {
      no_contact: { en: 'No Contact', es: 'Sin Contacto' },
      qualification: { en: 'Prospecting', es: 'Prospección' },
      proposal: { en: 'Proposal', es: 'Propuesta' },
      negotiation: { en: 'Negotiation', es: 'Negociación' },
      closed_won: { en: 'Won', es: 'Ganado' },
      closed_lost: { en: 'Lost', es: 'Perdido' },
    }
    return lang === 'en' ? labels[stage]?.en || stage : labels[stage]?.es || stage
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Contact Section */}
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Contact Information' : 'Información de Contacto'}
          </h2>

          <FormField
            control={form.control}
            name="contact_mode"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value)
                      setContactMode(value as 'existing' | 'new')
                      // Limpiar campos cuando se cambia el modo
                      if (value === 'new') {
                        form.setValue('contact_id', '')
                        // Limpiar también company_description
                        form.setValue('company_description', '')
                      } else {
                        form.setValue('first_name', '')
                        form.setValue('last_name', '')
                        form.setValue('email', '')
                        form.setValue('phone', '')
                        form.setValue('company', '')
                        form.setValue('company_description', '')
                      }
                    }}
                    value={field.value}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="new" id="new-contact" />
                      <Label htmlFor="new-contact" className="cursor-pointer">
                        {lang === 'en' ? 'New Contact' : 'Nuevo Contacto'}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="existing" id="existing-contact" />
                      <Label htmlFor="existing-contact" className="cursor-pointer">
                        {lang === 'en' ? 'Existing Contact' : 'Contacto Existente'}
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {contactMode === 'new' ? (
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
                        placeholder={lang === 'en' ? 'Brief description of the company...' : 'Breve descripción de la empresa...'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : (
            <FormField
              control={form.control}
              name="contact_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Select Contact' : 'Seleccionar Contacto'} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full !border-2 !border-border">
                        <SelectValue placeholder={lang === 'en' ? 'Select a contact...' : 'Selecciona un contacto...'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contacts.length > 0 ? (
                        contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                            {contact.company && ` - ${contact.company}`}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">
                          {lang === 'en' ? 'No contacts available' : 'No hay contactos disponibles'}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </Card>

        {/* Deal Section */}
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Deal Information' : 'Información del Negocio'}
          </h2>

          <div className="grid gap-4">
            {/* Selector de Cotización - Primero para facilitar autocompletado */}
            <FormField
              control={form.control}
              name="quotation_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Link Quotation (Optional)' : 'Vincular Cotización (Opcional)'}</FormLabel>
                  <Select
                    onValueChange={handleQuotationChange}
                    defaultValue={field.value}
                    value={selectedQuotation}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full !border-2 !border-border">
                        <SelectValue placeholder={lang === 'en' ? 'Select a quotation...' : 'Selecciona una cotización...'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">
                        {lang === 'en' ? 'None' : 'Ninguna'}
                      </SelectItem>
                      {quotations.length > 0 ? (
                        quotations.map((quotation: any) => {
                          // Construir un label descriptivo para la cotización
                          const serviceName = quotation.services
                            ? (lang === 'en' ? quotation.services.title_en : quotation.services.title_es) || quotation.services.title
                            : null
                          
                          const quotationLabel = quotation.title 
                            || (quotation.client_name && quotation.client_company 
                              ? `${quotation.client_name} - ${quotation.client_company}`
                              : quotation.client_name)
                            || serviceName
                            || (lang === 'en' ? 'Unnamed Quotation' : 'Cotización sin nombre')
                          
                          const price = new Intl.NumberFormat('es-MX', {
                            style: 'currency',
                            currency: 'MXN',
                          }).format(quotation.final_price || quotation.total)
                          
                          return (
                            <SelectItem key={quotation.id} value={quotation.id}>
                              {quotationLabel} - {price}
                            </SelectItem>
                          )
                        })
                      ) : (
                        <SelectItem value="no-quotations" disabled>
                          {lang === 'en' ? 'No quotations available' : 'No hay cotizaciones disponibles'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Deal Name' : 'Nombre del Negocio'} *</FormLabel>
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
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'Value (MXN)' : 'Valor (MXN)'} *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} className="!border-2 !border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'Stage' : 'Etapa'} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full !border-2 !border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no_contact">{getStageLabel('no_contact')}</SelectItem>
                        <SelectItem value="qualification">{getStageLabel('qualification')}</SelectItem>
                        <SelectItem value="proposal">{getStageLabel('proposal')}</SelectItem>
                        <SelectItem value="negotiation">{getStageLabel('negotiation')}</SelectItem>
                        <SelectItem value="closed_won">{getStageLabel('closed_won')}</SelectItem>
                        <SelectItem value="closed_lost">{getStageLabel('closed_lost')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              : (lang === 'en' ? 'Save Deal' : 'Guardar Negocio')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
