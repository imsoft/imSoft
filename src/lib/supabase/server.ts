import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                ...options,
                // Asegurar que las cookies persistan
                path: options?.path || '/',
                sameSite: options?.sameSite || 'lax',
                secure: options?.secure ?? process.env.NODE_ENV === 'production',
                httpOnly: options?.httpOnly ?? false,
                maxAge: options?.maxAge || 60 * 60 * 24 * 7, // 7 días por defecto
              })
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

