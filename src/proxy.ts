import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { createServerClient } from '@supabase/ssr'

const locales = ['en', 'es']
const defaultLocale = 'en'

function getLocale(request: NextRequest): string {
  const headers = {
    'accept-language': request.headers.get('accept-language') || 'en',
  }
  const languages = new Negotiator({ headers }).languages()
  return match(languages, locales, defaultLocale)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  let response = pathnameHasLocale 
    ? NextResponse.next()
    : NextResponse.redirect(new URL(`/${getLocale(request)}${pathname}`, request.url))

  // Configurar cliente de Supabase para actualizar sesiones
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            // Establecer cookie en la respuesta con opciones que aseguren persistencia
            response.cookies.set(name, value, {
              ...options,
              path: options?.path || '/',
              sameSite: (options?.sameSite as 'lax' | 'strict' | 'none') || 'lax',
              secure: options?.secure ?? (process.env.NODE_ENV === 'production'),
              httpOnly: options?.httpOnly ?? false,
              // Si no hay maxAge, establecer uno por defecto para cookies de sesión
              maxAge: options?.maxAge || (name.includes('auth-token') || name.includes('supabase') ? 60 * 60 * 24 * 7 : undefined),
            })
          })
        },
      },
    }
  )

  // Refrescar la sesión automáticamente
  // Esto actualiza las cookies de sesión si están cerca de expirar
  await supabase.auth.getSession()

  return response
}

export const config = {
  matcher: [
    '/((?!_next|api|favicon.ico|.*\\..*).*)',
  ],
}

