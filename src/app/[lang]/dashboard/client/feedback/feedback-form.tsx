'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Dictionary, Locale } from '@/app/[lang]/dictionaries'

const feedbackSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
})

type FeedbackFormValues = z.infer<typeof feedbackSchema>

interface FeedbackFormProps {
  dict: Dictionary
  lang: Locale
  userId: string
}

export function FeedbackForm({ dict, lang, userId }: FeedbackFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClient()

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  async function onSubmit(values: FeedbackFormValues) {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          user_id: userId,
          title: values.title,
          description: values.description,
          status: 'pending',
        })

      if (error) throw error

      form.reset()
      router.push(`/${lang}/dashboard/client/feedback`)
      router.refresh()
      toast.success(dict.feedback.submitSuccess)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error(dict.feedback.submitError, {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dict.feedback.titleLabel}</FormLabel>
              <FormControl>
                <Input {...field} className="w-full !border-2 border-border focus-visible:!border-2 focus-visible:border-ring" />
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
              <FormLabel>{dict.feedback.descriptionLabel}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={6}
                  className="resize-none w-full border-2 border-border focus-visible:border-2 focus-visible:border-ring"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? dict.feedback.submitting : dict.feedback.submit}
          </Button>
        </div>
      </form>
    </Form>
  )
}

