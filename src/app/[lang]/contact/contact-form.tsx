'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import type { Dictionary } from '../dictionaries'
import type { ContactFormProps } from '@/types/components'
import Magnet from "@/components/ui/magnet"

const formValidation = (dict: Dictionary) => {
  const v = (dict.contact?.form as { validation?: Record<string, string> })?.validation;
  return {
    firstNameMin: v?.firstNameMin ?? 'First name must be at least 2 characters.',
    lastNameMin: v?.lastNameMin ?? 'Last name must be at least 2 characters.',
    emailInvalid: v?.emailInvalid ?? 'Must be a valid email.',
    messageMin: v?.messageMin ?? 'Message must be at least 10 characters.',
  };
};

const createFormSchema = (dict: Dictionary) => {
  const val = formValidation(dict);
  return z.object({
    firstName: z.string().min(2, { message: val.firstNameMin }),
    lastName: z.string().min(2, { message: val.lastNameMin }),
    email: z.string().email({ message: val.emailInvalid }),
    phoneNumber: z.string().optional(),
    message: z.string().min(10, { message: val.messageMin }),
  });
};

export default function ContactForm({ dict }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const formSchema = createFormSchema(dict)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar el mensaje')
      }

      setSubmitStatus('success')
      form.reset()

      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    } catch (error) {
      console.error('Error:', error)
      setSubmitStatus('error')

      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  {(dict.contact?.form as Record<string, string> | undefined)?.firstName ?? 'First name'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="given-name"
                    className="!border-border/90"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  {(dict.contact?.form as Record<string, string> | undefined)?.lastName ?? 'Last name'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="family-name"
                    className="!border-border/90"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-sm font-semibold">
                  {(dict.contact?.form as Record<string, string> | undefined)?.email ?? 'Email'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    autoComplete="email"
                    className="!border-border/90"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-sm font-semibold">
                  {(dict.contact?.form as Record<string, string> | undefined)?.phoneNumber ?? 'Phone number'}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="tel"
                    autoComplete="tel"
                    className="!border-border/90"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel className="text-sm font-semibold">
                  {(dict.contact?.form as Record<string, string> | undefined)?.message ?? 'Message'}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    className="!border-border/90"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {submitStatus === 'success' && (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400">
            {(dict.contact?.form as Record<string, string> | undefined)?.success ?? 'Message sent successfully!'}
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
            {(dict.contact?.form as Record<string, string> | undefined)?.error ?? 'Error sending message. Please try again.'}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Magnet padding={50} disabled={false} magnetStrength={10}>
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="rounded-md bg-primary px-3.5 py-2.5 text-center text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {isSubmitting ? (dict.contact?.form as Record<string, string> | undefined)?.sending ?? 'Sending...' : (dict.contact?.form as Record<string, string> | undefined)?.send ?? 'Send message'}
            </Button>
          </Magnet>
        </div>
      </form>
    </Form>
  );
}
