import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyUnsubscribe } from '@/lib/email/unsubscribe'

/**
 * Blog email unsubscribe. Public link signed with HMAC.
 * No session required: the link token proves the mailbox owner opened it.
 *
 * Sets user_metadata.email_opt_in = false and redirects to a confirmation page.
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

    // Keep the rest of the metadata and only change the opt-in.
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
