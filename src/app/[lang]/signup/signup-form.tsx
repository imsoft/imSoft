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
import type { SignupFormProps } from '@/types/auth'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { GoogleButton } from '@/components/ui/google-button'

const createFormSchema = (dict: Dictionary) => z.object({
  firstName: z.string().min(2, {
    message: dict.auth.signup.errors.firstNameMin,
  }).min(1, {
    message: dict.auth.signup.errors.firstNameRequired,
  }),
  lastName: z.string().min(2, {
    message: dict.auth.signup.errors.lastNameMin,
  }).min(1, {
    message: dict.auth.signup.errors.lastNameRequired,
  }),
  companyName: z.string().min(2, {
    message: dict.auth.signup.errors.companyNameMin,
  }).min(1, {
    message: dict.auth.signup.errors.companyNameRequired,
  }),
  email: z.string().email({
    message: dict.auth.signup.errors.invalidEmail,
  }).min(1, {
    message: dict.auth.signup.errors.emailRequired,
  }),
  password: z.string().min(6, {
    message: dict.auth.signup.errors.passwordMin,
  }).min(1, {
    message: dict.auth.signup.errors.passwordRequired,
  }),
  confirmPassword: z.string().min(1, {
    message: dict.auth.signup.errors.passwordRequired,
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: dict.auth.signup.errors.passwordsMatch,
  path: ["confirmPassword"],
})

export default function SignupForm({ dict, lang }: SignupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const formSchema = createFormSchema(dict)
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/${lang}`,
          data: {
            first_name: values.firstName,
            last_name: values.lastName,
            company_name: values.companyName,
            full_name: `${values.firstName} ${values.lastName}`,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError(dict.auth.signup.errors.emailExists)
        } else {
          setError(signUpError.message)
        }
        setIsSubmitting(false)
        return
      }

      setSuccess(true)
      form.reset()
      
      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push(`/${lang}/login`)
      }, 2000)
    } catch (err) {
      setError(dict.auth.signup.errors.emailExists)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    {dict.auth.signup.firstName}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      autoComplete="given-name"
                      className="!border-border/90 block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm"
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
                  <FormLabel className="text-sm font-medium text-foreground">
                    {dict.auth.signup.lastName}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      autoComplete="family-name"
                      className="!border-border/90 block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  {dict.auth.signup.companyName}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    autoComplete="organization"
                    className="!border-border/90 block w-full rounded-md bg-background px-3 py-1.5 text-base text-foreground outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm"
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
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  {dict.auth.signup.email}
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
                <FormLabel className="text-sm font-medium text-foreground">
                  {dict.auth.signup.password}
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
                  {dict.auth.signup.confirmPassword}
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

          {success && (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm">
              {dict.auth.signup.success}
            </div>
          )}

          <div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {isSubmitting ? (lang === 'en' ? 'Creating account...' : 'Creando cuenta...') : dict.auth.signup.submit}
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
              {lang === 'en' ? 'Or sign up with' : 'O registrarse con'}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleButton lang={lang} mode="signup" />
        </div>
      </div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        {dict.auth.signup.hasAccount}{' '}
        <Link
          href={`/${lang}/login`}
          className="font-semibold text-primary hover:text-primary/80"
        >
          {dict.auth.signup.signInLink}
        </Link>
      </p>
    </>
  );
}

