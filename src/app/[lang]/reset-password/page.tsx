import { Suspense } from 'react'
import ResetPasswordForm from './reset-password-form'
import { HeroHeader } from "@/components/blocks/hero-section"
import { FooterSection } from "@/components/blocks/footer-section"
import { Logo } from "@/components/blocks/hero-section"
import { getDictionary, hasLocale, type Locale, type Dictionary } from '../dictionaries'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Skeleton } from '@/components/ui/skeleton'

function ResetPasswordContent({ dict, lang }: { dict: Dictionary, lang: Locale }) {
  return (
    <div>
      <HeroHeader dict={dict} lang={lang} />
      <main className="pt-24">
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <div className="mx-auto flex justify-center">
              <Logo />
            </div>
            <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-foreground">
              {dict.auth.resetPassword.title}
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <ResetPasswordForm dict={dict} lang={lang} />
          </div>
        </div>
      </main>
      <FooterSection dict={dict} lang={lang} contactData={undefined} />
    </div>
  )
}

export default async function ResetPasswordPage({ params }: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const locale = lang as Locale
  const dict = await getDictionary(locale)
  const supabase = await createClient()
  
  // Obtener datos de contacto
  const { data: contactData } = await supabase
    .from('contact')
    .select('*')
    .limit(1)
    .maybeSingle()

  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm space-y-6">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <div className="space-y-4 mt-10">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent dict={dict} lang={locale} />
    </Suspense>
  )
}
