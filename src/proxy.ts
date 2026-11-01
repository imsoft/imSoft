import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { createServerClient } from '@supabase/ssr'

const locales = ['en', 'es']
// Mexican business whose main market speaks Spanish: the default language must be
// 'es' for users/bots without a clear preference (matches x-default=es).
const defaultLocale = 'es'

function getLocale(request: NextRequest): string {
  const headers = {
    // Without the header (Googlebot and most crawlers don't send it) we use the
    // business's default language, not 'en'. This fallback used to override
    // defaultLocale and made Google index the whole site in English.
    'accept-language': request.headers.get('accept-language') || defaultLocale,
  }
  const languages = new Negotiator({ headers }).languages()
  return match(languages, locales, defaultLocale)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  // `let`: if Supabase refreshes the session, the response is rebuilt from the updated
  // request, so the page reads the new cookies instead of the expired ones.
  const createResponse = () => pathnameHasLocale
    ? NextResponse.next({ request })
    : NextResponse.redirect(new URL(`/${getLocale(request)}${pathname}`, request.url))
  let response = createResponse()

  // Supabase client that refreshes sessions
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = createResponse()
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set the cookie on the response with options that ensure it persists
            response.cookies.set(name, value, {
              ...options,
              path: options?.path || '/',
              sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') || 'lax',
              secure: options?.secure ?? (process.env.NODE_ENV === 'production'),
              httpOnly: options?.httpOnly ?? false,
              // Without maxAge, set a default one for session cookies
              maxAge: options?.maxAge || (name.includes('auth-token') || name.includes('supabase') ? 60 * 60 * 24 * 7 : undefined),
            })
          })
        },
      },
    }
  )

  // Refresh the session automatically: this updates the session cookies
  // when they're close to expiring
  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|.*\\..*).*)',
  ],
}

