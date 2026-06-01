import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyUnsubscribe } from '@/lib/email/unsubscribe'

/**
 * Baja de correos del blog. Enlace público firmado con HMAC.
 * No requiere sesión: el token del enlace prueba que el dueño del correo lo abrió.
 *
 * Marca user_metadata.email_opt_in = false y redirige a una página de confirmación.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const userId = searchParams.get('u') || ''
  const token = searchParams.get('t') || ''
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'es'

  const redirect = (status: 'success' | 'invalid' | 'error') =>
    NextResponse.redirect(`${origin}/${lang}/unsubscribe?status=${status}`)

  if (!verifyUnsubscribe(userId, token)) {
    return redirect('invalid')
  }

  try {
    const admin = createAdminClient()

    // Conservamos el resto del metadata y solo cambiamos el opt-in.
    const { data: userData, error: getError } = await admin.auth.admin.getUserById(userId)
    if (getError || !userData?.user) {
      return redirect('invalid')
    }

    const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        email_opt_in: false,
      },
    })
    if (updateError) {
      console.error('[unsubscribe] Error actualizando usuario:', updateError.message)
      return redirect('error')
    }

    return redirect('success')
  } catch (e) {
    console.error('[unsubscribe] Error:', e)
    return redirect('error')
  }
}
