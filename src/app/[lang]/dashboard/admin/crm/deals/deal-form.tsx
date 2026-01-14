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
import { createClient } from '@/lib/supabase/client'
import { Deal, Contact, Service } from '@/types/database'

const dealSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  description: z.string().optional(),
  contact_id: z.string().min(1, 'Contact is required'),
  service_id: z.string().optional(),
  value: z.coerce.number().min(0, 'Value must be positive'),
  stage: z.enum(['no_contact', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
  probability: z.coerce.number().min(0).max(100).optional(),
  expected_close_date: z.string().optional(),
})

type DealFormValues = z.infer<typeof dealSchema>

interface DealFormProps {
  deal?: Deal
  contacts: Contact[]
  services: Service[]
  lang: string
  userId: string
}

export function DealForm({ deal, contacts, services, lang, userId }: DealFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: deal?.title || '',
      description: deal?.description || '',
      contact_id: deal?.contact_id || '',
      service_id: deal?.service_id || '',
      value: deal?.value || 0,
      stage: deal?.stage || 'no_contact',
      probability: deal?.probability || 0,
      expected_close_date: deal?.expected_close_date || '',
    },
  })

  const onSubmit = async (values: DealFormValues) => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // Prepare data
      const dealData = {
        ...values,
        service_id: values.service_id || null,
        probability: values.probability || 0,
        expected_close_date: values.expected_close_date || null,
      }

      if (deal) {
        // Update existing deal
        const { error } = await supabase
          .from('deals')
          .update(dealData)
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Deal Information' : 'Información del Negocio'}
          </h2>
          <div className="grid gap-4">
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Description' : 'Descripción'}</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-2">
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
                        {contacts.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                            {contact.company && ` - ${contact.company}`}
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
                name="service_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'Service' : 'Servicio'}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full !border-2 !border-border">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {lang === 'en' ? service.title_en : service.title_es}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </Card>

        {/* Deal Value & Stage */}
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Sales Information' : 'Información de Venta'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Deal Value' : 'Valor del Negocio'} *</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormDescription>
                    {lang === 'en' ? 'Amount in MXN' : 'Monto en MXN'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="probability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Win Probability (%)' : 'Probabilidad de Ganar (%)'}</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" {...field} className="!border-2 !border-border" />
                  </FormControl>
                  <FormDescription>
                    {lang === 'en' ? '0-100%' : '0-100%'}
                  </FormDescription>
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
                      <SelectItem value="no_contact">{lang === 'en' ? 'No Contact' : 'Sin Contacto'}</SelectItem>
                      <SelectItem value="qualification">{lang === 'en' ? 'Prospecting' : 'Prospección'}</SelectItem>
                      <SelectItem value="proposal">{lang === 'en' ? 'Proposal' : 'Propuesta'}</SelectItem>
                      <SelectItem value="negotiation">{lang === 'en' ? 'Negotiation' : 'Negociación'}</SelectItem>
                      <SelectItem value="closed_won">{lang === 'en' ? 'Closed Won' : 'Ganado'}</SelectItem>
                      <SelectItem value="closed_lost">{lang === 'en' ? 'Closed Lost' : 'Perdido'}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expected_close_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Expected Close Date' : 'Fecha de Cierre Esperada'}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} className="!border-2 !border-border" />
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
              : (lang === 'en' ? 'Save Deal' : 'Guardar Negocio')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
