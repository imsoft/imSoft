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
import { useState } from "react"
import type { Dictionary, Locale } from '../dictionaries'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ForgotPasswordFormProps {
  dict: Dictionary
  lang: Locale
}

const createFormSchema = (dict: Dictionary) => z.object({
  email: z.string().email({
    message: dict.auth.forgotPassword.errors.invalidEmail,
  }).min(1, {
    message: dict.auth.forgotPassword.errors.emailRequired,
  }),
})

export default function ForgotPasswordForm({ dict, lang }: ForgotPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const formSchema = createFormSchema(dict)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const redirectTo = `${SITE_URL}/${lang}/reset-password`

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo,
      })

      if (resetError) {
        setError(dict.auth.forgotPassword.errors.generic)
        setIsSubmitting(false)
        return
      }

      // Siempre mostrar éxito por seguridad (no revelar si el email existe)
      setSuccess(true)
      setIsSubmitting(false)
      form.reset()
    } catch (err) {
      setError(dict.auth.forgotPassword.errors.generic)
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
          {dict.auth.forgotPassword.success}
        </div>
        <div className="text-center">
          <Link
            href={`/${lang}/login`}
            className="font-semibold text-primary hover:text-primary/80"
          >
            {dict.auth.forgotPassword.backToLogin}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <p className="text-sm text-muted-foreground">
          {dict.auth.forgotPassword.description}
        </p>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {dict.auth.forgotPassword.email}
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  className="!border-border/90 block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {isSubmitting ? dict.auth.forgotPassword.submitting : dict.auth.forgotPassword.submit}
          </Button>
        </div>

        <div className="text-center">
          <Link
            href={`/${lang}/login`}
            className="text-sm font-semibold text-primary hover:text-primary/80"
          >
            {dict.auth.forgotPassword.backToLogin}
          </Link>
        </div>
      </form>
    </Form>
  )
}
