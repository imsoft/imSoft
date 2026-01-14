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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { Contact, Quotation, Deal } from '@/types/database'
import { toast } from 'sonner'

const combinedSchema = z.object({
  // Contact fields
  contact_id: z.string().min(1, 'Contact is required'),
  // Deal fields
  title: z.string().min(2, 'Title is required'),
  quotation_id: z.string().optional(),
  value: z.coerce.number().min(0, 'Value must be positive'),
  stage: z.enum(['no_contact', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
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
  
  const form = useForm<CombinedFormValues>({
    resolver: zodResolver(combinedSchema),
    mode: 'onChange',
    defaultValues: {
      contact_id: deal?.contact_id || '',
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
      
      // Si la cotización tiene email del cliente, intentar encontrar el contacto
      if (quotation.client_email) {
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
      if (!values.contact_id) {
        throw new Error(lang === 'en' ? 'Contact is required' : 'Se requiere un contacto')
      }

      // Preparar datos del deal
      const dealData = {
        title: values.title,
        contact_id: values.contact_id,
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

      router.push(`/${lang}/dashboard/admin/crm`)
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
            name="contact_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === 'en' ? 'Select Contact' : 'Seleccionar Contacto'} *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full !border-2 !border-border">
                      <SelectValue />
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
                        <SelectValue />
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
