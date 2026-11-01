import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { roleOf } from '@/lib/roles'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const lang = requestUrl.searchParams.get('lang') || 'es'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user to check their role and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const userRole = roleOf(user)

        // First Google sign-in with no role yet: assign the client role
        if (!user.user_metadata?.role) {
          await supabase.auth.updateUser({
            data: {
              role: 'client',
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            }
          })

          // Redirect to the client dashboard
          return NextResponse.redirect(`${requestUrl.origin}/${lang}/dashboard/client`)
        }

        // Redirect by role
        if (userRole === 'admin') {
          return NextResponse.redirect(`${requestUrl.origin}/${lang}/dashboard/admin`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/${lang}/dashboard/client`)
        }
      }
    }
  }

  // On error, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/${lang}/login?error=auth_error`)
}
