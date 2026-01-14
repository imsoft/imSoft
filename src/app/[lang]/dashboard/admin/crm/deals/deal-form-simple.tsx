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
import { Deal, Contact } from '@/types/database'

const dealSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  contact_id: z.string().min(1, 'Contact is required'),
  value: z.coerce.number().min(0, 'Value must be positive'),
  stage: z.enum(['qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
})

type DealFormValues = z.infer<typeof dealSchema>

interface DealFormProps {
  deal?: Deal
  contacts: Contact[]
  lang: string
  userId: string
}

export function DealFormSimple({ deal, contacts, lang, userId }: DealFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: deal?.title || '',
      contact_id: deal?.contact_id || '',
      value: deal?.value || 0,
      stage: deal?.stage || 'qualification',
    },
  })

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

      router.push(`/${lang}/dashboard/admin/crm/deals`)
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
      qualification: { en: 'Qualification', es: 'Calificación' },
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
