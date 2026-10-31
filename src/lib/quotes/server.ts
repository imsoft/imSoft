import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getResend } from '@/lib/email/resend-client'
import { esAdmin } from '@/lib/roles'

/** Service-role client: for the public token pages and for sending email. */
export function serviceClient() {
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
}

/** Checks that the request comes from an authenticated admin. */
export async function requireAdmin(): Promise<{ ok: true; userId: string } | { ok: false; status: number; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, status: 401, error: 'Unauthorized' }
  if (!esAdmin(user)) return { ok: false, status: 403, error: 'Forbidden' }
  return { ok: true, userId: user.id }
}

export function clientIp(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'desconocida'
}

export async function sendEmail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  const from = process.env.RESEND_FROM_EMAIL || 'contacto@imsoft.io'
  await getResend().emails.send({ from: `imSoft <${from}>`, to: opts.to, replyTo: opts.replyTo, subject: opts.subject, html: opts.html })
}

export const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'contacto@imsoft.io'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.imsoft.io'

export function esc(s: string | null | undefined): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
