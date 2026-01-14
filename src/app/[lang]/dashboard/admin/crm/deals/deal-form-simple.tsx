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
import { Deal, Contact, Quotation } from '@/types/database'

const dealSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  contact_id: z.string().min(1, 'Contact is required'),
  quotation_id: z.string().optional(),
  value: z.coerce.number().min(0, 'Value must be positive'),
  stage: z.enum(['no_contact', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
})

type DealFormValues = z.infer<typeof dealSchema>

interface DealFormProps {
  deal?: Deal
  contacts: Contact[]
  quotations: Quotation[]
  lang: string
  userId: string
}

export function DealFormSimple({ deal, contacts, quotations, lang, userId }: DealFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedQuotation, setSelectedQuotation] = useState<string | undefined>(undefined)

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: deal?.title || '',
      contact_id: deal?.contact_id || '',
      quotation_id: undefined,
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
      // Si la cotización tiene cliente, intentar seleccionar el contacto correspondiente
      if (quotation.client_email) {
        const contact = contacts.find(c => c.email === quotation.client_email)
        if (contact) {
          form.setValue('contact_id', contact.id)
        }
      }
    }
  }

  const onSubmit = async (values: DealFormValues) => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      const dealData = {
        ...values,
        currency: 'MXN',
      }

      if (deal) {
        // Update existing deal
        const { error } = await supabase
          .from('deals')
          .update({
            ...dealData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', deal.id)

        if (error) throw error
      } else {
        // Create new deal
        const { error } = await supabase
          .from('deals')
          .insert({
            ...dealData,
            created_by: userId,
          })

        if (error) throw error
      }

      router.push(`/${lang}/dashboard/admin/crm`)
      router.refresh()
    } catch (error) {
      console.error('Error saving deal:', error)
      alert(lang === 'en' ? 'Error saving deal' : 'Error al guardar negocio')
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

            <FormField
              control={form.control}
              name="contact_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Contact' : 'Contacto'} *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                        <SelectItem value="no-contacts" disabled>
                          {lang === 'en' ? 'No contacts available' : 'No hay contactos disponibles'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
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
