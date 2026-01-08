import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const lang = requestUrl.searchParams.get('lang') || 'es'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Obtener el usuario para verificar su rol y redirigir apropiadamente
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const userRole = user.user_metadata?.role || 'client'

        // Si es la primera vez que inicia sesión con Google y no tiene rol, asignarlo como cliente
        if (!user.user_metadata?.role) {
          await supabase.auth.updateUser({
            data: {
              role: 'client',
              full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            }
          })

          // Redirigir a dashboard de cliente
          return NextResponse.redirect(`${requestUrl.origin}/${lang}/dashboard/client`)
        }

        // Redirigir según el rol
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
