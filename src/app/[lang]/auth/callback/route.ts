import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
      // Obtener el usuario para verificar su rol y redirigir apropiadamente
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Verificar si es un usuario nuevo de Google OAuth
        const isNewGoogleUser = !user.user_metadata?.role && user.app_metadata?.provider === 'google'

        if (isNewGoogleUser) {
          // Extraer nombre completo de Google
          const fullName = user.user_metadata?.full_name || user.user_metadata?.name || ''
          const nameParts = fullName.split(' ')
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''

          // Actualizar metadata del usuario con información completa
          await supabase.auth.updateUser({
            data: {
              role: 'client',
              full_name: fullName,
              first_name: firstName,
              last_name: lastName,
              company_name: '', // El usuario puede completar esto después
              avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || '',
            }
          })

          // Redirigir a dashboard de cliente
          return NextResponse.redirect(`${requestUrl.origin}/${lang}/dashboard/client`)
        }

        // Para usuarios existentes, redirigir según el rol
        const userRole = user.user_metadata?.role || 'client'

        if (userRole === 'admin') {
          return NextResponse.redirect(`${requestUrl.origin}/${lang}/dashboard/admin`)
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/${lang}/dashboard/client`)
        }
      }
    }
  }

  // Si hay error, redirigir al login
  return NextResponse.redirect(`${requestUrl.origin}/${lang}/login?error=auth_error`)
}

