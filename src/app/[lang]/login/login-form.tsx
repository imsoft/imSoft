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
import { useRef, useState } from "react"
import type { Dictionary } from '../dictionaries'
import type { LoginFormProps } from '@/types/auth'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { GoogleButton } from '@/components/ui/google-button'
import { Captcha } from '@/components/ui/captcha'
import type { TurnstileInstance } from '@marsidev/react-turnstile'
import { roleOf } from '@/lib/roles'

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
  const [captchaToken, setCaptchaToken] = useState<string>()
  const captchaRef = useRef<TurnstileInstance>(undefined)
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

    if (!captchaToken) {
      setError(dict.auth.login.errors.captchaRequired)
      setIsSubmitting(false)
      return
    }

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
        options: { captchaToken },
      })

      if (signInError) {
        // The token is consumed on every attempt: get a new one.
        captchaRef.current?.reset()
        setCaptchaToken(undefined)
        setError(dict.auth.login.errors.invalidCredentials)
        setIsSubmitting(false)
        return
      }

      // Wait a moment for the cookies to be set
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Get the user to check their role
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // TODO: check the user's role from the database
        // For now, redirect to a default dashboard
        // In production, check the role from user_metadata or a users table
        const userRole = roleOf(user)
        
        // Use window.location to force a full reload so the cookies are read
        if (userRole === 'admin') {
          window.location.href = `/${lang}/dashboard/admin`
        } else {
          window.location.href = `/${lang}/dashboard/client`
        }
      } else {
        window.location.href = `/${lang}`
      }
    } catch {
      captchaRef.current?.reset()
      setCaptchaToken(undefined)
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
                    className="border-border/90! block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm"
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
                    className="border-border/90! block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm"
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

          <Captcha
            ref={captchaRef}
            onVerify={setCaptchaToken}
            onExpireOrError={() => setCaptchaToken(undefined)}
          />

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

