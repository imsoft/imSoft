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
import { Activity, Contact, Deal } from '@/types/database'

const activitySchema = z.object({
  activity_type: z.enum(['call', 'email', 'meeting', 'note', 'task']),
  subject: z.string().min(2, 'Subject is required'),
  description: z.string().optional(),
  contact_id: z.string().optional(),
  deal_id: z.string().optional(),
  status: z.enum(['completed', 'scheduled', 'cancelled']),
  scheduled_at: z.string().optional(),
  completed_at: z.string().optional(),
  duration_minutes: z.coerce.number().optional(),
  outcome: z.enum(['successful', 'unsuccessful', 'no_answer', 'rescheduled']).optional(),
  next_action: z.string().optional(),
})

type ActivityFormValues = z.infer<typeof activitySchema>

interface ActivityFormProps {
  activity?: Activity
  contacts: Contact[]
  deals: Deal[]
  lang: string
  userId: string
}

export function ActivityForm({ activity, contacts, deals, lang, userId }: ActivityFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      activity_type: activity?.activity_type || 'call',
      subject: activity?.subject || '',
      description: activity?.description || '',
      contact_id: activity?.contact_id || '',
      deal_id: activity?.deal_id || '',
      status: activity?.status || 'completed',
      scheduled_at: activity?.scheduled_at ? new Date(activity.scheduled_at).toISOString().slice(0, 16) : '',
      completed_at: activity?.completed_at ? new Date(activity.completed_at).toISOString().slice(0, 16) : '',
      duration_minutes: activity?.duration_minutes || undefined,
      outcome: activity?.outcome || undefined,
      next_action: activity?.next_action || '',
    },
  })

  const onSubmit = async (values: ActivityFormValues) => {
    setIsSubmitting(true)
    const supabase = createClient()

    try {
      // Prepare data
      const activityData = {
        ...values,
        contact_id: values.contact_id || null,
        deal_id: values.deal_id || null,
        scheduled_at: values.scheduled_at || null,
        completed_at: values.completed_at || null,
        duration_minutes: values.duration_minutes || null,
        outcome: values.outcome || null,
      }

      if (activity) {
        // Update existing activity
        const { error } = await supabase
          .from('activities')
          .update(activityData)
          .eq('id', activity.id)

        if (error) throw error
      } else {
        // Create new activity
        const { error } = await supabase
          .from('activities')
          .insert({
            ...activityData,
            created_by: userId,
          })

        if (error) throw error
      }

      router.push(`/${lang}/dashboard/admin/crm/activities`)
      router.refresh()
    } catch (error) {
      console.error('Error saving activity:', error)
      alert(lang === 'en' ? 'Error saving activity' : 'Error al guardar actividad')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Activity Information' : 'Información de la Actividad'}
          </h2>
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="activity_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{lang === 'en' ? 'Activity Type' : 'Tipo de Actividad'} *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="call">{lang === 'en' ? 'Call' : 'Llamada'}</SelectItem>
                        <SelectItem value="email">{lang === 'en' ? 'Email' : 'Correo'}</SelectItem>
                        <SelectItem value="meeting">{lang === 'en' ? 'Meeting' : 'Reunión'}</SelectItem>
                        <SelectItem value="note">{lang === 'en' ? 'Note' : 'Nota'}</SelectItem>
                        <SelectItem value="task">{lang === 'en' ? 'Task' : 'Tarea'}</SelectItem>
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
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="completed">{lang === 'en' ? 'Completed' : 'Completado'}</SelectItem>
                        <SelectItem value="scheduled">{lang === 'en' ? 'Scheduled' : 'Programado'}</SelectItem>
                        <SelectItem value="cancelled">{lang === 'en' ? 'Cancelled' : 'Cancelado'}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Subject' : 'Asunto'} *</FormLabel>
                  <FormControl>
                    <Input placeholder={lang === 'en' ? 'e.g., Follow-up call about proposal' : 'ej., Llamada de seguimiento sobre propuesta'} {...field} />
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
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Related Records */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Related To' : 'Relacionado Con'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="contact_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Contact' : 'Contacto'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={lang === 'en' ? 'Select a contact' : 'Selecciona un contacto'} />
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
              name="deal_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Deal' : 'Negocio'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={lang === 'en' ? 'Select a deal' : 'Selecciona un negocio'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {deals.map((deal) => (
                        <SelectItem key={deal.id} value={deal.id}>
                          {deal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        {/* Time & Outcome */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {lang === 'en' ? 'Time & Outcome' : 'Tiempo y Resultado'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Scheduled Date/Time' : 'Fecha/Hora Programada'}</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    {lang === 'en' ? 'For scheduled activities' : 'Para actividades programadas'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="completed_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Completed Date/Time' : 'Fecha/Hora Completada'}</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormDescription>
                    {lang === 'en' ? 'For completed activities' : 'Para actividades completadas'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Duration (minutes)' : 'Duración (minutos)'}</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="outcome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Outcome' : 'Resultado'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={lang === 'en' ? 'Select outcome' : 'Selecciona resultado'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="successful">{lang === 'en' ? 'Successful' : 'Exitoso'}</SelectItem>
                      <SelectItem value="unsuccessful">{lang === 'en' ? 'Unsuccessful' : 'No exitoso'}</SelectItem>
                      <SelectItem value="no_answer">{lang === 'en' ? 'No Answer' : 'Sin respuesta'}</SelectItem>
                      <SelectItem value="rescheduled">{lang === 'en' ? 'Rescheduled' : 'Reprogramado'}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mt-4">
            <FormField
              control={form.control}
              name="next_action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{lang === 'en' ? 'Next Action' : 'Próxima Acción'}</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder={lang === 'en' ? 'What needs to happen next?' : '¿Qué necesita suceder después?'} {...field} />
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
              : (lang === 'en' ? 'Save Activity' : 'Guardar Actividad')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
