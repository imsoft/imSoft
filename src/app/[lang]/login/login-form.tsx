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
import { PasswordInput } from "@/components/ui/password-input"
import { useState } from "react"
import type { Dictionary, Locale } from '../dictionaries'
import type { LoginFormProps } from '@/types/auth'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { GoogleButton } from '@/components/ui/google-button'

const createFormSchema = (dict: Dictionary) => z.object({
  email: z.string().email({
    message: dict.auth.login.errors.invalidEmail,
  }).min(1, {
    message: dict.auth.login.errors.emailRequired,
  }),
  password: z.string().min(1, {
    message: dict.auth.login.errors.passwordRequired,
  }),
})

export default function LoginForm({ dict, lang }: LoginFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const formSchema = createFormSchema(dict)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (signInError) {
        setError(dict.auth.login.errors.invalidCredentials)
        setIsSubmitting(false)
        return
      }

      // Obtener el usuario para verificar su rol
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // TODO: Verificar el rol del usuario desde la base de datos
        // Por ahora, redirigimos a un dashboard por defecto
        // En producción, deberías verificar el rol desde user_metadata o una tabla de usuarios
        const userRole = user.user_metadata?.role || 'client'
        
        if (userRole === 'admin') {
          router.push(`/${lang}/dashboard/admin`)
        } else {
          router.push(`/${lang}/dashboard/client`)
        }
        router.refresh()
      } else {
        router.push(`/${lang}`)
        router.refresh()
      }
    } catch (err) {
      setError(dict.auth.login.errors.invalidCredentials)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  {dict.auth.login.email}
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium text-foreground">
                    {dict.auth.login.password}
                  </FormLabel>
                  <div className="text-sm">
                    <Link
                      href={`/${lang}/forgot-password`}
                      className="font-semibold text-primary hover:text-primary/80"
                    >
                      {dict.auth.login.forgotPassword}
                    </Link>
                  </div>
                </div>
                <FormControl>
                  <PasswordInput
                    {...field}
                    autoComplete="current-password"
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
              {isSubmitting ? (lang === 'en' ? 'Signing in...' : 'Iniciando sesión...') : dict.auth.login.submit}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-2 text-muted-foreground">
              {lang === 'en' ? 'Or continue with' : 'O continuar con'}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleButton lang={lang} mode="signin" />
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        {dict.auth.login.noAccount}{' '}
        <Link
          href={`/${lang}/signup`}
          className="font-semibold text-primary hover:text-primary/80"
        >
          {dict.auth.login.signUpLink}
        </Link>
      </p>
    </>
  );
}

