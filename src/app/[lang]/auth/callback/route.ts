import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { roleOf } from '@/lib/roles'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lang: string }> }
) {
  const { lang } = await params
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Get the user to check their role and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Check whether this is a new Google OAuth user
        const isNewGoogleUser = !user.user_metadata?.role && user.app_metadata?.provider === 'google'

        if (isNewGoogleUser) {
          // Extract the full name from Google
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
          const nameParts = fullName.split(' ')
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''

          // Update the user's metadata with the full info
          await supabase.auth.updateUser({
            data: {
              role: 'client',
              full_name: fullName,
              first_name: firstName,
              last_name: lastName,
              company_name: '', // The user can fill this in later
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            }
          })

          // Redirect to the client dashboard
          return NextResponse.redirect(`${requestUrl.origin}/${lang}/dashboard/client`)
        }

        // For existing users, redirect by role
        const userRole = roleOf(user)

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

