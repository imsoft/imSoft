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
import { PasswordInput } from "@/components/ui/password-input"
import { useState, useEffect } from "react"
import type { Dictionary, Locale } from '../dictionaries'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

interface ResetPasswordFormProps {
  dict: Dictionary
  lang: Locale
}

const createFormSchema = (dict: Dictionary) => z.object({
  password: z.string().min(6, {
    message: dict.auth.resetPassword.errors.passwordMin,
  }).min(1, {
    message: dict.auth.resetPassword.errors.passwordRequired,
  }),
  confirmPassword: z.string().min(1, {
    message: dict.auth.resetPassword.errors.passwordRequired,
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: dict.auth.resetPassword.errors.passwordsMatch,
  path: ["confirmPassword"],
})

export default function ResetPasswordForm({ dict, lang }: ResetPasswordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const formSchema = createFormSchema(dict)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Verificar que hay un token en la URL
  useEffect(() => {
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    
    if (!token || type !== 'recovery') {
      setError(dict.auth.resetPassword.errors.invalidToken)
    }
  }, [searchParams, dict])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // Actualizar la contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (updateError) {
        // Si el error es por token inválido o expirado
        if (updateError.message.includes('token') || updateError.message.includes('expired')) {
          setError(dict.auth.resetPassword.errors.invalidToken)
        } else {
          setError(dict.auth.resetPassword.errors.generic)
        }
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push(`/${lang}/login`)
        router.refresh()
      }, 2000)
    } catch (err) {
      setError(dict.auth.resetPassword.errors.generic)
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
          {dict.auth.resetPassword.success}
        </div>
        <div className="text-center">
          <Link
            href={`/${lang}/login`}
            className="font-semibold text-primary hover:text-primary/80"
          >
            {dict.auth.resetPassword.backToLogin}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <p className="text-sm text-muted-foreground">
          {dict.auth.resetPassword.description}
        </p>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {dict.auth.resetPassword.password}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  className="!border-border/90 block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-foreground">
                {dict.auth.resetPassword.confirmPassword}
              </FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
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
            {isSubmitting ? dict.auth.resetPassword.submitting : dict.auth.resetPassword.submit}
          </Button>
        </div>

        <div className="text-center">
          <Link
            href={`/${lang}/login`}
            className="text-sm font-semibold text-primary hover:text-primary/80"
          >
            {dict.auth.resetPassword.backToLogin}
          </Link>
        </div>
      </form>
    </Form>
  )
}
